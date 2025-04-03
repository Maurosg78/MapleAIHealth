import { Logger } from '../logger';
import { AIQuery, AIResponse, CacheItem } from '../types';
import { CacheMetadata, QueryCategory } from './SmartCacheInvalidationStrategy';

/**
 * Tipos de estrategias de priorización
 */
export type PrioritizationStrategy =
  | 'medical-content'   // Prioriza contenido médico basado en evidencia
  | 'critical-queries'  // Prioriza consultas críticas para el flujo de trabajo
  | 'resource-intensive' // Prioriza consultas que consumen muchos recursos
  | 'recency-based'     // Prioriza basado en recencia
  | 'access-frequency'  // Prioriza basado en frecuencia de acceso
  | 'hybrid';           // Combina múltiples estrategias

// Para tipado extendido de AIQuery.options
interface ExtendedQueryOptions {
  provider?: string;
  language?: string;
  maxTokens?: number;
  context?: string;
  priority?: string;
}

/**
 * Configuración para la priorización de caché
 */
export interface CachePrioritizationConfig {
  // Estrategia principal a usar
  strategy: PrioritizationStrategy;

  // Pesos para cada factor en la estrategia híbrida (0-100)
  weights?: {
    contentType?: number;
    queryComplexity?: number;
    accessFrequency?: number;
    recency?: number;
    criticalContext?: number;
  };

  // Porcentaje de caché a limpiar cuando está lleno (10-50)
  evictionPercentage?: number;

  // Categorías prioritarias (de mayor a menor prioridad)
  priorityCategories?: QueryCategory[];

  // Estadísticas de uso para optimización continua
  collectStats?: boolean;
}

/**
 * Estadísticas de uso para un elemento en caché
 */
export interface CacheItemStats {
  accessCount: number;
  lastAccessed: number;
  hitRate: number;
  avgProcessingTime: number;
  estimatedCost: number;
}

/**
 * Interfaz para la estrategia de priorización
 */
export interface ICachePrioritizationStrategy {
  /**
   * Calcula la puntuación de prioridad para un elemento
   * @param query Query original
   * @param cacheItem Elemento almacenado en caché
   * @param stats Estadísticas de uso (opcional)
   * @returns Puntuación de prioridad (0-100)
   */
  calculatePriorityScore(
    query: AIQuery,
    cacheItem: CacheItem<AIResponse>,
    stats?: CacheItemStats
  ): number;

  /**
   * Determine cuáles elementos deben ser removidos cuando el caché está lleno
   * @param cacheItems Lista de elementos en caché
   * @param targetCount Número de elementos a conservar
   * @returns Claves de los elementos a remover
   */
  getItemsToEvict(
    cacheItems: Array<[string, CacheItem<AIResponse>, CacheItemStats?]>,
    targetCount: number
  ): string[];
}

/**
 * Servicio de priorización de caché para mejorar la eficiencia de memoria
 * y optimizar el rendimiento con diferentes estrategias.
 */
export class CachePrioritizationService implements ICachePrioritizationStrategy {
  private static instance: CachePrioritizationService;
  private readonly logger: Logger;
  private config: CachePrioritizationConfig;

  // Mapeo de estadísticas de uso por clave de caché
  private cacheStats: Map<string, CacheItemStats> = new Map();

  // Pesos por defecto para la estrategia híbrida
  private readonly defaultWeights = {
    contentType: 30,
    queryComplexity: 20,
    accessFrequency: 15,
    recency: 15,
    criticalContext: 20
  };

  /**
   * Constructor privado para implementar patrón singleton
   */
  private constructor(config: CachePrioritizationConfig) {
    this.logger = new Logger('CachePrioritizationService');
    this.config = {
      ...config,
      evictionPercentage: config.evictionPercentage || 20,
      weights: {
        ...this.defaultWeights,
        ...config.weights
      },
      priorityCategories: config.priorityCategories || [
        'evidence-check',
        'clinical-analysis',
        'patient-history',
        'general',
        'development',
        'urgent'
      ],
      collectStats: config.collectStats !== undefined ? config.collectStats : true
    };

    this.logger.info('CachePrioritizationService initialized', {
      strategy: this.config.strategy,
      evictionPercentage: this.config.evictionPercentage
    });
  }

  /**
   * Obtiene la instancia única
   */
  public static getInstance(config?: CachePrioritizationConfig): CachePrioritizationService {
    if (!CachePrioritizationService.instance) {
      CachePrioritizationService.instance = new CachePrioritizationService(
        config || { strategy: 'hybrid' }
      );
    } else if (config) {
      // Actualizar configuración si se proporciona
      CachePrioritizationService.instance.updateConfig(config);
    }

    return CachePrioritizationService.instance;
  }

  /**
   * Actualiza la configuración del servicio
   */
  public updateConfig(config: Partial<CachePrioritizationConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      weights: {
        ...this.config.weights,
        ...config.weights
      }
    };

    this.logger.info('Configuration updated', {
      strategy: this.config.strategy,
      evictionPercentage: this.config.evictionPercentage
    });
  }

  /**
   * Registra un acceso a un elemento en caché
   * @param cacheKey Clave del elemento
   * @param hit Si fue un acierto o fallo
   * @param processingTime Tiempo de procesamiento si fue un fallo
   * @param estimatedCost Costo estimado si fue un fallo
   */
  public recordAccess(
    cacheKey: string,
    hit: boolean,
    processingTime?: number,
    estimatedCost?: number
  ): void {
    if (!this.config.collectStats) return;

    const stats = this.cacheStats.get(cacheKey) || {
      accessCount: 0,
      lastAccessed: 0,
      hitRate: 0,
      avgProcessingTime: 0,
      estimatedCost: 0
    };

    // Actualizar estadísticas
    stats.accessCount++;
    stats.lastAccessed = Date.now();

    // Actualizar tasa de aciertos
    const previousHits = stats.hitRate * (stats.accessCount - 1);
    stats.hitRate = (previousHits + (hit ? 1 : 0)) / stats.accessCount;

    // Actualizar tiempo de procesamiento y costo si aplica
    if (!hit && processingTime !== undefined) {
      stats.avgProcessingTime = (
        (stats.avgProcessingTime * (stats.accessCount - 1)) + processingTime
      ) / stats.accessCount;

      if (estimatedCost !== undefined) {
        stats.estimatedCost += estimatedCost;
      }
    }

    this.cacheStats.set(cacheKey, stats);
  }

  /**
   * Elimina estadísticas para entradas eliminadas del caché
   * @param keys Claves de elementos eliminados
   */
  public purgeStats(keys: string[]): void {
    for (const key of keys) {
      this.cacheStats.delete(key);
    }
  }

  /**
   * Calcula la puntuación de prioridad para un elemento
   * @param query Query original
   * @param cacheItem Elemento almacenado en caché
   * @param stats Estadísticas de uso (opcional)
   * @returns Puntuación de prioridad (0-100)
   */
  public calculatePriorityScore(
    query: AIQuery,
    cacheItem: CacheItem<AIResponse>,
    stats?: CacheItemStats
  ): number {
    // Si ya hay una puntuación calculada por SmartCacheInvalidationStrategy, usarla como base
    const metadata = cacheItem.metadata as (CacheMetadata & Record<string, unknown>);
    let score = metadata?.priority || 50;

    // Aplicar estrategia específica
    switch (this.config.strategy) {
      case 'medical-content':
        score = this.calculateMedicalContentScore(query, cacheItem, score);
        break;

      case 'critical-queries':
        score = this.calculateCriticalQueriesScore(query, cacheItem, score);
        break;

      case 'resource-intensive':
        score = this.calculateResourceIntensiveScore(query, cacheItem, score, stats);
        break;

      case 'recency-based':
        score = this.calculateRecencyScore(cacheItem, score);
        break;

      case 'access-frequency':
        score = this.calculateAccessFrequencyScore(stats, score);
        break;

      case 'hybrid':
        score = this.calculateHybridScore(query, cacheItem, stats);
        break;
    }

    // Asegurar que esté en el rango 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determina qué elementos deben ser eliminados cuando el caché está lleno
   * @param cacheItems Lista de elementos en caché
   * @param targetCount Número de elementos a conservar
   * @returns Claves de los elementos a remover
   */
  public getItemsToEvict(
    cacheItems: Array<[string, CacheItem<AIResponse>, CacheItemStats?]>,
    targetCount: number
  ): string[] {
    // Calcular puntuación para cada elemento
    const scoredItems = cacheItems.map(([key, item, stats]) => {
      const query = this.extractQueryFromCacheKey(key);
      const score = this.calculatePriorityScore(query, item, stats);
      return { key, score };
    });

    // Ordenar por puntuación (menor primero)
    scoredItems.sort((a, b) => a.score - b.score);

    // Obtener las claves a eliminar (menor puntuación)
    const itemsToRemoveCount = Math.max(0, scoredItems.length - targetCount);

    if (itemsToRemoveCount === 0) return [];

    const keysToRemove = scoredItems
      .slice(0, itemsToRemoveCount)
      .map(item => item.key);

    this.logger.debug(`Selected ${keysToRemove.length} items to evict from cache`, {
      strategy: this.config.strategy,
      totalItems: cacheItems.length,
      targetCount
    });

    return keysToRemove;
  }

  /**
   * Calcula la puntuación para contenido médico basado en evidencia
   */
  private calculateMedicalContentScore(
    query: AIQuery,
    cacheItem: CacheItem<AIResponse>,
    baseScore: number
  ): number {
    let score = baseScore;
    const metadata = cacheItem.metadata as (CacheMetadata & Record<string, unknown>);

    // Priorizar por categoría
    if (metadata?.queryCategory) {
      const categoryIndex = this.config.priorityCategories?.indexOf(metadata.queryCategory as QueryCategory) || -1;
      if (categoryIndex !== -1) {
        // Más alto en la lista = mayor prioridad
        const categoryBonus = 20 * (1 - categoryIndex / (this.config.priorityCategories?.length || 1));
        score += categoryBonus;
      }
    }

    // Priorizar contenido con etiquetas médicas relevantes
    if (metadata?.tags && Array.isArray(metadata.tags)) {
      const medicalTags = metadata.tags.filter(tag =>
        tag.includes('evidence:') ||
        tag.includes('medical:') ||
        tag.includes('clinical:')
      );

      if (medicalTags.length > 0) {
        score += Math.min(15, medicalTags.length * 5);
      }
    }

    return score;
  }

  /**
   * Calcula la puntuación para consultas críticas en el flujo de trabajo
   */
  private calculateCriticalQueriesScore(
    query: AIQuery,
    cacheItem: CacheItem<AIResponse>,
    baseScore: number
  ): number {
    let score = baseScore;

    // Priorizar consultas etiquetadas como urgentes o críticas
    const extendedOptions = query.options as ExtendedQueryOptions;
    if (extendedOptions?.context === 'critical' || extendedOptions?.priority === 'high') {
      score += 25;
    }

    // Priorizar consultas relacionadas con diagnósticos o tratamientos
    const queryText = query.query.toLowerCase();
    if (
      queryText.includes('diagnos') ||
      queryText.includes('tratamiento') ||
      queryText.includes('urgente') ||
      queryText.includes('crítico')
    ) {
      score += 15;
    }

    // Verificar contexto del paciente
    if (query.patientId && query.context?.type === 'emr') {
      score += 10;
    }

    return score;
  }

  /**
   * Calcula la puntuación para consultas que consumen muchos recursos
   */
  private calculateResourceIntensiveScore(
    query: AIQuery,
    cacheItem: CacheItem<AIResponse>,
    baseScore: number,
    stats?: CacheItemStats
  ): number {
    let score = baseScore;

    // Consultas con muchos tokens tienen alta prioridad
    if (query.options?.maxTokens) {
      score += Math.min(25, query.options.maxTokens / 100);
    }

    // Si hay estadísticas disponibles, usar tiempo de procesamiento y costo
    if (stats) {
      // Mayor tiempo de procesamiento = mayor prioridad
      if (stats.avgProcessingTime > 1000) {
        score += Math.min(20, stats.avgProcessingTime / 500);
      }

      // Mayor costo = mayor prioridad
      if (stats.estimatedCost > 0) {
        score += Math.min(20, stats.estimatedCost * 100);
      }
    }

    return score;
  }

  /**
   * Calcula la puntuación basada en la recencia
   */
  private calculateRecencyScore(
    cacheItem: CacheItem<AIResponse>,
    baseScore: number
  ): number {
    const now = Date.now();
    const age = now - cacheItem.timestamp;

    // Más reciente = mayor puntuación (escala logarítmica)
    const ageHours = age / (60 * 60 * 1000);

    // Resta hasta 30 puntos para elementos más antiguos (máximo 30 días)
    const agePenalty = Math.min(30, Math.log(1 + ageHours) * 5);

    return baseScore - agePenalty;
  }

  /**
   * Calcula la puntuación basada en frecuencia de acceso
   */
  private calculateAccessFrequencyScore(
    stats: CacheItemStats | undefined,
    baseScore: number
  ): number {
    if (!stats) return baseScore;

    let score = baseScore;

    // Mayor número de accesos = mayor prioridad
    score += Math.min(25, stats.accessCount * 2);

    // Mayor tasa de aciertos = mayor prioridad
    score += stats.hitRate * 20;

    return score;
  }

  /**
   * Calcula la puntuación usando una estrategia híbrida
   */
  private calculateHybridScore(
    query: AIQuery,
    cacheItem: CacheItem<AIResponse>,
    stats?: CacheItemStats
  ): number {
    const weights = this.config.weights!;
    let totalWeight = 0;
    let weightedScore = 0;

    // Calcular puntuación por contenido médico
    if (weights.contentType && weights.contentType > 0) {
      const contentScore = this.calculateMedicalContentScore(query, cacheItem, 50);
      weightedScore += contentScore * weights.contentType;
      totalWeight += weights.contentType;
    }

    // Calcular puntuación por criticidad
    if (weights.criticalContext && weights.criticalContext > 0) {
      const criticalScore = this.calculateCriticalQueriesScore(query, cacheItem, 50);
      weightedScore += criticalScore * weights.criticalContext;
      totalWeight += weights.criticalContext;
    }

    // Calcular puntuación por consumo de recursos
    if (weights.queryComplexity && weights.queryComplexity > 0) {
      const resourceScore = this.calculateResourceIntensiveScore(query, cacheItem, 50, stats);
      weightedScore += resourceScore * weights.queryComplexity;
      totalWeight += weights.queryComplexity;
    }

    // Calcular puntuación por recencia
    if (weights.recency && weights.recency > 0) {
      const recencyScore = this.calculateRecencyScore(cacheItem, 50);
      weightedScore += recencyScore * weights.recency;
      totalWeight += weights.recency;
    }

    // Calcular puntuación por frecuencia de acceso
    if (weights.accessFrequency && weights.accessFrequency > 0 && stats) {
      const frequencyScore = this.calculateAccessFrequencyScore(stats, 50);
      weightedScore += frequencyScore * weights.accessFrequency;
      totalWeight += weights.accessFrequency;
    }

    // Calcular promedio ponderado
    return totalWeight > 0 ? weightedScore / totalWeight : 50;
  }

  /**
   * Extrae la consulta original a partir de la clave de caché
   * (Simplificado - en producción debería usar el mismo algoritmo que CacheService)
   */
  private extractQueryFromCacheKey(key: string): AIQuery {
    try {
      const keyObj = JSON.parse(key);
      return {
        query: keyObj.q || '',
        patientId: keyObj.p,
        options: keyObj.o || {}
      };
    } catch {
      this.logger.warn('Could not parse cache key', { key });
      return { query: '' };
    }
  }

  /**
   * Obtiene estadísticas del servicio de priorización
   */
  public getStatistics(): Record<string, unknown> {
    const stats = {
      totalTrackedItems: this.cacheStats.size,
      avgAccessCount: 0,
      avgHitRate: 0,
      avgProcessingTime: 0,
      totalEstimatedCostSaved: 0,
      strategy: this.config.strategy
    };

    if (this.cacheStats.size === 0) return stats;

    let totalAccessCount = 0;
    let totalHitRate = 0;
    let totalProcessingTime = 0;
    let totalCostSaved = 0;

    for (const itemStats of this.cacheStats.values()) {
      totalAccessCount += itemStats.accessCount;
      totalHitRate += itemStats.hitRate;
      totalProcessingTime += itemStats.avgProcessingTime;

      // Calcular costo ahorrado (hits × costo estimado)
      const hits = Math.round(itemStats.accessCount * itemStats.hitRate);
      totalCostSaved += hits * itemStats.estimatedCost;
    }

    stats.avgAccessCount = totalAccessCount / this.cacheStats.size;
    stats.avgHitRate = totalHitRate / this.cacheStats.size;
    stats.avgProcessingTime = totalProcessingTime / this.cacheStats.size;
    stats.totalEstimatedCostSaved = totalCostSaved;

    return stats;
  }
}

// Exportar instancia singleton
export const cachePrioritizationService = CachePrioritizationService.getInstance({
  strategy: 'hybrid'
});
