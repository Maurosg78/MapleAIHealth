import { VerificationResult } from '../MedicalSourceVerifier';

interface CacheEntry {
  result: VerificationResult;
  timestamp: number;
  ttl: number;
}

export class SourceVerificationCache {
  private cache: Map<string, CacheEntry>;
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(defaultTTL: number = 24 * 60 * 60 * 1000, maxSize: number = 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
  }

  /**
   * Obtiene un resultado del caché
   */
  public async get(key: string): Promise<VerificationResult | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si la entrada ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  /**
   * Almacena un resultado en el caché
   */
  public async set(key: string, result: VerificationResult, ttl?: number): Promise<void> {
    // Limpiar entradas expiradas antes de agregar una nueva
    await this.cleanup();

    // Si el caché está lleno, eliminar la entrada más antigua
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Elimina una entrada del caché
   */
  public async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Limpia todo el caché
   */
  public async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Limpia las entradas expiradas del caché
   */
  public async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtiene el tamaño actual del caché
   */
  public getSize(): number {
    return this.cache.size;
  }
} 