export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  metadata?: CacheMetadata;
}

export interface CacheConfig {
  ttlMs: number;
  maxSize: number;
  cleanupInterval?: number;
  patientBased?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleared: Date;
}

export interface CacheMetadata {
  patientId?: string;
  section?: string;
  ttl?: number;
  dynamic?: boolean;
  [key: string]: unknown;
} 