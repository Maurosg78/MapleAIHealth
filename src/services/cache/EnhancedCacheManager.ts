import { CacheConfig, CacheStats, CacheMetadata } from './types';
import { InvalidationStrategy, InvalidationConfig, commonInvalidationRules } from './InvalidationStrategy';
import { CachePrioritizationService, PrioritizationAlgorithm, CacheItemUsage } from './CachePrioritizationService';

export class EnhancedCacheManager<T> {
  private cache: Map<string, { data: T; timestamp: number; metadata?: CacheMetadata }>;
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout;
  private accessCount: Map<string, number>;
  private lastAccess: Map<string, number>;
  private invalidationStrategy: InvalidationStrategy;
  private prioritizationService: CachePrioritizationService;
  private memorySizeEstimator?: (data: T) => number; // Estimador de tamaño en memoria

  constructor(
    config: CacheConfig, 
    invalidationConfig?: InvalidationConfig,
    prioritizationAlgorithm: PrioritizationAlgorithm = 'adaptive',
    memorySizeEstimator?: (data: T) => number
  ) {
    this.config = config;
    this.cache = new Map();
    this.accessCount = new Map();
    this.lastAccess = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleared: new Date(),
      estimatedMemoryUsage: 0
    };
    this.memorySizeEstimator = memorySizeEstimator;
    
    // Configurar estrategia de invalidación
    this.invalidationStrategy = new InvalidationStrategy(
      invalidationConfig || {
        rules: commonInvalidationRules,
        defaultTTL: config.ttlMs,
        enablePatientScoping: Boolean(config.patientBased),
        enableSectionScoping: true,
        enableDependencyTracking: true
      }
    );
    
    // Inicializar servicio de priorización
    this.prioritizationService = new CachePrioritizationService(
      prioritizationAlgorithm,
      {
        recencyWeight: 0.4,
        frequencyWeight: 0.3,
        sizeWeight: 0.1,
        costWeight: 0.2,
        patientEmphasis: Boolean(config.patientBased)
      }
    );
    
    this.cleanupInterval = setInterval(() => this.cleanup(), config.cleanupInterval || 60000);
  }

  /**
   * Limpia la caché eliminando entradas inválidas y controlando el tamaño máximo
   */
  private cleanup(): void {
    let entriesRemoved = 0;

    // Evaluar cada entrada usando la estrategia de invalidación
    for (const [key, value] of this.cache.entries()) {
      const invalidationResult = this.invalidationStrategy.shouldInvalidate(
        key, 
        value.timestamp, 
        value.metadata
      );
      
      if (invalidationResult.invalidated) {
        this.removeEntry(key);
        entriesRemoved++;
        
        // Si es invalidación basada en dependencias, verificar las dependencias
        if (invalidationResult.pattern === 'dependency-based') {
          const dependents = this.invalidationStrategy.getDependents(key);
          for (const dependent of dependents) {
            if (this.cache.has(dependent)) {
              this.removeEntry(dependent);
              entriesRemoved++;
            }
          }
        }
      }
    }

    // Limitar tamaño máximo usando priorización avanzada
    if (this.cache.size > this.config.maxSize) {
      this.prioritizeAndEvict();
    }

    if (entriesRemoved > 0) {
      this.updateStats();
    }
  }
  
  /**
   * Prioriza y elimina las entradas menos importantes cuando se alcanza el tamaño máximo
   * Usando el servicio de priorización para decisiones más inteligentes
   */
  private prioritizeAndEvict(): void {
    const entriesToRemove = this.cache.size - this.config.maxSize;
    
    // Preparar datos para el servicio de priorización
    const usageData: CacheItemUsage[] = Array.from(this.cache.entries()).map(([key, value]) => {
      const accessCount = this.accessCount.get(key) || 0;
      const lastAccess = this.lastAccess.get(key) || value.timestamp;
      
      // Estimar tamaño en memoria si hay estimador disponible
      const size = this.memorySizeEstimator ? this.memorySizeEstimator(value.data) : undefined;
      
      return {
        key,
        accessCount,
        lastAccess,
        createdAt: value.timestamp,
        size,
        section: value.metadata?.section,
        patientId: value.metadata?.patientId
      };
    });
    
    // Usar el servicio de priorización para determinar qué entradas eliminar
    const keysToEvict = this.prioritizationService.selectItemsToEvict(usageData, entriesToRemove);
    
    // Eliminar entradas seleccionadas
    for (const key of keysToEvict) {
      this.removeEntry(key);
    }
  }

  /**
   * Elimina una entrada de la caché y actualiza estadísticas
   */
  private removeEntry(key: string): void {
    // Capturar tamaño estimado antes de eliminar si hay estimador
    let sizeRemoved = 0;
    if (this.memorySizeEstimator && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      sizeRemoved = this.memorySizeEstimator(entry.data);
    }
    
    this.cache.delete(key);
    this.accessCount.delete(key);
    this.lastAccess.delete(key);
    
    // Actualizar estadísticas de uso de memoria
    if (sizeRemoved > 0 && this.stats.estimatedMemoryUsage) {
      this.stats.estimatedMemoryUsage = Math.max(0, this.stats.estimatedMemoryUsage - sizeRemoved);
    }
  }

  /**
   * Actualiza las estadísticas de la caché
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    
    // Actualizar estimación de memoria si hay estimador
    if (this.memorySizeEstimator) {
      let totalSize = 0;
      for (const [, entry] of this.cache.entries()) {
        totalSize += this.memorySizeEstimator(entry.data);
      }
      this.stats.estimatedMemoryUsage = totalSize;
    }
  }

  /**
   * Obtiene un valor de la caché
   */
  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Verificar invalidación
    const invalidationResult = this.invalidationStrategy.shouldInvalidate(
      key,
      entry.timestamp,
      entry.metadata
    );
    
    if (invalidationResult.invalidated) {
      this.removeEntry(key);
      this.stats.misses++;
      this.updateStats();
      return undefined;
    }

    // Actualizar estadísticas de acceso
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    
    this.stats.hits++;
    return entry.data;
  }

  /**
   * Almacena un valor en la caché con metadatos opcionales
   */
  public set(key: string, value: T, metadata?: CacheMetadata): void {
    const now = Date.now();
    
    // Verificar si la entrada ya existe y actualizar si es necesario
    if (this.cache.has(key)) {
      const existingEntry = this.cache.get(key)!;
      
      // Actualizar solo si hay cambios significativos
      if (
        JSON.stringify(existingEntry.data) !== JSON.stringify(value) ||
        JSON.stringify(existingEntry.metadata) !== JSON.stringify(metadata) ||
        now - existingEntry.timestamp > this.config.ttlMs / 2
      ) {
        this.cache.set(key, {
          data: value,
          timestamp: now,
          metadata
        });
        this.lastAccess.set(key, now);
        
        // Actualizar estadísticas de memoria
        this.updateMemoryStats(key, value, existingEntry.data);
      }
      return;
    }

    // Verificar si hay espacio disponible
    if (this.cache.size >= this.config.maxSize) {
      this.prioritizeAndEvict();
    }

    // Almacenar nueva entrada
    this.cache.set(key, {
      data: value,
      timestamp: now,
      metadata
    });
    this.accessCount.set(key, 0);
    this.lastAccess.set(key, now);
    
    // Actualizar estadísticas
    this.updateStats();
    this.updateMemoryStats(key, value);
    
    // Configurar contexto de paciente en el servicio de priorización
    if (metadata?.patientId) {
      this.prioritizationService.setPatientContext(metadata.patientId);
    }
  }
  
  /**
   * Actualiza las estadísticas de uso de memoria
   */
  private updateMemoryStats(key: string, newValue: T, oldValue?: T): void {
    if (!this.memorySizeEstimator) return;
    
    const newSize = this.memorySizeEstimator(newValue);
    const oldSize = oldValue ? this.memorySizeEstimator(oldValue) : 0;
    
    // Actualizar el total
    if (this.stats.estimatedMemoryUsage !== undefined) {
      this.stats.estimatedMemoryUsage = Math.max(0, 
        (this.stats.estimatedMemoryUsage - oldSize) + newSize
      );
    } else {
      this.stats.estimatedMemoryUsage = newSize;
    }
  }

  /**
   * Registra una dependencia entre dos claves en la caché
   */
  public registerDependency(key: string, dependsOn: string): void {
    this.invalidationStrategy.registerDependency(key, dependsOn);
  }
  
  /**
   * Invalida todas las entradas que cumplan la condición de la función
   */
  public invalidateWhere(
    condition: (key: string, data: T, metadata?: CacheMetadata) => boolean
  ): number {
    let invalidatedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (condition(key, entry.data, entry.metadata)) {
        this.removeEntry(key);
        invalidatedCount++;
      }
    }
    
    if (invalidatedCount > 0) {
      this.updateStats();
    }
    
    return invalidatedCount;
  }

  /**
   * Invalida entradas de caché por patientId
   */
  public invalidateByPatient(patientId: string): number {
    return this.invalidateWhere((_, __, metadata) => metadata?.patientId === patientId);
  }

  /**
   * Invalida entradas de caché por sección
   */
  public invalidateBySection(section: string): number {
    return this.invalidateWhere((_, __, metadata) => metadata?.section === section);
  }

  /**
   * Limpia completamente la caché
   */
  public clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleared: new Date(),
      estimatedMemoryUsage: 0
    };
  }

  /**
   * Obtiene estadísticas detalladas de la caché
   */
  public getStats(): CacheStats & { 
    hitRatio: number; 
    averageAccessCount: number;
    topKeys: Array<{ key: string; accessCount: number }>;
    memoryUsageMB?: number;
  } {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    // Calcular acceso promedio
    let totalAccessCount = 0;
    for (const count of this.accessCount.values()) {
      totalAccessCount += count;
    }
    const averageAccessCount = this.accessCount.size > 0 
      ? totalAccessCount / this.accessCount.size 
      : 0;
    
    // Top 5 claves más accedidas
    const topKeys = Array.from(this.accessCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, accessCount]) => ({ key, accessCount }));
    
    // Añadir uso de memoria en MB si está disponible
    const memoryUsageMB = this.stats.estimatedMemoryUsage !== undefined
      ? this.stats.estimatedMemoryUsage / (1024 * 1024)
      : undefined;
    
    return {
      ...this.stats,
      hitRatio,
      averageAccessCount,
      topKeys,
      memoryUsageMB
    };
  }

  /**
   * Actualiza la configuración de la caché
   */
  public updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = setInterval(() => this.cleanup(), config.cleanupInterval);
    }
    
    // Actualizar TTL en la estrategia de invalidación si cambia
    if (config.ttlMs) {
      this.invalidationStrategy.updateConfig({
        defaultTTL: config.ttlMs
      });
    }
  }
  
  /**
   * Cambia el algoritmo de priorización
   */
  public setPrioritizationAlgorithm(algorithm: PrioritizationAlgorithm): void {
    this.prioritizationService.setAlgorithm(algorithm);
  }
  
  /**
   * Precarga entradas comunes para mejorar la experiencia inicial
   */
  public async preloadCommonEntries(
    keyValuePairs: Array<{key: string; getValue: () => Promise<T>; metadata?: CacheMetadata}>
  ): Promise<number> {
    let loadedCount = 0;
    
    for (const {key, getValue, metadata} of keyValuePairs) {
      if (!this.cache.has(key)) {
        try {
          const value = await getValue();
          this.set(key, value, metadata);
          loadedCount++;
        } catch (error) {
          console.error(`Error preloading cache entry for key: ${key}`, error);
        }
      }
    }
    
    return loadedCount;
  }
  
  /**
   * Detiene los timers de limpieza cuando ya no se necesita la caché
   */
  public dispose(): void {
    clearInterval(this.cleanupInterval);
  }
} 