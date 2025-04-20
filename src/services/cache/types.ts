export interface CacheEntry<T> {
  data: T;
  metadata: CacheMetadata;
  expiresAt: number;
  timestamp: number;
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
  evictions: number;
  currentSize: number;
  maxSize: number;
  estimatedMemoryUsage?: number;
  lastCleared: Date;
  size: number;
}

export interface CacheMetadata {
  lastAccess: number;
  accessCount: number;
  size: number;
  patientId?: string;
  section?: string;
  ttl?: number;
  dynamic?: boolean;
} 