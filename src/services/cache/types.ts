export interface CacheEntry<T> {
  key: string;
  value: T;
  metadata: CacheMetadata;
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
  evictions: number;
  totalEntries: number;
  totalSize: number;
  maxEntrySize: number;
  maxAccessCount: number;
  totalEntryLifetime: number;
}

export interface CacheMetadata {
  lastAccess: number;
  accessCount: number;
  size: number;
  patientId?: string;
  section?: string;
  isCritical?: boolean;
} 