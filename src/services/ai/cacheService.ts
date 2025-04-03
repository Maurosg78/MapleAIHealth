import { AIResponse, CacheItem, AIQuery } from './types';
import { smartCacheInvalidationStrategy, CacheMetadata } from './cache';
import { Logger } from './logger';

/**
 * Tipo extendido de metadata para el caché que permite indexación por string
 */
type CacheItemMetadata = CacheMetadata & Record<string, unknown>;

/**
 * Servicio para cachear respuestas de IA y optimizar costos
 */
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<AIResponse>> = new Map();
  private readonly MAX_CACHE_SIZE: number = 100;
  private readonly logger: Logger;

  private constructor() {
    this.logger = new Logger('CacheService');
    this.logger.info('CacheService initialized with smart invalidation strategy');

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
   * @param query - La consulta para buscar en el caché
   * @returns La respuesta cacheada o null si no existe
   */
  public async get(query: AIQuery): Promise<AIResponse | null> {
    const queryKey = this.generateCacheKey(query);
    const cacheItem = this.cache.get(queryKey);

    if (!cacheItem) {
      return null;
    }

    // Verificar si el item expiró
    if (this.isExpired(cacheItem)) {
      this.logger.debug('Cache miss: expired item', { queryKey });
      this.cache.delete(queryKey);
      return null;
    }

    this.logger.debug('Cache hit', {
      queryKey,
      metadata: cacheItem.metadata
    });

    return cacheItem.value;
  }

  /**
   * Almacena una respuesta en el caché
   * @param query - La consulta original
   * @param response - La respuesta de IA a cachear
   */
  public async set(
    query: AIQuery,
    response: AIResponse
  ): Promise<void> {
    const queryKey = this.generateCacheKey(query);

    // Generar metadatos inteligentes para esta entrada
    const metadata = smartCacheInvalidationStrategy.generateMetadata(query);

    this.logger.debug('Caching response', {
      queryKey,
      category: metadata.queryCategory,
      tags: metadata.tags,
      priority: metadata.priority
    });

    // Verificar si necesitamos limpiar el caché antes de agregar un nuevo item
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLowPriorityItems();
    }

    this.cache.set(queryKey, {
      value: response,
      timestamp: Date.now(),
      metadata: metadata as CacheItemMetadata
    });
  }

  /**
   * Elimina una respuesta del caché
   * @param query - La consulta a eliminar
   */
  public delete(query: AIQuery): void {
    const queryKey = this.generateCacheKey(query);
    this.cache.delete(queryKey);
  }

  /**
   * Limpia todo el caché
   */
  public clear(): void {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }

  /**
   * Invalida entradas del caché basadas en etiquetas
   * @param tags - Lista de etiquetas a invalidar
   * @returns Número de entradas invalidadas
   */
  public invalidateByTags(tags: string[]): number {
    this.logger.info('Invalidating cache entries by tags', { tags });

    let invalidatedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      const metadata = item.metadata as CacheItemMetadata;

      if (metadata && metadata.tags) {
        // Si alguna de las etiquetas de la entrada coincide con las etiquetas a invalidar
        if (metadata.tags.some(tag => tags.includes(tag))) {
          this.cache.delete(key);
          invalidatedCount++;
        }
      }
    }

    this.logger.info(`Invalidated ${invalidatedCount} cache entries`);
    return invalidatedCount;
  }

  /**
   * Invalida entradas del caché relacionadas con un paciente
   * @param patientId - ID del paciente
   * @returns Número de entradas invalidadas
   */
  public invalidateByPatientId(patientId: string): number {
    this.logger.info('Invalidating cache entries for patient', { patientId });
    return this.invalidateByTags([`patient:${patientId}`]);
  }

  /**
   * Verifica si un elemento del caché ha expirado
   */
  private isExpired(cacheItem: CacheItem<AIResponse>): boolean {
    const metadata = cacheItem.metadata as CacheItemMetadata;

    if (metadata && metadata.expiresAt) {
      return Date.now() > metadata.expiresAt;
    }

    // Fallback a TTL estándar si no hay metadatos inteligentes
    return Date.now() - cacheItem.timestamp > 24 * 60 * 60 * 1000; // 24 horas
  }

  /**
   * Elimina elementos expirados del caché
   */
  private cleanupExpiredItems(): void {
    let expiredCount = 0;

    for (const [key, value] of this.cache.entries()) {
      if (this.isExpired(value)) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.logger.debug(`Cleaned up ${expiredCount} expired cache items`);
    }

    // Programar la próxima limpieza
    setTimeout(() => this.cleanupExpiredItems(), 60 * 60 * 1000); // Cada hora
  }

  /**
   * Elimina los elementos de menor prioridad cuando el caché está lleno
   */
  private evictLowPriorityItems(): void {
    const entries = Array.from(this.cache.entries());

    // Ordenar por prioridad (menor primero) y luego por timestamp (más antiguos primero)
    entries.sort((a, b) => {
      const metadataA = a[1].metadata as CacheItemMetadata;
      const metadataB = b[1].metadata as CacheItemMetadata;

      const priorityA = metadataA?.priority ?? 0;
      const priorityB = metadataB?.priority ?? 0;

      // Si las prioridades son iguales, usar timestamp
      if (priorityA === priorityB) {
        return a[1].timestamp - b[1].timestamp;
      }

      return priorityA - priorityB;
    });

    // Eliminar el 20% de menor prioridad
    const itemsToRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2);
    for (let i = 0; i < itemsToRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }

    this.logger.debug(`Evicted ${itemsToRemove} low priority cache items`);
  }

  /**
   * Genera una clave única para la consulta
   * @param query - Consulta de IA
   * @returns Clave para el caché
   */
  private generateCacheKey(query: AIQuery): string {
    // Extraer elementos clave de la consulta
    const { query: queryText, patientId, options } = query;

    // Crear un objeto simple con los elementos relevantes para la clave
    const keyObj = {
      q: queryText,
      p: patientId,
      o: options
    };

    // Convertir a string
    return JSON.stringify(keyObj);
  }

  /**
   * Obtiene estadísticas del caché
   */
  public getStats(): Record<string, unknown> {
    let activeItems = 0;
    let expiredItems = 0;
    const categoryCounts: Record<string, number> = {};

    for (const item of this.cache.values()) {
      if (!this.isExpired(item)) {
        activeItems++;
        // Contar por categoría
        const metadata = item.metadata as CacheItemMetadata;
        if (metadata?.queryCategory) {
          categoryCounts[metadata.queryCategory] =
            (categoryCounts[metadata.queryCategory] || 0) + 1;
        }
      } else {
        expiredItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      activeItems,
      expiredItems,
      maxSize: this.MAX_CACHE_SIZE,
      categories: categoryCounts
    };
  }
}

// Exportar una instancia única del servicio de caché
export const cacheService = CacheService.getInstance();
