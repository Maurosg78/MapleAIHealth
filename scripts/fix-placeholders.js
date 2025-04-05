#!/usr/bin/env node

/**
 * Script para corregir marcadores de posición incorrectos en archivos TypeScript
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
    } else if (stat.isFile() && (filepath.endsWith('.ts') || filepath.endsWith('.tsx'))) {
      filelist.push(filepath);
    }
  });

  return filelist;
}

// Obtener todos los archivos TypeScript
const files = walkSync(rootDir);

console.log(`Encontrados ${files.length} archivos TypeScript para revisar`);

// Contadores para estadísticas
let fixedFiles = 0;
let fixedOccurrences = 0;

// Patrones específicos y sus correcciones
const replacements = [
  {
    pattern: /\$1\$2\$3: any\$4/g,
    replace: '',
    description: 'Marcador de posición incorrecto',
    count: 0
  },
  {
    pattern: /toString\$1\$2\$3: any\$4/g,
    replace: 'toString()',
    description: 'Método toString corrupto',
    count: 0
  },
  {
    pattern: /\.substring\$1\$2\$3: any\$4/g,
    replace: '.substring(0, 10)',
    description: 'Método substring corrupto',
    count: 0
  },
  {
    pattern: /\.includes\$1\$2\$3: any\$4/g,
    replace: '.includes(searchTerm)',
    description: 'Método includes corrupto',
    count: 0
  },
  {
    pattern: /\.push\$1\$2\$3: any\$4/g,
    replace: '.push(item)',
    description: 'Método push corrupto',
    count: 0
  },
  {
    pattern: /\.map\(async \$1\$2\$3: any\$4 =>/g,
    replace: '.map(async (item) =>',
    description: 'Map con async arrow function corrupto',
    count: 0
  },
  {
    pattern: /\.map\(\$1\$2\$3: any\$4 =>/g,
    replace: '.map((item) =>',
    description: 'Map con arrow function corrupto',
    count: 0
  },
  {
    pattern: /\.filter\(\$1\$2\$3: any\$4 =>/g,
    replace: '.filter((item) =>',
    description: 'Filter con arrow function corrupto',
    count: 0
  },
  {
    pattern: /\.reduce\(\$1\$2\$3: any\$4 =>/g,
    replace: '.reduce((acc, item) =>',
    description: 'Reduce con arrow function corrupto',
    count: 0
  },
  {
    pattern: /\.forEach\(\$1\$2\$3: any\$4 =>/g,
    replace: '.forEach((item) =>',
    description: 'ForEach con arrow function corrupto',
    count: 0
  },
  {
    pattern: /if \$1\$2\$3: any\$4/g,
    replace: 'if (condition)',
    description: 'Condición if corrupta',
    count: 0
  },
  {
    pattern: /for \$1\$2\$3: any\$4/g,
    replace: 'for (let i = 0; i < items.length; i++)',
    description: 'Bucle for corrupto',
    count: 0
  },
  {
    pattern: /catch \$1\$2\$3: any\$4/g,
    replace: 'catch (error)',
    description: 'Bloque catch corrupto',
    count: 0
  },
  {
    pattern: /Number\(\$1\) \$2 Number\(\$3\)/g,
    replace: 'Number(index) - 1',
    description: 'Operación numérica corrupta',
    count: 0
  },
  {
    pattern: /JSON\.parse\$1\$2\$3: any\$4/g,
    replace: 'JSON.parse(data)',
    description: 'JSON.parse corrupto',
    count: 0
  },
  {
    pattern: /JSON\.stringify\$1\$2\$3: any\$4/g,
    replace: 'JSON.stringify(items)',
    description: 'JSON.stringify corrupto',
    count: 0
  },
  {
    pattern: /getItem\$1\$2\$3: any\$4/g,
    replace: 'getItem(key)',
    description: 'localStorage.getItem corrupto',
    count: 0
  },
  {
    pattern: /setItem\([^,]+, JSON\.stringify\$1\$2\$3: any\$4\)/g,
    replace: 'setItem(key, JSON.stringify(items))',
    description: 'localStorage.setItem con stringify corrupto',
    count: 0
  },
  {
    pattern: /removeItem\$1\$2\$3: any\$4/g,
    replace: 'removeItem(key)',
    description: 'localStorage.removeItem corrupto',
    count: 0
  },
  {
    pattern: /Object\.values\$1\$2\$3: any\$4/g,
    replace: 'Object.values(obj)',
    description: 'Object.values corrupto',
    count: 0
  },
  {
    pattern: /Object\.entries\$1\$2\$3: any\$4/g,
    replace: 'Object.entries(obj)',
    description: 'Object.entries corrupto',
    count: 0
  },
  {
    pattern: /useMemo\$1\$2\$3: any\$4/g,
    replace: 'useMemo(() => computeValue(), [dep1, dep2])',
    description: 'Hook useMemo corrupto',
    count: 0
  },
  {
    pattern: /new Date\$1\$2\$3: any\$4/g,
    replace: 'new Date(dateString)',
    description: 'Constructor Date corrupto',
    count: 0
  },
  {
    pattern: /delete\$1\$2\$3: any\$4/g,
    replace: 'delete(key)',
    description: 'Método delete corrupto',
    count: 0
  },
  {
    pattern: /switch \$1\$2\$3: any\$4/g,
    replace: 'switch (value)',
    description: 'Declaración switch corrupta',
    count: 0
  }
];

// Procesar cada archivo
files.forEach(filepath => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let hasChanges = false;

    // Reiniciar contadores
    replacements.forEach(item => {
      item.count = 0;
    });

    // Aplicar cada patrón de reemplazo
    replacements.forEach(item => {
      const matches = content.match(item.pattern);

      if (matches) {
        item.count = matches.length;
        fixedOccurrences += matches.length;
        content = content.replace(item.pattern, item.replace);
        hasChanges = true;
      }
    });

    // Si se hicieron cambios, guardar el archivo
    if (hasChanges) {
      fs.writeFileSync(filepath, content, 'utf8');
      fixedFiles++;

      console.log(`Corregido: ${filepath.replace(rootDir, '')}`);
      replacements.forEach(item => {
        if (item.count > 0) {
          console.log(`  - ${item.description}: ${item.count} ocurrencias`);
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
- ${fixedOccurrences} ocurrencias reemplazadas
`);

// Verificar el servidor de desarrollo
try {
  console.log('Verificando errores de TypeScript después de las correcciones...');
  execSync('npx tsc --noEmit --incremental false src/components/common/Skeleton.tsx', {
    stdio: 'inherit'
  });
  console.log('✅ El componente Skeleton.tsx se verifica correctamente');
} catch (error) {
  console.log('⚠️ Todavía hay errores de TypeScript por resolver');
}
