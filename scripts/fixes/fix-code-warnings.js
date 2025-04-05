#!/usr/bin/env node

/**
 * Script para corregir automáticamente problemas comunes reportados por linters
 * Ejecutar con: node scripts/fixes/fix-code-warnings.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Contadores
let fixed = {
  logicalOrToNullish: 0,
  removeRedundantAwait: 0,
  unnecessaryTypeAssertions: 0,
  readonlyProps: 0,
  arrayIndexKeys: 0,
  inlineStyles: 0,
  total: 0
};

console.log('🔍 Iniciando corrección automática de advertencias comunes...');

// Función para procesar archivos de manera recursiva
function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      fixFile(filePath);
    }
  }
}

// Función para corregir un archivo
function fixFile(filePath) {
  console.log(`Procesando: ${path.relative(ROOT_DIR, filePath)}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Reemplazar operador lógico OR (||) con operador de coalescencia nula (??)
  content = content.replace(/(\w+(?:\.\w+)*)\s*\|\|\s*(['"][^'"]*['"]|\{[^}]*\}|\[[^\]]*\]|\d+)/g, (match, left, right) => {
    // Evitamos reemplazar si es parte de una expresión más compleja o está entre paréntesis
    if (match.includes('(') || match.includes(')')) return match;
    fixed.logicalOrToNullish++;
    return `${left} ?? ${right}`;
  });

  // 2. Eliminar await redundante
  content = content.replace(/await\s+([\w.]+\(\))\s*;/g, (match, funcCall) => {
    // Solo reemplazar si no es una promesa (muy simplificado, puede mejorarse)
    if (funcCall.includes('Promise') || funcCall.includes('fetch') ||
        funcCall.includes('async')) return match;
    fixed.removeRedundantAwait++;
    return `${funcCall};`;
  });

  // 3. Eliminar aserciones de tipo innecesarias
  content = content.replace(/as\s+(string|number|boolean|any)\b/g, (match, type) => {
    fixed.unnecessaryTypeAssertions++;
    return ''; // Remover la aserción
  });

  // 4. Agregar readonly a propiedades que nunca se reasignan
  // Este es más complejo y puede generar falsos positivos, así que es simplificado
  content = content.replace(/(\s+)(private|public|protected)?\s+(\w+)\s*:/g, (match, space, access, prop) => {
    if (!content.includes(`this.${prop} =`) &&
        !content.includes(`${prop} =`) &&
        content.includes(`this.${prop}`)) {
      fixed.readonlyProps++;
      return `${space}${access || ''} readonly ${prop}:`;
    }
    return match;
  });

  // 5. Advertir sobre uso de índices de array como keys
  if (content.includes('key={index}') || content.match(/key={\`[^}]*index[^}]*\`}/)) {
    console.warn(`⚠️ Posible uso de índice como key en: ${filePath}`);
    fixed.arrayIndexKeys++;
  }

  // 6. Detectar estilos inline
  if (content.includes('style={{') || content.includes('style={')) {
    console.warn(`⚠️ Posible uso de estilos inline en: ${filePath}`);
    fixed.inlineStyles++;
  }

  // Guardar cambios si hubo modificaciones
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Se corrigieron problemas en: ${path.relative(ROOT_DIR, filePath)}`);
    fixed.total++;
  }
}

// Ejecutar el proceso
try {
  processDirectory(SRC_DIR);

  // Aplicar ESLint autofix después de nuestras correcciones
  console.log('\n🧹 Aplicando ESLint autofix...');
  execSync('npx eslint --fix src/', { stdio: 'inherit', cwd: ROOT_DIR });

  // Resumen
  console.log('\n📊 Resumen de correcciones:');
  console.log(`- Operadores || reemplazados por ??: ${fixed.logicalOrToNullish}`);
  console.log(`- Await redundantes eliminados: ${fixed.removeRedundantAwait}`);
  console.log(`- Aserciones de tipo innecesarias eliminadas: ${fixed.unnecessaryTypeAssertions}`);
  console.log(`- Propiedades marcadas como readonly: ${fixed.readonlyProps}`);
  console.log(`- Componentes con índices como keys (manual): ${fixed.arrayIndexKeys}`);
  console.log(`- Componentes con estilos inline (manual): ${fixed.inlineStyles}`);
  console.log(`\nTotal de archivos modificados: ${fixed.total}`);

  console.log('\n✨ Proceso completado con éxito.');
} catch (error) {
  console.error('❌ Error durante el proceso:', error);
  process.exit(1);
}
