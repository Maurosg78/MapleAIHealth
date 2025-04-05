#!/usr/bin/env node

/**
 * Script maestro para ejecutar todas las correcciones
 * Este script ejecuta en secuencia todos los scripts de corrección
 * para resolver las advertencias del proyecto
 *
 * Ejecutar con: node scripts/fixes/master-fix.js
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = __dirname;

// Color para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Lista de scripts de corrección
const fixScripts = [
  {
    name: 'fix-code-warnings.js',
    description: 'Corregir advertencias comunes de código (|| → ??, await redundante, etc.)'
  },
  {
    name: 'fix-accessible-labels.js',
    description: 'Asociar etiquetas con controles para mejorar accesibilidad'
  },
  {
    name: 'fix-inline-styles.js',
    description: 'Convertir estilos inline a clases de Tailwind CSS'
  },
];

console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                 CORRECCIÓN AUTOMÁTICA DE CÓDIGO              ║
║                                                              ║
║  Este script ejecutará todas las correcciones disponibles    ║
║  para resolver las advertencias del proyecto                 ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.bright}${colors.blue}Ejecutando ${fixScripts.length} scripts de corrección...${colors.reset}\n`);

// Ejecutar scripts en secuencia
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < fixScripts.length; i++) {
  const script = fixScripts[i];
  const scriptPath = path.join(SCRIPTS_DIR, script.name);

  console.log(`${colors.bright}${colors.cyan}[${i + 1}/${fixScripts.length}] ${script.description}${colors.reset}`);
  console.log(`Ejecutando: ${scriptPath}\n`);

  try {
    execSync(`node "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: ROOT_DIR
    });
    console.log(`\n${colors.green}✅ Script completado con éxito.${colors.reset}\n`);
    successCount++;
  } catch (error) {
    console.error(`\n${colors.yellow}⚠️ Error al ejecutar el script:${colors.reset}`, error.message);
    errorCount++;
  }

  // Separador visual
  console.log('─'.repeat(70) + '\n');
}

// Ejecutar ESLint para verificar resultados
console.log(`${colors.bright}${colors.blue}Verificando estado final del código...${colors.reset}\n`);

try {
  console.log('Ejecutando ESLint para verificar si quedan advertencias...');
  execSync('npx eslint --max-warnings=0 src/', {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
  console.log(`\n${colors.green}✅ ¡Todas las advertencias de ESLint han sido resueltas!${colors.reset}`);
} catch (error) {
  console.error(`\n${colors.yellow}⚠️ Aún quedan algunas advertencias de ESLint por resolver.${colors.reset}`);
  console.log('Algunas advertencias pueden requerir corrección manual.');
}

// Resumen final
console.log(`\n${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                      RESUMEN DE EJECUCIÓN                    ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.green}✅ Scripts completados con éxito: ${successCount}/${fixScripts.length}${colors.reset}`);
if (errorCount > 0) {
  console.log(`${colors.yellow}⚠️ Scripts con errores: ${errorCount}/${fixScripts.length}${colors.reset}`);
}

console.log(`\n${colors.bright}${colors.cyan}PRÓXIMOS PASOS:${colors.reset}`);
console.log(`1. Revisar los archivos modificados para asegurar que los cambios son correctos`);
console.log(`2. Comprobar manualmente los problemas que no pudieron corregirse automáticamente`);
console.log(`3. Ejecutar 'npm run lint' para verificar si quedan advertencias`);
console.log(`4. Ejecutar 'npm run test' para verificar que todo sigue funcionando correctamente`);

console.log(`\n${colors.bright}${colors.green}¡Proceso de corrección completado!${colors.reset}`);
