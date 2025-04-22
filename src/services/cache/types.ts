export interface CacheEntry<T> {
  key?: string;
  data: T;
  metadata: CacheMetadata;
  expiresAt: number;
  timestamp: number;
  score?: number;
}

export interface CacheConfig {
  maxSize: number;
  ttlMs: number;
  patientBased?: boolean;
  sizeEstimator?: (data: unknown) => number;
  cleanupInterval?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: number;
  compressionRatio: number;
  avgAccessTime: number;
  totalAccesses: number;
  hitRate?: number;
  missRate?: number;
  currentSize?: number;
  hotQueueSize?: number;
  coldQueueSize?: number;
}

export interface CacheMetadata {
  size: number;
  compressed: boolean;
  lastAccess: number;
  accessCount: number;
  section?: string;
  patientId?: string;
}

export interface CacheOptions {
  ttlMs?: number;
  maxSize?: number;
  compressionThreshold?: number;
  coldQueueSize?: number;
} 