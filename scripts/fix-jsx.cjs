#!/usr/bin/env node

/**
 * Script para convertir componentes JSX a React.createElement
 * Este script identifica componentes con problemas de JSX y los convierte al formato
 * React.createElement para evitar errores de TypeScript
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

// Contador para estadísticas
let fixedFiles = 0;
let fixedJSXExpressions = 0;
let fixedArrowFunctions = 0;

// Función para verificar si un archivo tiene errores de JSX
function hasJSXErrors(filepath) {
  try {
    const result = execSync(`npx tsc --noEmit "${filepath}" 2>&1`, { encoding: 'utf-8' });
    return false; // Si no hay errores, retorna false
  } catch (error) {
    // Verificar si el error contiene problemas de JSX
    return error.stdout && (
      error.stdout.includes('Cannot use JSX unless the') ||
      error.stdout.includes('TS17004:') ||
      error.stdout.includes('Argument expression expected')
    );
  }
}

// Expresiones regulares para identificar patrones comunes
const patterns = [
  // Convertir <div>...</div> a React.createElement
  {
    regex: /<(\w+)([^>]*?)>([\s\S]*?)<\/\1>/g,
    replacement: (match, tag, attrs, children) => {
      // Convertir atributos JSX a props de React.createElement
      const props = attrs.replace(/(\w+)=\{([^}]+)\}/g, '$1: $2')
                         .replace(/(\w+)="([^"]+)"/g, '$1: "$2"');

      return `React.createElement('${tag}', {${props}}, ${children})`;
    }
  },
  // Convertir <img ... /> a React.createElement
  {
    regex: /<(\w+)([^>]*?)\/>/g,
    replacement: (match, tag, attrs) => {
      // Convertir atributos JSX a props de React.createElement
      const props = attrs.replace(/(\w+)=\{([^}]+)\}/g, '$1: $2')
                         .replace(/(\w+)="([^"]+)"/g, '$1: "$2"');

      return `React.createElement('${tag}', {${props}})`;
    }
  },
  // Corregir funciones de flecha sin parámetros
  {
    regex: /\(\s*\)\s*=>\s*\{/g,
    replacement: '() => {'
  },
  // Corregir funciones de flecha con parámetros faltantes
  {
    regex: /\(\s*=>\s*\{/g,
    replacement: '(param) => {'
  },
  // Corregir propiedades sin valor
  {
    regex: /\s(\w+)=\{\}/g,
    replacement: ' $1={true}'
  }
];

// Procesar cada archivo
files.forEach(filepath => {
  // Solo procesar archivos con errores de JSX
  if (hasJSXErrors(filepath)) {
    try {
      console.log(`Procesando: ${filepath.replace(rootDir, '')}`);
      let content = fs.readFileSync(filepath, 'utf8');
      let modified = false;

      // Aplicar cada patrón
      patterns.forEach(pattern => {
        const originalContent = content;
        content = content.replace(pattern.regex, pattern.replacement);

        if (content !== originalContent) {
          modified = true;

          if (pattern.regex.toString().includes('=>')) {
            fixedArrowFunctions++;
          } else if (pattern.regex.toString().includes('<')) {
            fixedJSXExpressions++;
          }
        }
      });

      // Si se realizaron cambios, guardar el archivo
      if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        fixedFiles++;
      }
    } catch (error) {
      console.error(`Error procesando ${filepath}:`, error);
    }
  }
});

console.log(`
Resumen:
- ${fixedFiles} archivos corregidos
- ${fixedJSXExpressions} expresiones JSX convertidas a React.createElement
- ${fixedArrowFunctions} funciones de flecha corregidas
`);

// Verificar si los cambios resolvieron los errores
try {
  console.log('Verificando errores de TypeScript después de las correcciones...');
  const result = execSync('npx tsc --noEmit src/components/optimized/LazyImage.tsx src/components/optimized/LoadingIndicator.tsx', {
    stdio: 'inherit'
  });
  console.log('✅ Componentes verificados correctamente');
} catch (error) {
  console.log('⚠️ Todavía hay errores de TypeScript por resolver');
}
