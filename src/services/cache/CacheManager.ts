import { CacheMetadata, CacheStats, CacheOptions } from './types';;;;;
import { compress, decompress } from '../utils/compression';;;;;
import { Logger } from '../utils/logger';;;;;

export class CacheManager {
  private cache: Map<string, { data: unknown; metadata: CacheMetadata }>;
  private hotQueue: string[];
  private coldQueue: string[];
  private stats: CacheStats;
  private options: Required<CacheOptions>;
  private logger: Logger;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.hotQueue = [];
    this.coldQueue = [];
    this.options = {
      ttlMs: options.ttlMs || 3600000, // 1 hora por defecto
      maxSize: options.maxSize || 100 * 1024 * 1024, // 100MB por defecto
      compressionThreshold: options.compressionThreshold || 1024, // 1KB por defecto
      coldQueueSize: options.coldQueueSize || 1000
    };
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: Date.now(),
      compressionRatio: 1,
      avgAccessTime: 0,
      totalAccesses: 0
    };
    this.logger = new Logger('CacheManager');
  }

  public async get(key: string): Promise<any | null> {
    const start = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    entry.metadata.lastAccess = Date.now();
    entry.metadata.accessCount++;

    this.updateAccessStats(start);
    this.updateQueues(key);

    if (entry.metadata.compressed) {
      return await decompress(entry.data);
    }
    return entry.data;
  }

  public async set(key: string, value: unknown, metadata: Partial<CacheMetadata> = {}): Promise<void> {
    const size = this.calculateSize(value);
    const shouldCompress = size > this.options.compressionThreshold;

    const fullMetadata: CacheMetadata = {
      size,
      compressed: shouldCompress,
      lastAccess: Date.now(),
      accessCount: 0,
      ...metadata
    };

    let data = value;
    if (shouldCompress) {
      data = await compress(value);
      fullMetadata.size = this.calculateSize(data);
    }

    await this.evictIfNeeded(fullMetadata.size);
    
    this.cache.set(key, { data, metadata: fullMetadata });
    this.stats.size += fullMetadata.size;
    this.updateQueues(key);
  }

  private updateQueues(key: string): void {
    const hotIndex = this.hotQueue.indexOf(key);
    const coldIndex = this.coldQueue.indexOf(key);

    if (hotIndex !== -1) {
      this.hotQueue.splice(hotIndex, 1);
      this.hotQueue.unshift(key);
    } else if (coldIndex !== -1) {
      this.coldQueue.splice(coldIndex, 1);
      this.hotQueue.unshift(key);
      if (this.hotQueue.length > this.options.coldQueueSize) {
        const oldestHot = this.hotQueue.pop();
        if (oldestHot) this.coldQueue.unshift(oldestHot);
      }
    } else {
      this.coldQueue.unshift(key);
      if (this.coldQueue.length > this.options.coldQueueSize) {
        this.coldQueue.pop();
      }
    }
  }

  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    while (this.stats.size + newEntrySize > this.options.maxSize && this.coldQueue.length > 0) {
      const keyToEvict = this.coldQueue.pop();
      if (keyToEvict) {
        const entry = this.cache.get(keyToEvict);
        if (entry) {
          this.stats.size -= entry.metadata.size;
          this.cache.delete(keyToEvict);
        }
      }
    }
  }

  private calculateSize(data: unknown): number {
    return Buffer.from(JSON.stringify(data)).length;
  }

  private updateAccessStats(startTime: number): void {
    const accessTime = Date.now() - startTime;
    this.stats.totalAccesses++;
    this.stats.avgAccessTime = (this.stats.avgAccessTime * (this.stats.totalAccesses - 1) + accessTime) / this.stats.totalAccesses;
  }

  public getStats(): CacheStats {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses),
      missRate: this.stats.misses / (this.stats.hits + this.stats.misses),
      currentSize: this.stats.size,
      hotQueueSize: this.hotQueue.length,
      coldQueueSize: this.coldQueue.length
    };
  }
} 