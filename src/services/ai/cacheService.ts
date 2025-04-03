import { AIResponse, CacheItem, AIQuery } from './types';
import {
  smartCacheInvalidationStrategy,
  CacheMetadata,
  cachePrioritizationService,
  CacheItemStats
} from './cache';
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
  private cacheStats: Map<string, CacheItemStats> = new Map();
  private startTime: number;

  private constructor() {
    this.logger = new Logger('CacheService');
    this.logger.info('CacheService initialized with smart invalidation and prioritization strategies');
    this.startTime = Date.now();

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
      // Registrar fallo en caché
      cachePrioritizationService.recordAccess(queryKey, false);
      return null;
    }

    // Verificar si el item expiró
    if (this.isExpired(cacheItem)) {
      this.logger.debug('Cache miss: expired item', { queryKey });
      this.cache.delete(queryKey);

      // Registrar fallo por expiración
      cachePrioritizationService.recordAccess(queryKey, false);

      return null;
    }

    this.logger.debug('Cache hit', {
      queryKey,
      metadata: cacheItem.metadata
    });

    // Registrar acceso exitoso
    cachePrioritizationService.recordAccess(queryKey, true);

    return cacheItem.value;
  }

  /**
   * Almacena una respuesta en el caché
   * @param query - La consulta original
   * @param response - La respuesta de IA a cachear
   * @param processingStats - Estadísticas opcionales como tiempo de procesamiento y costo
   */
  public async set(
    query: AIQuery,
    response: AIResponse,
    processingStats?: {
      processingTime?: number;
      estimatedCost?: number;
    }
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

    // Registrar estadísticas de procesamiento para el servicio de priorización
    if (processingStats) {
      cachePrioritizationService.recordAccess(
        queryKey,
        false,
        processingStats.processingTime,
        processingStats.estimatedCost
      );
    }
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
    // Convertir caché en array para procesamiento
    const entries = Array.from(this.cache.entries());

    // Preparar datos para el servicio de priorización
    const cacheItems = entries.map(([key, item]) => {
      const stats = this.cacheStats.get(key);
      return [key, item, stats] as [string, CacheItem<AIResponse>, CacheItemStats | undefined];
    });

    // Calcular cuántos elementos conservar (80% de la capacidad máxima)
    const targetCount = Math.floor(this.MAX_CACHE_SIZE * 0.8);

    // Obtener claves a eliminar del servicio de priorización
    const keysToRemove = cachePrioritizationService.getItemsToEvict(cacheItems, targetCount);

    // Eliminar elementos
    for (const key of keysToRemove) {
      this.cache.delete(key);
    }

    // Limpiar estadísticas
    cachePrioritizationService.purgeStats(keysToRemove);

    this.logger.debug(`Evicted ${keysToRemove.length} low priority cache items using prioritization service`);
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
          const category = metadata.queryCategory;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      } else {
        expiredItems++;
      }
    }

    // Obtener estadísticas del servicio de priorización
    const prioritizationStats = cachePrioritizationService.getStatistics();

    return {
      totalItems: this.cache.size,
      activeItems,
      expiredItems,
      categoryCounts,
      uptime: Math.floor((Date.now() - this.startTime) / 1000 / 60), // minutos
      maxCacheSize: this.MAX_CACHE_SIZE,
      usagePercentage: (activeItems / this.MAX_CACHE_SIZE) * 100,
      prioritizationStats
    };
  }
}

// Exportar una instancia única del servicio de caché
export const cacheService = CacheService.getInstance();
