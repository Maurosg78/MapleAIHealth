import { CacheEntry, CacheConfig, CacheStats } from './types';

export class CacheManager<T> {
  private store: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout;
  private accessCount: number = 0;
  private hitCount: number = 0;

  constructor(config: CacheConfig) {
    this.store = new Map();
    this.config = config;
    this.cleanupInterval = setInterval(() => this.cleanup(), config.cleanupInterval);
  }

  public set(key: string, data: T, metadata: Partial<CacheEntry<T>['metadata']> = {}): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      metadata: {
        lastAccessed: Date.now(),
        accessCount: 0,
        ...metadata
      }
    };

    this.store.set(key, entry);
    this.ensureSizeLimit();
  }

  public get(key: string): T | null {
    this.accessCount++;
    const entry = this.store.get(key);
    if (!entry) return null;

    this.hitCount++;

    // Actualizar metadatos de acceso
    entry.metadata.lastAccessed = Date.now();
    entry.metadata.accessCount++;

    // Verificar TTL
    if (Date.now() - entry.timestamp > this.config.ttlMs) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  private ensureSizeLimit(): void {
    if (this.store.size <= this.config.maxSize) return;

    // Ordenar entradas por último acceso y frecuencia
    const entries = Array.from(this.store.entries())
      .sort(([, a], [, b]) => {
        const aScore = a.metadata.accessCount / (Date.now() - a.metadata.lastAccessed);
        const bScore = b.metadata.accessCount / (Date.now() - b.metadata.lastAccessed);
        return aScore - bScore;
      });

    // Eliminar las entradas menos utilizadas
    const entriesToRemove = entries.slice(0, entries.length - this.config.maxSize);
    entriesToRemove.forEach(([key]) => this.store.delete(key));
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > this.config.ttlMs) {
        this.store.delete(key);
      }
    }
  }

  public clear(): void {
    this.store.clear();
    this.accessCount = 0;
    this.hitCount = 0;
  }

  public getStats(): CacheStats {
    return {
      hits: this.hitCount,
      misses: this.accessCount - this.hitCount,
      size: this.store.size,
      lastCleared: new Date()
    };
  }

  public invalidateByPatient(patientId: string): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.metadata.patientId === patientId) {
        this.store.delete(key);
      }
    }
  }

  public invalidateBySection(section: string): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.metadata.section === section) {
        this.store.delete(key);
      }
    }
  }

  public updateConfig(config: Partial<CacheConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
} 