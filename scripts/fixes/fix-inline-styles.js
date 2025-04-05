#!/usr/bin/env node

/**
 * Script para identificar y reemplazar estilos inline con clases de Tailwind CSS
 * Este script analiza componentes React y reemplaza propiedades de estilo comunes
 * con sus equivalentes en clases de Tailwind
 * Ejecutar con: node scripts/fixes/fix-inline-styles.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Mapeo de estilos comunes a clases de Tailwind
const STYLE_TO_TAILWIND = {
  // Widths
  'width: 100%': 'w-full',
  'width: 50%': 'w-1/2',
  'width: 75%': 'w-3/4',
  'width: 25%': 'w-1/4',
  'width: 33%': 'w-1/3',
  'width: 66%': 'w-2/3',
  'width: auto': 'w-auto',

  // Heights
  'height: 100%': 'h-full',
  'height: auto': 'h-auto',
  'height: 50%': 'h-1/2',

  // Márgenes
  'margin: 0': 'm-0',
  'margin: auto': 'm-auto',
  'margin-top: 0': 'mt-0',
  'margin-top: 1rem': 'mt-4',
  'margin-right: 0': 'mr-0',
  'margin-right: 1rem': 'mr-4',
  'margin-bottom: 0': 'mb-0',
  'margin-bottom: 1rem': 'mb-4',
  'margin-left: 0': 'ml-0',
  'margin-left: 1rem': 'ml-4',

  // Padding
  'padding: 0': 'p-0',
  'padding: 1rem': 'p-4',
  'padding-top: 0': 'pt-0',
  'padding-top: 1rem': 'pt-4',
  'padding-right: 0': 'pr-0',
  'padding-right: 1rem': 'pr-4',
  'padding-bottom: 0': 'pb-0',
  'padding-bottom: 1rem': 'pb-4',
  'padding-left: 0': 'pl-0',
  'padding-left: 1rem': 'pl-4',

  // Display y Flex
  'display: flex': 'flex',
  'display: block': 'block',
  'display: inline-block': 'inline-block',
  'display: none': 'hidden',
  'flex-direction: row': 'flex-row',
  'flex-direction: column': 'flex-col',
  'justify-content: center': 'justify-center',
  'justify-content: flex-start': 'justify-start',
  'justify-content: flex-end': 'justify-end',
  'justify-content: space-between': 'justify-between',
  'align-items: center': 'items-center',
  'align-items: flex-start': 'items-start',
  'align-items: flex-end': 'items-end',

  // Textos
  'text-align: center': 'text-center',
  'text-align: left': 'text-left',
  'text-align: right': 'text-right',
  'font-weight: bold': 'font-bold',
  'font-weight: normal': 'font-normal',

  // Colores (ejemplos básicos)
  'color: white': 'text-white',
  'color: black': 'text-black',
  'color: red': 'text-red-500',
  'color: blue': 'text-blue-500',
  'color: green': 'text-green-500',
  'background-color: white': 'bg-white',
  'background-color: black': 'bg-black',
  'background-color: red': 'bg-red-500',
  'background-color: blue': 'bg-blue-500',
  'background-color: green': 'bg-green-500',

  // Borders
  'border: none': 'border-0',
  'border: 1px solid black': 'border border-black',
  'border-radius: 0.25rem': 'rounded',
  'border-radius: 9999px': 'rounded-full',
};

// Contadores para el informe
let totalFilesWithInlineStyles = 0;
let totalInlineStylesReplaced = 0;
let totalFilesModified = 0;
let filesWithUnresolvedStyles = [];

console.log('🔍 Buscando estilos inline para convertirlos a clases Tailwind...');

// Función para procesar archivos de manera recursiva
function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      processFile(filePath);
    }
  }
}

// Función para procesar un archivo
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileInlineStylesReplaced = 0;
  let hasUnresolvedStyles = false;

  // Buscar patrones de estilos inline
  const stylePatterns = [
    { regex: /style={{([^{}]|{[^{}]*})*}}/g, isObject: true },
    { regex: /style={(['"])[^'"]*\1}/g, isObject: false }
  ];

  for (const pattern of stylePatterns) {
    const matches = [...content.matchAll(pattern.regex)];

    if (matches.length > 0) {
      logFileHeader(filePath, matches.length);
      totalFilesWithInlineStyles++;

      for (const match of matches) {
        const styleText = match[0];
        const { newClasses, unresolvedProps } = extractStyleProperties(pattern, styleText);

        if (unresolvedProps.length > 0) {
          hasUnresolvedStyles = true;
        }

        fileInlineStylesReplaced += newClasses.length;

        if (newClasses.length > 0) {
          // Actualizar el contenido con las nuevas clases
          content = updateElementInContent(content, styleText, newClasses, unresolvedProps);
        }

        // Reportar resultados
        reportConversionResults(newClasses, unresolvedProps);
      }
    }
  }

  // Guardar cambios si hubo modificaciones
  saveModifiedContent(content, originalContent, filePath, fileInlineStylesReplaced);

  if (hasUnresolvedStyles && !filesWithUnresolvedStyles.includes(filePath)) {
    filesWithUnresolvedStyles.push(filePath);
  }
}

/**
 * Muestra información del archivo que se está procesando
 */
function logFileHeader(filePath, matchesCount) {
  console.log(`\nArchivo: ${path.relative(ROOT_DIR, filePath)}`);
  console.log(`  Encontrados ${matchesCount} estilos inline`);
}

/**
 * Extrae propiedades de estilo y las convierte a clases Tailwind
 */
function extractStyleProperties(pattern, styleText) {
  let newClasses = [];
  let unresolvedProps = [];

  if (pattern.isObject) {
    extractFromObjectStyle(styleText, newClasses, unresolvedProps);
  } else {
    extractFromStringStyle(styleText, newClasses, unresolvedProps);
  }

  return { newClasses, unresolvedProps };
}

/**
 * Extrae propiedades de un objeto de estilo
 */
function extractFromObjectStyle(styleText, newClasses, unresolvedProps) {
  const styleProps = styleText.match(/([a-zA-Z0-9]+):\s*(['"]?[^,}]+['"]?)/g) || [];

  for (const prop of styleProps) {
    const cleanProp = prop.trim().replace(/['",]/g, '');
    if (!matchAndAddTailwindClass(cleanProp, newClasses)) {
      unresolvedProps.push(cleanProp);
    }
  }
}

/**
 * Extrae propiedades de un string de estilo
 */
function extractFromStringStyle(styleText, newClasses, unresolvedProps) {
  const styleString = styleText.match(/['"]([^'"]*)['"]/)[1];
  const styleProps = styleString.split(';').filter(s => s.trim());

  for (const prop of styleProps) {
    const cleanProp = prop.trim();
    if (!matchAndAddTailwindClass(cleanProp, newClasses)) {
      unresolvedProps.push(cleanProp);
    }
  }
}

/**
 * Busca una propiedad de estilo en el mapeo y añade la clase Tailwind correspondiente
 * @returns {boolean} True si se encontró una coincidencia, false en caso contrario
 */
function matchAndAddTailwindClass(cleanProp, newClasses) {
  for (const [inlineStyle, tailwindClass] of Object.entries(STYLE_TO_TAILWIND)) {
    if (cleanProp.includes(inlineStyle) || inlineStyle.includes(cleanProp)) {
      newClasses.push(tailwindClass);
      return true;
    }
  }
  return false;
}

/**
 * Actualiza el elemento en el contenido con las nuevas clases
 */
function updateElementInContent(content, styleText, newClasses, unresolvedProps) {
  // Encontrar el elemento que contiene el estilo
  const elementStart = content.substring(0, content.indexOf(styleText)).lastIndexOf('<');
  const elementPart = content.substring(elementStart, elementStart + 100);
  const elementMatch = elementPart.match(/<([a-zA-Z0-9]+)[^>]*>/);

  if (!elementMatch) {
    return content;
  }

  const element = elementMatch[0];
  const updatedElement = createUpdatedElement(element, styleText, newClasses, unresolvedProps);

  // Actualizar el contenido
  return content.replace(element, updatedElement);
}

/**
 * Crea un elemento actualizado con las nuevas clases
 */
function createUpdatedElement(element, styleText, newClasses, unresolvedProps) {
  let updatedElement;

  // Añadir o actualizar la clase Tailwind
  if (element.includes('className=')) {
    updatedElement = element.replace(/className=(['"])([^'"]*)\1/,
      (_, quote, existingClasses) => `className=${quote}${existingClasses} ${newClasses.join(' ')}${quote}`);
  } else {
    updatedElement = element.replace(/<([a-zA-Z0-9]+)/,
      (_, tag) => `<${tag} className="${newClasses.join(' ')}"`);
  }

  // Si todos los estilos fueron convertidos, eliminar el atributo style
  if (unresolvedProps.length === 0) {
    updatedElement = updatedElement.replace(styleText, '');
  }

  return updatedElement;
}

/**
 * Reporta los resultados de la conversión
 */
function reportConversionResults(newClasses, unresolvedProps) {
  if (newClasses.length > 0) {
    console.log(`  ✅ Convertido: ${newClasses.join(' ')}`);
  }

  if (unresolvedProps.length > 0) {
    console.log(`  ⚠️ Estilos no convertidos: ${unresolvedProps.join(', ')}`);
  }
}

/**
 * Guarda el contenido modificado si hay cambios
 */
function saveModifiedContent(content, originalContent, filePath, fileInlineStylesReplaced) {
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFilesModified++;
    totalInlineStylesReplaced += fileInlineStylesReplaced;
    console.log(`  🔧 Archivo actualizado con ${fileInlineStylesReplaced} conversiones`);
  }
}

// Ejecutar el proceso
try {
  processDirectory(SRC_DIR);

  // Generar informe
  console.log('\n📊 Resumen de conversiones:');
  console.log(`- Archivos con estilos inline encontrados: ${totalFilesWithInlineStyles}`);
  console.log(`- Estilos convertidos a clases Tailwind: ${totalInlineStylesReplaced}`);
  console.log(`- Archivos modificados: ${totalFilesModified}`);
  console.log(`- Archivos con estilos no resueltos: ${filesWithUnresolvedStyles.length}`);

  if (filesWithUnresolvedStyles.length > 0) {
    console.log('\n⚠️ Archivos que requieren revisión manual:');
    filesWithUnresolvedStyles.forEach(file => {
      console.log(`  - ${path.relative(ROOT_DIR, file)}`);
    });
  }

  console.log('\n✨ Proceso completado.');
  console.log('   Los estilos más complejos o específicos pueden requerir ajustes manuales adicionales.');
} catch (error) {
  console.error('\n❌ Error durante el proceso:', error);
  process.exit(1);
}
