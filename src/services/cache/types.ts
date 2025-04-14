export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  metadata: {
    patientId?: string;
    section?: string;
    lastAccessed: number;
    accessCount: number;
  };
}

export interface CacheConfig {
  ttlMs: number;
  maxSize: number;
  cleanupInterval: number;
  patientBased: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleared: Date;
} 