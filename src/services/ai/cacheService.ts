import { AIResponse, CacheItem } from './types';

/**
 * Servicio para cachear respuestas de IA y optimizar costos
 */
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<AIResponse>> = new Map();
  private readonly TTL: number = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
  private readonly MAX_CACHE_SIZE: number = 100;

  private constructor() {
    // Inicialización del caché
    this.cleanupExpiredItems();
  }

  /**
   * Obtiene la instancia única del servicio de caché
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Obtiene una respuesta cacheada si existe
   * @param query - La clave de la consulta para buscar en el caché
   * @returns La respuesta cacheada o null si no existe
   */
  public async get(query: string): Promise<AIResponse | null> {
    const cacheItem = this.cache.get(query);

    if (!cacheItem) {
      return null;
    }

    // Verificar si el item expiró
    if (this.isExpired(cacheItem)) {
      this.cache.delete(query);
      return null;
    }

    return cacheItem.value;
  }

  /**
   * Almacena una respuesta en el caché
   * @param query - La clave de la consulta
   * @param response - La respuesta de IA a cachear
   * @param metadata - Metadatos opcionales sobre la respuesta
   */
  public async set(
    query: string,
    response: AIResponse,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    // Verificar si necesitamos limpiar el caché antes de agregar un nuevo item
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestItems();
    }

    this.cache.set(query, {
      value: response,
      timestamp: Date.now(),
      metadata
    });
  }

  /**
   * Elimina una respuesta del caché
   * @param query - La clave de la consulta a eliminar
   */
  public delete(query: string): void {
    this.cache.delete(query);
  }

  /**
   * Limpia todo el caché
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Verifica si un elemento del caché ha expirado
   */
  private isExpired(cacheItem: CacheItem<AIResponse>): boolean {
    const now = Date.now();
    return now - cacheItem.timestamp > this.TTL;
  }

  /**
   * Elimina elementos expirados del caché
   */
  private cleanupExpiredItems(): void {
    for (const [key, value] of this.cache.entries()) {
      if (this.isExpired(value)) {
        this.cache.delete(key);
      }
    }

    // Programar la próxima limpieza
    setTimeout(() => this.cleanupExpiredItems(), 60 * 60 * 1000); // Cada hora
  }

  /**
   * Elimina los elementos más antiguos cuando el caché está lleno
   */
  private evictOldestItems(): void {
    const entries = Array.from(this.cache.entries());

    // Ordenar por timestamp (más antiguos primero)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Eliminar el 20% más antiguo
    const itemsToRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2);
    for (let i = 0; i < itemsToRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  public getStats(): Record<string, unknown> {
    const now = Date.now();
    let activeItems = 0;
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      if (now - item.timestamp <= this.TTL) {
        activeItems++;
      } else {
        expiredItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      activeItems,
      expiredItems,
      maxSize: this.MAX_CACHE_SIZE,
      ttlHours: this.TTL / (60 * 60 * 1000)
    };
  }
}

// Exportar una instancia única del servicio de caché
export const cacheService = CacheService.getInstance();
