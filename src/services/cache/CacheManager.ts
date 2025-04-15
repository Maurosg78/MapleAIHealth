import { CacheConfig, CacheStats, CacheMetadata } from './types';

export class CacheManager<T> {
  private cache: Map<string, { data: T; timestamp: number; metadata?: CacheMetadata }>;
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout;
  private accessCount: Map<string, number>;
  private lastAccess: Map<string, number>;

  constructor(config: CacheConfig) {
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
    this.cleanupInterval = setInterval(() => this.cleanup(), config.cleanupInterval || 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    let entriesRemoved = 0;

    // Limpiar entradas expiradas
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.config.ttlMs) {
        this.removeEntry(key);
        entriesRemoved++;
      }
    }

    // Limitar tamaño máximo usando LRU (Least Recently Used)
    if (this.cache.size > this.config.maxSize) {
      const entriesToRemove = this.cache.size - this.config.maxSize;
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => {
          const aLastAccess = this.lastAccess.get(a[0]) || 0;
          const bLastAccess = this.lastAccess.get(b[0]) || 0;
          return aLastAccess - bLastAccess;
        });
      
      for (let i = 0; i < entriesToRemove; i++) {
        this.removeEntry(sortedEntries[i][0]);
        entriesRemoved++;
      }
    }

    if (entriesRemoved > 0) {
      this.stats.size = this.cache.size;
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

    if (Date.now() - entry.timestamp > this.config.ttlMs) {
      this.removeEntry(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return undefined;
    }

    // Actualizar contadores de acceso
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    
    this.stats.hits++;
    return entry.data;
  }

  public set(key: string, value: T, metadata?: CacheMetadata): void {
    // Verificar si la entrada ya existe y actualizar si es necesario
    if (this.cache.has(key)) {
      const existingEntry = this.cache.get(key)!;
      if (this.shouldUpdateEntry(existingEntry, metadata)) {
        this.cache.set(key, {
          data: value,
          timestamp: Date.now(),
          metadata
        });
        this.lastAccess.set(key, Date.now());
      }
      return;
    }

    // Verificar si hay espacio disponible
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      metadata
    });
    this.accessCount.set(key, 0);
    this.lastAccess.set(key, Date.now());
    this.stats.size = this.cache.size;
  }

  private shouldUpdateEntry(
    existingEntry: { data: T; timestamp: number; metadata?: CacheMetadata },
    newMetadata?: CacheMetadata
  ): boolean {
    // Actualizar si los metadatos son diferentes
    if (JSON.stringify(existingEntry.metadata) !== JSON.stringify(newMetadata)) {
      return true;
    }

    // Actualizar si la entrada es muy antigua
    if (Date.now() - existingEntry.timestamp > this.config.ttlMs / 2) {
      return true;
    }

    return false;
  }

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

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = setInterval(() => this.cleanup(), config.cleanupInterval);
    }
  }

  public invalidateByPatient(patientId: string): void {
    for (const [key, value] of this.cache.entries()) {
      if (value.metadata?.patientId === patientId) {
        this.removeEntry(key);
      }
    }
    this.stats.size = this.cache.size;
  }

  public invalidateBySection(section: string): void {
    for (const [key, value] of this.cache.entries()) {
      if (value.metadata?.section === section) {
        this.removeEntry(key);
      }
    }
    this.stats.size = this.cache.size;
  }

  public getAccessCount(key: string): number {
    return this.accessCount.get(key) || 0;
  }

  public getLastAccess(key: string): number {
    return this.lastAccess.get(key) || 0;
  }
} 