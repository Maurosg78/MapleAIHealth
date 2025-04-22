export function categorizeComponent(filepath) {
  const filename = filepath.toLowerCase();
  
  if (filename.includes('layout') || filename.includes('nav') || filename.includes('error')) {
    return 'core';
  }
  
  if (filename.includes('patient')) {
    return 'patients';
  }
  
  if (filename.includes('soap') || filename.includes('diagnostic') || filename.includes('treatment')) {
    return 'clinical';
  }
  
  if (filename.includes('ai') || filename.includes('assistant') || filename.includes('suggestion')) {
    return 'ai';
  }
  
  if (filename.includes('button') || filename.includes('input') || filename.includes('modal')) {
    return 'shared';
  }
  
  return 'shared';
}

export function categorizeService(filepath) {
  const filename = filepath.toLowerCase();
  
  if (filename.includes('ai') || filename.includes('openai') || filename.includes('nlp')) {
    return 'ai';
  }
  
  if (filename.includes('soap') || filename.includes('diagnostic')) {
    return 'clinical';
  }
  
  if (filename.includes('api') || filename.includes('cache') || filename.includes('sync')) {
    return 'data';
  }
  
  if (filename.includes('auth') || filename.includes('permission')) {
    return 'auth';
  }
  
  return 'core';
}

export function categorizeTest(filepath) {
  const filename = filepath.toLowerCase();
  
  if (filename.includes('.spec.')) {
    return 'integration';
  }
  
  if (filename.includes('e2e')) {
    return 'e2e';
  }
  
  if (filename.includes('component')) {
    return 'unit/components';
  }
  
  if (filename.includes('service')) {
    return 'unit/services';
  }
  
  if (filename.includes('hook')) {
    return 'unit/hooks';
  }
  
  return 'unit/misc';
}

export function updateImportPaths(content) {
  // Actualizar rutas de importación basadas en la nueva estructura
  const importUpdates = {
    '@/components': '@/components/shared',
    '@/services': '@/services/core',
    '@/utils': '@/utils/common',
    '@/hooks': '@/hooks/common'
  };

  let updatedContent = content;
  
  for (const [oldPath, newPath] of Object.entries(importUpdates)) {
    const regex = new RegExp(`from ['"]${oldPath}`, 'g');
    updatedContent = updatedContent.replace(regex, `from '${newPath}`);
  }
  
  return updatedContent;
} 