import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../src/utils/logger.mjs';

const logger = createLogger('healthCheck');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function analyzeProjectHealth() {
  try {
    logger.info('Iniciando análisis de salud del proyecto...');

    // 1. Verificar archivos de configuración
    const configFiles = await checkConfigFiles();
    logger.info('Estado de archivos de configuración:', configFiles);

    // 2. Buscar archivos duplicados o sin usar
    const unusedFiles = await findUnusedFiles();
    logger.info('Archivos potencialmente sin usar:', unusedFiles);

    // 3. Verificar dependencias circulares
    const circularDeps = await checkCircularDependencies();
    logger.info('Dependencias circulares encontradas:', circularDeps);

    // 4. Verificar consistencia de tipos
    const typeIssues = await checkTypeConsistency();
    logger.info('Problemas de tipos encontrados:', typeIssues);

    // 5. Analizar estructura del proyecto
    const structureIssues = await analyzeProjectStructure();
    logger.info('Problemas de estructura:', structureIssues);

    return {
      configFiles,
      unusedFiles,
      circularDeps,
      typeIssues,
      structureIssues
    };
  } catch (error) {
    logger.error('Error durante el análisis:', error);
    throw error;
  }
}

async function checkConfigFiles() {
  const requiredConfigs = [
    '.env',
    'package.json',
    'tsconfig.json',
    'src/config/ai.config.ts'
  ];

  const results = {};
  for (const config of requiredConfigs) {
    try {
      await fs.access(path.join(rootDir, config));
      results[config] = 'OK';
    } catch {
      results[config] = 'Missing';
    }
  }
  return results;
}

async function findUnusedFiles() {
  const unusedPatterns = [
    '**/*.test.{js,ts,tsx}',
    '**/*.spec.{js,ts,tsx}',
    '**/test/',
    '**/tests/',
    '**/__mocks__/',
    '**/*.bak',
    '**/*.tmp'
  ];

  // Implementar lógica para encontrar archivos sin usar
  return [];
}

async function checkCircularDependencies() {
  // Implementar detección de dependencias circulares
  return [];
}

async function checkTypeConsistency() {
  // Implementar verificación de tipos
  return [];
}

async function analyzeProjectStructure() {
  const expectedStructure = {
    src: {
      components: ['assistant', 'patients', 'interactions'],
      services: ['ai', 'interactions'],
      models: true,
      hooks: true,
      config: true,
      utils: true
    }
  };

  const issues = [];
  
  try {
    const srcContents = await fs.readdir(path.join(rootDir, 'src'));
    for (const expectedDir of Object.keys(expectedStructure.src)) {
      if (!srcContents.includes(expectedDir)) {
        issues.push(`Directorio faltante: src/${expectedDir}`);
      }
    }
  } catch (error) {
    issues.push(`Error al analizar estructura: ${error.message}`);
  }

  return issues;
}

// Ejecutar análisis
analyzeProjectHealth()
  .then(results => {
    logger.info('Análisis completado:', results);
    
    // Identificar archivos para limpieza
    const filesToClean = results.unusedFiles.filter(file => 
      !file.includes('test') && !file.includes('spec')
    );
    
    if (filesToClean.length > 0) {
      logger.info('Archivos recomendados para limpieza:', filesToClean);
    }
  })
  .catch(error => {
    logger.error('Error en el análisis:', error);
    process.exit(1);
  }); 