import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../src/utils/logger.mjs';

const logger = createLogger('cleanup');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build'
];

const UNNECESSARY_PATTERNS = [
  '*.log',
  '*.bak',
  '*.tmp',
  '*.temp',
  '.DS_Store',
  'Thumbs.db'
];

const OLD_FILES_THRESHOLD = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos

async function cleanup() {
  try {
    logger.info('Iniciando limpieza del proyecto...');

    // 1. Encontrar y eliminar archivos innecesarios
    const unnecessaryFiles = await findUnnecessaryFiles(rootDir);
    logger.info(`Encontrados ${unnecessaryFiles.length} archivos innecesarios`);

    // 2. Encontrar archivos duplicados
    const duplicateFiles = await findDuplicateFiles(rootDir);
    logger.info(`Encontrados ${duplicateFiles.length} archivos duplicados`);

    // 3. Encontrar archivos antiguos sin modificar
    const oldFiles = await findOldUnmodifiedFiles(rootDir);
    logger.info(`Encontrados ${oldFiles.length} archivos antiguos sin modificar`);

    // 4. Reorganizar estructura del proyecto
    await reorganizeProjectStructure();

    // 5. Limpiar archivos temporales
    await cleanTempFiles();

    return {
      unnecessaryFiles,
      duplicateFiles,
      oldFiles
    };
  } catch (error) {
    logger.error('Error durante la limpieza:', error);
    throw error;
  }
}

async function findUnnecessaryFiles(dir) {
  const unnecessaryFiles = [];

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (EXCLUDED_DIRS.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        if (UNNECESSARY_PATTERNS.some(pattern => 
          entry.name.toLowerCase().includes(pattern.replace('*', ''))
        )) {
          unnecessaryFiles.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return unnecessaryFiles;
}

async function findDuplicateFiles(dir) {
  const fileHashes = new Map();
  const duplicates = [];

  async function calculateHash(filePath) {
    const content = await fs.readFile(filePath);
    return Buffer.from(content).toString('base64');
  }

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (EXCLUDED_DIRS.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        const hash = await calculateHash(fullPath);
        if (fileHashes.has(hash)) {
          duplicates.push({
            original: fileHashes.get(hash),
            duplicate: fullPath
          });
        } else {
          fileHashes.set(hash, fullPath);
        }
      }
    }
  }

  await scan(dir);
  return duplicates;
}

async function findOldUnmodifiedFiles(dir) {
  const oldFiles = [];
  const now = Date.now();

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (EXCLUDED_DIRS.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        if (now - stats.mtimeMs > OLD_FILES_THRESHOLD) {
          oldFiles.push({
            path: fullPath,
            lastModified: stats.mtime
          });
        }
      }
    }
  }

  await scan(dir);
  return oldFiles;
}

async function reorganizeProjectStructure() {
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

  // Crear directorios faltantes
  for (const [mainDir, subDirs] of Object.entries(expectedStructure)) {
    const mainPath = path.join(rootDir, mainDir);
    
    try {
      await fs.access(mainPath);
    } catch {
      await fs.mkdir(mainPath);
    }

    if (typeof subDirs === 'object') {
      if (Array.isArray(subDirs)) {
        for (const subDir of subDirs) {
          const subPath = path.join(mainPath, subDir);
          try {
            await fs.access(subPath);
          } catch {
            await fs.mkdir(subPath);
          }
        }
      } else {
        for (const [subDir, value] of Object.entries(subDirs)) {
          const subPath = path.join(mainPath, subDir);
          try {
            await fs.access(subPath);
          } catch {
            await fs.mkdir(subPath);
          }

          if (Array.isArray(value)) {
            for (const nestedDir of value) {
              const nestedPath = path.join(subPath, nestedDir);
              try {
                await fs.access(nestedPath);
              } catch {
                await fs.mkdir(nestedPath);
              }
            }
          }
        }
      }
    }
  }
}

async function cleanTempFiles() {
  const tempPatterns = [
    '**/*.log',
    '**/*.tmp',
    '**/*.temp',
    '**/.DS_Store',
    '**/Thumbs.db'
  ];

  for (const pattern of tempPatterns) {
    // Aquí implementaríamos la eliminación de archivos temporales
    logger.info(`Buscando archivos que coincidan con ${pattern}`);
  }
}

// Ejecutar limpieza
cleanup()
  .then(results => {
    logger.info('Limpieza completada. Resultados:', results);
    
    // Mostrar recomendaciones
    if (results.unnecessaryFiles.length > 0) {
      logger.info('Se recomienda eliminar los siguientes archivos innecesarios:');
      results.unnecessaryFiles.forEach(file => logger.info(`- ${file}`));
    }

    if (results.duplicateFiles.length > 0) {
      logger.info('Se encontraron los siguientes archivos duplicados:');
      results.duplicateFiles.forEach(({original, duplicate}) => 
        logger.info(`- Original: ${original}\n  Duplicado: ${duplicate}`)
      );
    }

    if (results.oldFiles.length > 0) {
      logger.info('Archivos sin modificar en los últimos 30 días:');
      results.oldFiles.forEach(({path, lastModified}) => 
        logger.info(`- ${path} (Última modificación: ${lastModified})`)
      );
    }
  })
  .catch(error => {
    logger.error('Error durante la limpieza:', error);
    process.exit(1);
  }); 