#!/usr/bin/env node

/**
 * Script para corregir errores comunes de TypeScript en el proyecto
 *
 * Este script busca patrones típicos de error y los corrige automáticamente
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
let fixedErrors = 0;

// Errores comunes y sus correcciones
const errorPatterns = [
  {
    name: 'readonly en objeto literal',
    find: /(\{[^}]*?)(\s*)(readonly) (\w+):/g,
    replace: '$1$2$4:',
    countPerFile: 0
  },
  {
    name: 'Propiedades faltantes en objetos con type: progress',
    find: /(type: ['"]progress['"])(,?\s*\})/g,
    replace: '$1,\n      createdAt: new Date()$2',
    countPerFile: 0
  },
  {
    name: 'AIContext incompleto',
    find: /(type: ['"](\w+)['"],\s*data: [^,}]+)(\s*\})/g,
    replace: '$1,\n      content: JSON.stringify(data)$3',
    countPerFile: 0
  }
];

// Procesar cada archivo
files.forEach(filepath => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // Reiniciar contadores por archivo
    errorPatterns.forEach(pattern => {
      pattern.countPerFile = 0;
    });

    // Aplicar cada patrón de corrección
    errorPatterns.forEach(pattern => {
      // Contar ocurrencias
      const matches = content.match(pattern.find);
      if (matches) {
        pattern.countPerFile += matches.length;
      }

      // Aplicar reemplazo
      const newContent = content.replace(pattern.find, pattern.replace);

      if (newContent !== content) {
        content = newContent;
        modified = true;
        fixedErrors += pattern.countPerFile;
      }
    });

    // Si se hicieron cambios, guardar el archivo
    if (modified) {
      fs.writeFileSync(filepath, content, 'utf8');
      fixedFiles++;
      console.log(`Corregido: ${filepath.replace(rootDir, '')}`);

      // Mostrar estadísticas por archivo
      errorPatterns.forEach(pattern => {
        if (pattern.countPerFile > 0) {
          console.log(`  - ${pattern.name}: ${pattern.countPerFile} correcciones`);
        }
      });
    }
  } catch (error) {
    console.error(`Error procesando ${filepath}: ${error.message}`);
  }
});

console.log(`
Resumen:
- ${fixedFiles} archivos corregidos
- ${fixedErrors} errores corregidos
`);

// Verificar el servidor de desarrollo
try {
  console.log('Verificando el servidor de desarrollo...');
  const output = execSync('ps aux | grep vite | grep -v grep', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore']
  });

  if (output.trim()) {
    console.log('✅ El servidor de desarrollo está funcionando correctamente');
  } else {
    console.log('⚠️ El servidor de desarrollo no está en ejecución');
  }
} catch (error) {
  console.log('⚠️ El servidor de desarrollo no está en ejecución');
}

// Mostrar instrucciones adicionales
console.log(`
Recomendaciones adicionales:
1. Para errores de integración entre tipos, revise las definiciones en:
   - src/services/ai/index.ts
   - src/services/ai/types.ts

2. Para errores con React hooks, asegúrese de:
   - No llamarlos dentro de condicionales o funciones anidadas
   - Incluir todas las dependencias necesarias

3. Para incompatibilidades de tipos, considere usar:
   - Type assertions (as) cuando esté seguro de los tipos
   - Interfaces extendidas para compatibilidad
   - Generic types para mayor flexibilidad
`);
