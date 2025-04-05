#!/usr/bin/env node

/**
 * Script para corregir atributos de SVG en React.createElement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorio raíz del proyecto
const rootDir = path.resolve(__dirname, '..');

// Función para leer y corregir un archivo específico
function fixSvgAttributes(filepath) {
  console.log(`Analizando ${filepath}...`);
  let content = fs.readFileSync(filepath, 'utf8');
  let hasChanges = false;

  // Corregir atributos SVG con sintaxis incorrecta
  const svgPattern = /React\.createElement\('svg',\s*{\s*className:\s*"([^"]+)",\s*fill:\s*"([^"]+)"\s*stroke:\s*"([^"]+)"\s*viewBox:\s*"([^"]+)"\s*xmlns:\s*"([^"]+)"\s*}/g;

  content = content.replace(svgPattern, (match, className, fill, stroke, viewBox, xmlns) => {
    hasChanges = true;
    return `React.createElement('svg', {
      className: "${className}",
      fill: "${fill}",
      stroke: "${stroke}",
      viewBox: "${viewBox}",
      xmlns: "${xmlns}"
    }`;
  });

  // Corregir atributos de path con sintaxis incorrecta
  const pathPattern = /React\.createElement\('path',\s*{\s*strokeLinecap:\s*"([^"]+)"\s*strokeLinejoin:\s*"([^"]+)"\s*strokeWidth:\s*"([^"]+)"\s*d:\s*"([^"]+)"\s*}/g;

  content = content.replace(pathPattern, (match, strokeLinecap, strokeLinejoin, strokeWidth, d) => {
    hasChanges = true;
    return `React.createElement('path', {
      strokeLinecap: "${strokeLinecap}",
      strokeLinejoin: "${strokeLinejoin}",
      strokeWidth: "${strokeWidth}",
      d: "${d}"
    }`;
  });

  // Reemplazar el patrón de múltiples "null" y ");" que afecta a los componentes svg
  const svgClosingPattern = /\)\s*null\s*\);/g;
  content = content.replace(svgClosingPattern, ')');

  // Reemplazar las declaraciones 'case' mal formateadas
  const casePattern = /case\s+'([^']+)':\s*return\s*\(/g;
  content = content.replace(casePattern, (match, caseValue) => {
    hasChanges = true;
    return `case '${caseValue}': return (`;
  });

  // Reemplazar la declaración "default" mal formateada
  const defaultPattern = /default:\s*return\s*\(/g;
  content = content.replace(defaultPattern, 'default: return (');

  // Corregir las propiedades del componente Alert
  const alertProps = /React\.createElement\('Alert',\s*{\s*variant:\s*([^,\n]+)\s*\n\s*title:\s*([^,\n]+)\s*\n\s*icon:\s*([^,\n]+)\s*\n\s*onClose:\s*([^,\n]+)\s*\n\s*className:\s*([^{}]+)\s*}/g;

  content = content.replace(alertProps, (match, variant, title, icon, onClose, className) => {
    hasChanges = true;
    return `React.createElement('Alert', {
      variant: ${variant},
      title: ${title},
      icon: ${icon},
      onClose: ${onClose},
      className: ${className}
    }`;
  });

  // Corregir el error en className
  const classNameError = /className:\s*`clinical-alert \$\{className`}/g;
  content = content.replace(classNameError, 'className: `clinical-alert ${className}`');

  // Corregir el error en recommendations.map
  const mapError = /{recommendations\.map\(\(item\)\s*=>\s*\(\s*<li key=\{index\}>\{recommendation\}<\/li>\s*\)\)}/g;
  content = content.replace(mapError, '{recommendations.map((recommendation, index) => (<li key={index}>{recommendation}</li>))}');

  // Corregir el handleDismiss incompleto
  const dismissError = /if\s*\(true\)\s*{\s*onDismiss;\s*}/g;
  content = content.replace(dismissError, 'if (onDismiss) { onDismiss(id); }');

  if (hasChanges) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Corregido: ${filepath}`);
    return true;
  }
  return false;
}

// Archivos específicos a corregir
const filesToFix = [
  path.join(rootDir, 'src/components/alerts/ClinicalAlert.tsx'),
  path.join(rootDir, 'src/components/admin/CacheControlPanel.tsx')
];

let fixedCount = 0;

filesToFix.forEach(file => {
  try {
    if (fixSvgAttributes(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error procesando ${file}:`, error);
  }
});

console.log(`
Resumen:
- ${fixedCount} archivos corregidos
`);

// Verificar si hay mejoras en los errores de TypeScript
try {
  console.log('Verificando errores de TypeScript después de las correcciones...');
  execSync('npx tsc --noEmit --incremental false src/components/alerts/ClinicalAlert.tsx', {
    stdio: 'inherit'
  });
  console.log('✅ El componente ClinicalAlert.tsx se verifica correctamente');
} catch (error) {
  console.log('⚠️ Todavía hay errores de TypeScript por resolver en ClinicalAlert.tsx');
}
