import { CacheConfig, CacheStats, CacheMetadata } from './types';
import { InvalidationStrategy, InvalidationConfig, commonInvalidationRules } from './InvalidationStrategy';

export class EnhancedCacheManager<T> {
  private cache: Map<string, { data: T; timestamp: number; metadata?: CacheMetadata }>;
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout;
  private accessCount: Map<string, number>;
  private lastAccess: Map<string, number>;
  private invalidationStrategy: InvalidationStrategy;

  constructor(config: CacheConfig, invalidationConfig?: InvalidationConfig) {
    this.config = config;
    this.cache = new Map();
    this.accessCount = new Map();
    this.lastAccess = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleared: new Date()
    };
    
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
    
    this.cleanupInterval = setInterval(() => this.cleanup(), config.cleanupInterval || 60000);
  }

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

    // Limitar tamaño máximo usando priorización
    if (this.cache.size > this.config.maxSize) {
      this.prioritizeAndEvict();
    }

    if (entriesRemoved > 0) {
      this.stats.size = this.cache.size;
    }
  }
  
  /**
   * Prioriza y elimina las entradas menos importantes cuando se alcanza el tamaño máximo
   */
  private prioritizeAndEvict(): void {
    const entriesToRemove = this.cache.size - this.config.maxSize;
    
    // Crear puntuación para cada entrada
    const entries = Array.from(this.cache.entries()).map(([key, value]) => {
      const accessCount = this.accessCount.get(key) || 0;
      const recency = Date.now() - (this.lastAccess.get(key) || 0);
      const age = Date.now() - value.timestamp;
      
      // Fórmula de priorización: más accesos y más reciente = mayor prioridad
      // Normalizado a un valor entre 0 y 100
      const priority = (
        (Math.min(accessCount, 20) / 20 * 40) + // 40% basado en frecuencia de acceso
        (Math.max(0, 1 - (recency / (24 * 60 * 60 * 1000))) * 40) + // 40% basado en recencia
        (Math.max(0, 1 - (age / this.config.ttlMs)) * 20) // 20% basado en antigüedad
      );
      
      return { key, priority };
    });
    
    // Ordenar por prioridad (menor primero)
    entries.sort((a, b) => a.priority - b.priority);
    
    // Eliminar entradas de menor prioridad
    for (let i = 0; i < entriesToRemove; i++) {
      if (i < entries.length) {
        this.removeEntry(entries[i].key);
      }
    }
  }

  private removeEntry(key: string): void {
    this.cache.delete(key);
    this.accessCount.delete(key);
    this.lastAccess.delete(key);
  }

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
      this.stats.size = this.cache.size;
      return undefined;
    }

    // Actualizar estadísticas de acceso
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    
    this.stats.hits++;
    return entry.data;
  }

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
    this.stats.size = this.cache.size;
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
      this.stats.size = this.cache.size;
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
      lastCleared: new Date()
    };
  }

  /**
   * Obtiene estadísticas de la caché
   */
  public getStats(): CacheStats & { 
    hitRatio: number; 
    averageAccessCount: number;
    topKeys: Array<{ key: string; accessCount: number }>;
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
    
    return {
      ...this.stats,
      hitRatio,
      averageAccessCount,
      topKeys
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
   * Detiene los timers de limpieza cuando ya no se necesita la caché
   */
  public dispose(): void {
    clearInterval(this.cleanupInterval);
  }
} 