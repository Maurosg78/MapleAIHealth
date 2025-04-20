import { EnhancedCacheManager } from './EnhancedCacheManager';
import { PrioritizationAlgorithm } from './CachePrioritizationService';
import { CacheConfig } from './types';

// Configuraciones optimizadas por sección
const SECTION_CONFIGS: Record<string, {
  config: CacheConfig,
  algorithm: PrioritizationAlgorithm
}> = {
  'clinical-dashboard': {
    config: {
      maxSize: 200,
      ttlMs: 15 * 60 * 1000,
      patientBased: true,
      cleanupInterval: 5 * 60 * 1000
    },
    algorithm: 'adaptive'
  },
  'evidence-charts': {
    config: {
      maxSize: 100,
      ttlMs: 30 * 60 * 1000,
      cleanupInterval: 10 * 60 * 1000
    },
    algorithm: 'lru'
  },
  'evidence-comparison': {
    config: {
      maxSize: 50,
      ttlMs: 60 * 60 * 1000,
      cleanupInterval: 15 * 60 * 1000
    },
    algorithm: 'lfu'
  },
  'evidence-search': {
    config: {
      maxSize: 150,
      ttlMs: 20 * 60 * 1000,
      cleanupInterval: 5 * 60 * 1000
    },
    algorithm: 'lru'
  },
  'evidence-tables': {
    config: {
      maxSize: 50,
      ttlMs: 30 * 60 * 1000,
      cleanupInterval: 10 * 60 * 1000
    },
    algorithm: 'lru'
  },
  'evidence-visualizer': {
    config: {
      maxSize: 100,
      ttlMs: 45 * 60 * 1000,
      cleanupInterval: 15 * 60 * 1000
    },
    algorithm: 'adaptive'
  },
  'search-results': {
    config: {
      maxSize: 300,
      ttlMs: 10 * 60 * 1000,
      cleanupInterval: 3 * 60 * 1000
    },
    algorithm: 'lru'
  }
};

// Configuración predeterminada
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 100,
  ttlMs: 5 * 60 * 1000,
  cleanupInterval: 60 * 1000
};

// Cache singleton instances
const instances = new Map<string, EnhancedCacheManager<unknown>>();

/**
 * Factory para crear y gestionar instancias de caché mejoradas
 */
export class CacheManagerFactory {
  /**
   * Obtiene una instancia de caché para una sección específica
   * 
   * @param section - La sección a la que pertenece la caché
   * @returns Instancia de EnhancedCacheManager
   */
  public static getInstance<T>(section: string): EnhancedCacheManager<T> {
    if (!instances.has(section)) {
      const sectionConfig = SECTION_CONFIGS[section];
      let cacheManager: EnhancedCacheManager<unknown>;
      
      if (sectionConfig) {
        cacheManager = new EnhancedCacheManager<T>(
          sectionConfig.config,
          sectionConfig.algorithm
        );
      } else {
        cacheManager = new EnhancedCacheManager<T>(
          DEFAULT_CONFIG,
          'lru'
        );
      }
      
      instances.set(section, cacheManager);
    }
    
    return instances.get(section) as EnhancedCacheManager<T>;
  }
  
  /**
   * Limpia todas las cachés registradas
   */
  public static clearAll(): void {
    for (const instance of instances.values()) {
      instance.clear();
    }
  }
  
  /**
   * Actualiza la configuración de una sección específica
   */
  public static updateConfig(section: string, config: Partial<CacheConfig>): void {
    const instance = instances.get(section);
    if (instance) {
      instance.updateConfig(config);
    }
  }
}
