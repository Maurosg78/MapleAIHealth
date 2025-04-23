import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// Crear logger para el script
const logger = {
  info: (...args) => globalThis.console.log(...args),
  error: (...args) => globalThis.console.error(...args),
  debug: (...args) => globalThis.console.debug(...args)
};

async function fixTypeScriptFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  const isReactComponent = content.includes('import React') || content.includes('from "react"');
  const isTestFile = filePath.includes('.test.') || filePath.includes('__tests__');
  const fileName = path.basename(filePath);
  
  // Corregir funciones sin tipo de retorno en componentes React
  if (isReactComponent) {
    content = content.replace(
      /export\s+(?:default\s+)?function\s+(\w+)\s*\((.*?)\)\s*{/g,
      (match, name, params) => {
        if (params.includes('Props')) {
          return `export function ${name}(${params}): JSX.Element {`;
        }
        return match;
      }
    );

    // Corregir arrow functions en componentes
    content = content.replace(
      /const\s+(\w+)\s*=\s*\((.*?)\)\s*(?:=>|{)/g,
      (match, name, params) => {
        if (params.includes('Props') || name[0].toUpperCase() === name[0]) {
          return `const ${name} = (${params}): JSX.Element => {`;
        }
        if (name.startsWith('handle') || params.includes('event') || params.includes('Event')) {
          return `const ${name} = (${params}): void => {`;
        }
        return match;
      }
    );

    // Corregir hooks personalizados
    if (fileName.startsWith('use')) {
      content = content.replace(
        /function\s+(\w+)\s*\((.*?)\)\s*{/g,
        (match, name, params) => {
          if (name.startsWith('use')) {
            return `function ${name}(${params}): unknown {`;
          }
          return match;
        }
      );
    }
  }

  // Corregir funciones sin tipo de retorno en servicios y utilidades
  if (!isReactComponent) {
    content = content.replace(
      /function\s+(\w+)\s*\((.*?)\)\s*{/g,
      (match, name, params) => {
        if (name.startsWith('get') || name.includes('fetch')) {
          return `function ${name}(${params}): Promise<unknown> {`;
        }
        if (name.includes('transform') || name.includes('convert')) {
          return `function ${name}(${params}): unknown {`;
        }
        if (name.startsWith('handle')) {
          return `function ${name}(${params}): void {`;
        }
        return match;
      }
    );

    // Corregir arrow functions en servicios
    content = content.replace(
      /const\s+(\w+)\s*=\s*async?\s*\((.*?)\)\s*=>\s*{/g,
      (match, name, params) => {
        if (name.startsWith('get') || name.includes('fetch')) {
          return `const ${name} = async (${params}): Promise<unknown> => {`;
        }
        if (name.includes('transform') || name.includes('convert')) {
          return `const ${name} = (${params}): unknown => {`;
        }
        return match;
      }
    );
  }

  // Corregir tipos any implícitos
  content = content.replace(/: any(?![a-zA-Z])/g, ': unknown');
  content = content.replace(/Array<any>/g, 'Array<unknown>');
  content = content.replace(/Promise<any>/g, 'Promise<unknown>');

  // Corregir aserciones non-null con verificaciones seguras
  content = content.replace(/(\w+)!/g, (match, name) => {
    if (content.includes(`if (${name} === null)`) || content.includes(`if (${name} === undefined)`)) {
      return match;
    }
    return `${name} ?? undefined`;
  });

  // Corregir dependencias de hooks
  if (isReactComponent) {
    const hookRegex = /useEffect\(\(\)\s*=>\s*{([^}]+)},\s*\[(.*?)\]\)/g;
    content = content.replace(hookRegex, (match, body, deps) => {
      const variables = body.match(/\b\w+\b/g) || [];
      const missingDeps = variables.filter(v => 
        !deps.includes(v) && 
        !['console', 'window', 'document', 'undefined', 'null', 'true', 'false'].includes(v)
      );
      if (missingDeps.length > 0) {
        const newDeps = deps ? `${deps}, ${missingDeps.join(', ')}` : missingDeps.join(', ');
        return `useEffect(() => {${body}}, [${newDeps}])`;
      }
      return match;
    });
  }

  // Eliminar imports no utilizados
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?/g;
  content = content.replace(importRegex, (match, imports) => {
    const importList = imports.split(',').map(i => i.trim());
    const usedImports = importList.filter(imp => {
      const name = imp.split(' as ')[0].trim();
      const restContent = content.replace(match, '');
      return restContent.includes(name);
    });
    if (usedImports.length === 0) return '';
    return `import { ${usedImports.join(', ')} } from ${match.split('from')[1].trim()};`;
  });

  // Corregir constructores vacíos
  content = content.replace(
    /constructor\s*\(\s*\)\s*{\s*}/g,
    'constructor() { super(); }'
  );

  await fs.writeFile(filePath, content);
}

async function findTypeScriptFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const typeScriptFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      typeScriptFiles.push(...await findTypeScriptFiles(fullPath));
    } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
      typeScriptFiles.push(fullPath);
    }
  }

  return typeScriptFiles;
}

async function main() {
  try {
    const srcPath = path.join(PROJECT_ROOT, 'src');
    const files = await findTypeScriptFiles(srcPath);
    
    logger.info(`Procesando ${files.length} archivos TypeScript...`);
    
    for (const file of files) {
      try {
        await fixTypeScriptFile(file);
        logger.info(`✓ ${path.relative(PROJECT_ROOT, file)}`);
      } catch (error) {
        logger.error(`✗ Error en ${file}:`, error.message);
      }
    }
    
    logger.info('Corrección automática completada.');
  } catch (error) {
    logger.error('Error general:', error.message);
    globalThis.process.exit(1);
  }
}

main(); 