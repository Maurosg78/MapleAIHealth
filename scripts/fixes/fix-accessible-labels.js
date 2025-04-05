#!/usr/bin/env node

/**
 * Script para corregir problemas de accesibilidad en los componentes React
 * Específicamente se enfoca en asegurar que las etiquetas (labels) estén asociadas
 * correctamente con sus controles
 * Ejecutar con: node scripts/fixes/fix-accessible-labels.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src/components');
const PAGES_DIR = path.join(ROOT_DIR, 'src/pages');

// Contador de problemas encontrados y corregidos
let found = 0;
let fixed = 0;

console.log('🔍 Buscando problemas de accesibilidad (labels sin asociar)...');

// Función para procesar archivos de manera recursiva
function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (stats.isFile() && file.endsWith('.tsx')) {
      checkAndFixLabels(filePath);
    }
  }
}

// Función para verificar y corregir problemas de labels
function checkAndFixLabels(filePath) {
  console.log(`Analizando: ${path.relative(ROOT_DIR, filePath)}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileFixed = false;

  // Buscar labels sin atributo htmlFor
  const labelRegex = /<label[^>]*>(?:\s*[^<]*?)<\/label>/g;
  const labels = [...content.matchAll(labelRegex)];

  for (const match of labels) {
    const labelText = match[0];
    found++;

    // Verificar si ya tiene htmlFor
    if (!labelText.includes('htmlFor=')) {
      console.log(`  ⚠️ Label sin atributo htmlFor encontrado: ${labelText.substring(0, 50)}...`);

      // Generar un ID único basado en el contenido
      const labelContent = labelText.replace(/<label[^>]*>/, '').replace(/<\/label>/, '').trim();
      const idBase = labelContent
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      const newId = `${idBase}-input`;

      // Reemplazar el label sin añadir htmlFor
      const fixedLabel = labelText.replace('<label', `<label htmlFor="${newId}"`);
      content = content.replace(labelText, fixedLabel);

      // Buscar el control relacionado después del label
      // Esto es una aproximación y podría necesitar ajustes según la estructura del código
      const afterLabelPart = content.substring(content.indexOf(labelText) + labelText.length);
      const inputRegex = /<(input|select|textarea)[^>]*>/;
      const inputMatch = afterLabelPart.match(inputRegex);

      if (inputMatch) {
        const inputTag = inputMatch[0];
        if (!inputTag.includes('id=')) {
          const fixedInput = inputTag.replace('<' + inputMatch[1], '<' + inputMatch[1] + ` id="${newId}"`);
          content = content.replace(inputTag, fixedInput);
          console.log(`  ✅ Corregido - Añadido id="${newId}" al control e htmlFor al label`);
          fixed++;
          fileFixed = true;
        }
      }
    }
  }

  // Guardar cambios si se hicieron correcciones
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`🔧 Se corrigieron ${fixed} problemas en: ${path.relative(ROOT_DIR, filePath)}`);
  }

  return fileFixed;
}

// Ejecutar el proceso
try {
  processDirectory(COMPONENTS_DIR);
  processDirectory(PAGES_DIR);

  console.log('\n📊 Resumen:');
  console.log(`- Total de labels sin asociar encontrados: ${found}`);
  console.log(`- Problemas corregidos: ${fixed}`);

  if (fixed > 0) {
    console.log('\n✨ Correcciones de accesibilidad completadas con éxito.');
  } else if (found > 0) {
    console.log('\n⚠️ Se encontraron problemas pero no se pudieron corregir automáticamente todos.');
    console.log('   Revise manualmente los componentes para asociar labels con sus controles.');
  } else {
    console.log('\n👍 No se encontraron problemas de labels sin asociar.');
  }
} catch (error) {
  console.error('\n❌ Error durante el proceso:', error);
  process.exit(1);
}
