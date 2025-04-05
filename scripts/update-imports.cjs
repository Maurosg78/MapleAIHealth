#!/usr/bin/env node

/**
 * Script para actualizar las importaciones de React en los componentes
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
    } else if (stat.isFile() && (filepath.endsWith('.tsx') || filepath.endsWith('.jsx'))) {
      filelist.push(filepath);
    }
  });

  return filelist;
}

// Obtener todos los archivos de componentes React
const files = walkSync(rootDir);

console.log(`Encontrados ${files.length} archivos de componentes React para revisar`);

// Contadores para estadísticas
let fixedFiles = 0;

// Procesar cada archivo
files.forEach(filepath => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let hasChanges = false;

    // Reemplazar la importación de React
    const importPattern = /import\s+React(\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"]/g;
    if (content.match(importPattern)) {
      // Si hay una importación existente, reemplazarla por import * as React
      content = content.replace(importPattern, (match, namedImports) => {
        if (namedImports) {
          // Si hay importaciones nombradas, preservarlas
          return `import * as React${namedImports} from 'react'`;
        } else {
          return `import * as React from 'react'`;
        }
      });
      hasChanges = true;
    }

    // Si se hicieron cambios, guardar el archivo
    if (hasChanges) {
      fs.writeFileSync(filepath, content, 'utf8');
      fixedFiles++;
      console.log(`Corregido: ${filepath.replace(rootDir, '')}`);
    }
  } catch (error) {
    console.error(`Error procesando ${filepath}:`, error);
  }
});

console.log(`
Resumen:
- ${fixedFiles} archivos con importaciones de React corregidas
`);

// Verificar si los cambios resolvieron los errores
try {
  console.log('Verificando errores de TypeScript después de las correcciones...');
  execSync('npx tsc --noEmit --incremental false src/components/common/Skeleton.tsx', {
    stdio: 'inherit'
  });
  console.log('✅ El componente Skeleton.tsx se verifica correctamente');
} catch (error) {
  console.log('⚠️ Todavía hay errores de TypeScript por resolver');
}
