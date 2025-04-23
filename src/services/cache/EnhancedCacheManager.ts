import { createLogger } from '../../utils/logger';;;;
const logger = createLogger('EnhancedCacheManager.ts');
import { CacheConfig, CacheEntry, CacheMetadata, CacheStats } from './types';;;;;
import { CacheDependencyManager, CacheDependency } from './DependencyManager';;;;;
import { PrioritizationAlgorithm } from './CachePrioritizationService';;;;;

export class EnhancedCacheManager<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private dependencyManager: CacheDependencyManager;
  private _config: CacheConfig;
  private algorithm: PrioritizationAlgorithm;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    config: CacheConfig,
    algorithm: PrioritizationAlgorithm = 'lru'
  ) {
    this._config = config;
    this.algorithm = algorithm;
    this.dependencyManager = new CacheDependencyManager();
    
    // Configurar listeners de eventos
    this.dependencyManager.on('invalidation', this.handleInvalidation.bind(this));
    
    // Iniciar limpieza periódica
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      config.cleanupInterval || 60000
    );
  }

  // Getter para acceder a la configuración
  public get config(): CacheConfig {
    return { ...this._config };
  }

  public set(key: string, value: T, metadata: CacheMetadata): void {
    const entry: CacheEntry<T> = {
      data: value,
      metadata: {
        ...metadata,
        lastAccess: Date.now(),
        accessCount: (metadata.accessCount || 0) + 1
      },
      expiresAt: Date.now() + this._config.ttlMs,
      timestamp: Date.now()
    };

    this.cache.set(key, entry);
    this.evictIfNeeded();
  }

  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    entry.metadata.lastAccess = Date.now();
    entry.metadata.accessCount++;
    return entry.data;
  }

  public addDependency(dependency: CacheDependency): void {
    this.dependencyManager.addDependency(dependency);
  }

  public async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    await this.dependencyManager.invalidate(key);
  }

  private handleInvalidation({ dependents }: { dependents: Set<string> }): void {
    for (const dependent of dependents) {
      this.cache.delete(dependent);
    }
  }

  private evictIfNeeded(): void {
    if (this.cache.size <= this._config.maxSize) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      const entryA = a[1];
      const entryB = b[1];

      switch (this.algorithm) {
        case 'lru':
          return entryA.metadata.lastAccess - entryB.metadata.lastAccess;
        case 'lfu':
          return entryA.metadata.accessCount - entryB.metadata.accessCount;
        case 'adaptive':
          return this.calculateAdaptiveScore(entryA) - this.calculateAdaptiveScore(entryB);
        default:
          return 0;
      }
    });

    const entriesToRemove = entries.slice(0, entries.length - this._config.maxSize);
    for (const [key] of entriesToRemove) {
      this.cache.delete(key);
    }
  }

  private calculateAdaptiveScore(entry: CacheEntry<T>): number {
    const age = Date.now() - entry.metadata.lastAccess;
    const frequency = entry.metadata.accessCount;
    const size = entry.metadata.size || 0;

    return (frequency / (age + 1)) * (1 / (size + 1));
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
    this.dependencyManager.clear();
  }

  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this._config = { ...this._config, ...newConfig };
  }

  /**
   * Invalida todas las entradas de caché para un paciente específico
   * @param patientId ID del paciente (no utilizado en esta implementación)
   */
  public invalidateByPatient(patientId: string): void {
    // En esta implementación simplificada, solo limpiamos toda la caché
    // ya que no estamos manteniendo un mapeo por paciente
    logger.debug(`Invalidando caché para paciente: ${patientId}`);
    this.clear();
  }

  /**
   * Invalida todas las entradas de caché para una sección específica
   * @param section Nombre de la sección (no utilizado en esta implementación)
   */
  public invalidateBySection(section: string): void {
    // En esta implementación simplificada, solo limpiamos toda la caché
    // ya que no estamos manteniendo un mapeo por sección
    logger.debug(`Invalidando caché para sección: ${section}`);
    this.clear();
  }

  public getStats(): CacheStats {
    const stats: CacheStats = {
      hitRatio: this.calculateHitRatio(),
      size: this.cache.size,
      maxSize: this._config.maxSize,
      evictions: 0, // No se está rastreando, se podría implementar
      memoryUsage: this.calculateMemoryUsage()
    };

    // Registrar estadísticas para análisis
    logger.debug('Cache Stats:', stats);
    return stats;
  }

  private calculateHitRatio(): number {
    let hits = 0;
    let total = 0;

    for (const entry of this.cache.values()) {
      hits += entry.metadata.accessCount;
      total += entry.metadata.accessCount + 1;
    }

    return total > 0 ? hits / total : 0;
  }

  private calculateMemoryUsage(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + (entry.metadata.size || 0), 0);
  }
} 