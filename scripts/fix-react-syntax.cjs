#!/usr/bin/env node

/**
 * Script para corregir errores comunes de importación de React y sintaxis en archivos TypeScript/TSX
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorio raíz del proyecto
const rootDir = path.resolve(__dirname, '..');

// Función para recorrer todos los archivos
function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);

    if (stat.isDirectory() && !filepath.includes('node_modules') && !filepath.includes('.git')) {
      filelist = walkSync(filepath, filelist);
    } else if (stat.isFile() && (filepath.endsWith('.tsx') || filepath.endsWith('.ts'))) {
      filelist.push(filepath);
    }
  });

  return filelist;
}

// Obtener todos los archivos TypeScript
const files = walkSync(rootDir);

console.log(`Encontrados ${files.length} archivos para revisar`);

// Contadores para estadísticas
let fixedFiles = 0;
let totalFixedIssues = 0;

// Correcciones a aplicar
const fixers = [
  {
    name: 'Corrección de importación de React',
    pattern: /import\s+\*\s+as\s+React,\s*{([^}]+)}\s+from\s+['"]react['"];?/g,
    replace: (match, imports) => `import * as React from 'react';\nimport { ${imports.trim()} } from 'react';`,
    count: 0
  },
  {
    name: 'React.createElement con atributos incorrectos',
    pattern: /React\.createElement\('([^']+)',\s*{\s*([^}]*)\s*className:\s*"([^"]+)"\s*([^}]*)\s*}/g,
    replace: (match, element, before, className, after) => {
      // Limpiar atributos y asegurar que estén correctamente formateados
      const fixedBefore = before ? before.replace(/:\s*$/g, '').trim() : '';
      const fixedAfter = after ? after.replace(/^:\s*/g, '').trim() : '';

      let attrs = [];
      if (fixedBefore) attrs.push(fixedBefore);
      attrs.push(`className: "${className}"`);
      if (fixedAfter) attrs.push(fixedAfter);

      return `React.createElement('${element}', { ${attrs.join(', ')} }`;
    },
    count: 0
  },
  {
    name: 'Setter de estado sin paréntesis',
    pattern: /set([A-Z][a-zA-Z0-9]*);/g,
    replace: (match, stateVar) => {
      // Determinar qué valor usar
      if (stateVar === 'Loading') return `setLoading(false);`;
      if (stateVar === 'Error') return `setError(null);`;
      if (stateVar.includes('Stats')) return `setStats(cacheStats);`;
      return `set${stateVar}(null);`;
    },
    count: 0
  },
  {
    name: 'setInterval sin argumentos',
    pattern: /const interval = setInterval;/g,
    replace: 'const interval = setInterval(() => loadStats(), 30000);',
    count: 0
  },
  {
    name: 'clearInterval sin argumentos',
    pattern: /clearInterval;/g,
    replace: 'clearInterval(interval);',
    count: 0
  },
  {
    name: 'Método updateConfig sin paréntesis',
    pattern: /cachePrioritizationService\.updateConfig;/g,
    replace: 'cachePrioritizationService.updateConfig(settings);',
    count: 0
  },
  {
    name: 'Método handleDismiss incompleto',
    pattern: /if\s*\(true\)\s*{\s*onDismiss;\s*}/g,
    replace: 'if (onDismiss) { onDismiss(id); }',
    count: 0
  },
  {
    name: 'Parámetros de función faltantes',
    pattern: /ref\{\s*=>/g,
    replace: 'ref={el =>',
    count: 0
  },
  {
    name: 'Atributos de Alerta mal formateados',
    pattern: /variant:\s*([^,\n]+)\s*\n\s*title:\s*([^,\n]+)\s*\n\s*icon:\s*([^,\n]+)\s*\n\s*onClose:\s*([^,\n]+)\s*\n\s*className:\s*([^,\n}]+)/g,
    replace: 'variant: $1,\n      title: $2,\n      icon: $3,\n      onClose: $4,\n      className: $5',
    count: 0
  },
  {
    name: 'Error en mapeo de recomendaciones',
    pattern: /{recommendations\.map\(\(item\)\s*=>\s*\(\s*<li key=\{index\}>\{recommendation\}<\/li>\s*\)\)}/g,
    replace: '{recommendations.map((recommendation, index) => (<li key={index}>{recommendation}</li>))}',
    count: 0
  },
  {
    name: 'Error en className template string',
    pattern: /className:\s*`clinical-alert \$\{className`}/g,
    replace: 'className: `clinical-alert ${className}`',
    count: 0
  },
  {
    name: 'Error en Try-Catch sin parámetro',
    pattern: /catch\s*\{\s*([^}]+)\}/g,
    replace: 'catch (err) {\n      $1\n    }',
    count: 0
  }
];

// Procesar cada archivo
files.forEach(filepath => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;
    let hasChanges = false;

    // Reiniciar contadores
    fixers.forEach(fixer => {
      fixer.count = 0;
    });

    // Aplicar cada corrector
    fixers.forEach(fixer => {
      const matches = content.match(fixer.pattern);

      if (matches) {
        fixer.count = matches.length;
        totalFixedIssues += matches.length;
        content = content.replace(fixer.pattern, fixer.replace);
        hasChanges = true;
      }
    });

    // Si se hicieron cambios, guardar el archivo
    if (hasChanges) {
      fs.writeFileSync(filepath, content, 'utf8');
      fixedFiles++;

      console.log(`Corregido: ${filepath.replace(rootDir, '')}`);
      fixers.forEach(fixer => {
        if (fixer.count > 0) {
          console.log(`  - ${fixer.name}: ${fixer.count} ocurrencias`);
        }
      });
    }
  } catch (error) {
    console.error(`Error procesando ${filepath}:`, error);
  }
});

console.log(`
Resumen:
- ${fixedFiles} archivos corregidos
- ${totalFixedIssues} problemas solucionados
`);

// Verificar si hay mejoras en los errores de TypeScript
try {
  console.log('Verificando errores de TypeScript después de las correcciones...');
  execSync('npx tsc --noEmit --incremental false src/components/admin/CacheControlPanel.tsx', {
    stdio: 'inherit'
  });
  console.log('✅ El componente CacheControlPanel.tsx se verifica correctamente');
} catch (error) {
  console.log('⚠️ Todavía hay errores de TypeScript por resolver en CacheControlPanel.tsx');
}

try {
  execSync('npx tsc --noEmit --incremental false src/components/alerts/ClinicalAlert.tsx', {
    stdio: 'inherit'
  });
  console.log('✅ El componente ClinicalAlert.tsx se verifica correctamente');
} catch (error) {
  console.log('⚠️ Todavía hay errores de TypeScript por resolver en ClinicalAlert.tsx');
}
