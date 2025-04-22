import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../src/utils/logger.mjs';
import {
  categorizeComponent,
  categorizeService,
  categorizeTest,
  updateImportPaths
} from './utils/categorization.mjs';

const logger = createLogger('reorganize');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

const PROJECT_STRUCTURE = {
  src: {
    components: {
      core: {},
      patients: {},
      clinical: {},
      ai: {},
      shared: {},
    },
    services: {
      ai: {},
      clinical: {},
      data: {},
      auth: {},
      core: {},
    },
    hooks: {},
    utils: {},
    config: {},
    types: {},
    constants: {},
  },
  docs: {
    mvp: {},
    technical: {},
    sprints: {},
  },
  tests: {
    unit: {
      components: {},
      services: {},
      hooks: {},
      misc: {},
    },
    integration: {},
    e2e: {},
  },
  scripts: {},
};

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function moveFile(sourcePath, targetPath) {
  try {
    await ensureDirectoryExists(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
    await fs.unlink(sourcePath);
    logger.info(`Movido: ${sourcePath} -> ${targetPath}`);
  } catch (error) {
    if (error.code === 'EISDIR') {
      logger.info(`Saltando directorio: ${sourcePath}`);
    } else {
      logger.error(`Error al mover ${sourcePath}: ${error.message}`);
    }
  }
}

async function createDirectoryStructure(basePath, structure) {
  for (const [name, subStructure] of Object.entries(structure)) {
    const dirPath = path.join(basePath, name);
    await ensureDirectoryExists(dirPath);
    if (Object.keys(subStructure).length > 0) {
      await createDirectoryStructure(dirPath, subStructure);
    }
  }
}

async function consolidateDocumentation() {
  const docsPath = path.join(PROJECT_ROOT, 'docs');
  await ensureDirectoryExists(docsPath);
  
  // Crear documentación principal
  const readmeContent = `# MapleAIHealth

## Descripción
Sistema de gestión clínica potenciado por IA para profesionales de la salud.

## Características Principales
- Gestión de pacientes
- Asistente clínico con IA
- Análisis de datos médicos
- Integración con sistemas de salud

## Instalación
\`\`\`bash
npm install
\`\`\`

## Uso
\`\`\`bash
npm run dev
\`\`\`

## Estructura del Proyecto
- /src - Código fuente
- /docs - Documentación
- /tests - Pruebas
- /scripts - Scripts de utilidad

## Licencia
Propietario - Todos los derechos reservados
`;
  await fs.writeFile(path.join(PROJECT_ROOT, 'README.md'), readmeContent);
  logger.info('Creado archivo de documentación: README.md');

  // Crear documentación técnica
  const architectureContent = `# Arquitectura del Sistema

## Visión General
Sistema modular basado en React con servicios de IA integrados.

## Componentes Principales
- Frontend (React + TypeScript)
- Servicios de IA
- Gestión de Datos
- API REST

## Integración con IA
Detalles de la integración con servicios de IA...
`;
  await fs.writeFile(path.join(PROJECT_ROOT, 'docs/technical/ARCHITECTURE.md'), architectureContent);
  logger.info('Creado archivo de documentación: docs/technical/ARCHITECTURE.md');
}

async function reorganizeSourceCode() {
  const srcPath = path.join(PROJECT_ROOT, 'src');
  const files = await fs.readdir(srcPath, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      const sourcePath = path.join(srcPath, file.name);
      let targetPath;

      if (file.name.includes('test')) {
        targetPath = path.join(PROJECT_ROOT, 'tests/unit/misc', file.name);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.jsx')) {
        targetPath = path.join(srcPath, 'components/core', file.name);
      } else {
        targetPath = path.join(srcPath, 'utils', file.name);
      }

      await moveFile(sourcePath, targetPath);
    }
  }
}

async function reorganizeProject() {
  try {
    logger.info('Iniciando reorganización del proyecto...');
    
    // Crear estructura de directorios
    await createDirectoryStructure(PROJECT_ROOT, PROJECT_STRUCTURE);
    
    // Consolidar documentación
    await consolidateDocumentation();
    
    // Reorganizar código fuente
    await reorganizeSourceCode();
    
    logger.info('Proyecto reorganizado exitosamente');
  } catch (error) {
    logger.error(`Error durante la reorganización: ${error.message}`);
    throw error;
  }
}

reorganizeProject().catch(console.error); 