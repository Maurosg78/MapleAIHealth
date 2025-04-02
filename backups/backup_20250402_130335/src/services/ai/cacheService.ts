import { CachedResponse, AIResponse } from './types';
import { createHash } from 'crypto';

export interface CacheConfig {
  maxSize: number;
  ttl: number;
  cleanupInterval: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  totalQueries: number;
  averageAccessCount: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export class CacheService {
  private static instance: CacheService;
  private readonly cache: Map<string, CachedResponse> = new Map();
  private readonly config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    totalQueries: number;
  };

  private constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: config?.maxSize ?? 1000,
      ttl: config?.ttl ?? 24 * 60 * 60 * 1000, // 24 horas por defecto
      cleanupInterval: config?.cleanupInterval ?? 60 * 60 * 1000, // 1 hora por defecto
    };
    this.stats = {
      hits: 0,
      misses: 0,
      totalQueries: 0,
    };
    this.startCleanupInterval();
  }

  public static getInstance(config?: Partial<CacheConfig>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  private generateQueryHash(query: string): string {
    return createHash('sha256').update(query).digest('hex');
  }

  public async get(query: string): Promise<AIResponse | null> {
    const queryHash = this.generateQueryHash(query);
    const cached = this.cache.get(queryHash);

    if (!cached) {
      this.stats.misses++;
      this.stats.totalQueries++;
      return null;
    }

    // Verificar TTL
    const now = new Date().getTime();
    const cachedTime = new Date(cached.timestamp).getTime();
    if (now - cachedTime > this.config.ttl) {
      this.cache.delete(queryHash);
      this.stats.misses++;
      this.stats.totalQueries++;
      return null;
    }

    // Actualizar estadísticas
    this.stats.hits++;
    this.stats.totalQueries++;
    cached.lastAccessed = new Date().toISOString();
    cached.accessCount++;

    return cached.response;
  }

  public async set(
    query: string,
    response: AIResponse,
    metadata?: CachedResponse['metadata']
  ): Promise<void> {
    const queryHash = this.generateQueryHash(query);

    // Limpiar caché si está lleno
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    const cachedResponse: CachedResponse = {
      query,
      response,
      timestamp: new Date().getTime(),
      id: queryHash,
      queryHash,
      lastAccessed: new Date().toISOString(),
      accessCount: 0,
      metadata,
    };

    this.cache.set(queryHash, cachedResponse);
  }

  private cleanup(): void {
    // Eliminar entradas expiradas
    const now = new Date().getTime();
    for (const [key, value] of this.cache.entries()) {
      const cachedTime = new Date(value.timestamp).getTime();
      if (now - cachedTime > this.config.ttl) {
        this.cache.delete(key);
      }
    }

    // Si aún está lleno, eliminar las entradas menos accedidas
    if (this.cache.size >= this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => {
        // Priorizar por frecuencia de acceso y tiempo desde último acceso
        const accessScore = b[1].accessCount - a[1].accessCount;
        if (accessScore !== 0) return accessScore;

        const lastAccessA = new Date(a[1].lastAccessed).getTime();
        const lastAccessB = new Date(b[1].lastAccessed).getTime();
        return lastAccessB - lastAccessA;
      });

      const toRemove = entries.slice(Math.floor(this.config.maxSize * 0.8));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  public async clear(): Promise<void> {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalQueries: 0,
    };
  }

  public getStats(): CacheStats {
    const totalQueries = this.stats.totalQueries;
    const hitRate = totalQueries > 0 ? this.stats.hits / totalQueries : 0;
    const missRate = totalQueries > 0 ? this.stats.misses / totalQueries : 0;

    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;
    let totalAccessCount = 0;

    for (const entry of this.cache.values()) {
      const entryDate = new Date(entry.timestamp);
      if (!oldestEntry || entryDate < oldestEntry) {
        oldestEntry = entryDate;
      }
      if (!newestEntry || entryDate > newestEntry) {
        newestEntry = entryDate;
      }
      totalAccessCount += entry.accessCount;
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      missRate,
      totalQueries,
      averageAccessCount:
        this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
      oldestEntry,
      newestEntry,
    };
  }

  public updateConfig(config: Partial<CacheConfig>): void {
    Object.assign(this.config, config);
  }
}

// Exportar una instancia por defecto
export const cacheService = CacheService.getInstance();
