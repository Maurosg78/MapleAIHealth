/**
 * Algoritmos de priorización soportados
 */
export type PrioritizationAlgorithm = 
  | 'lru'      // Least Recently Used
  | 'lfu'      // Least Frequently Used
  | 'fifo'     // First In First Out
  | 'adaptive' // Adaptativo - combina múltiples factores
  | 'weighted'; // Ponderado - basado en pesos asignados

/**
 * Criterios para la priorización
 */
export interface PrioritizationCriteria {
  // Factores
  recencyWeight?: number; // Peso de la recencia de acceso (0-1)
  frequencyWeight?: number; // Peso de la frecuencia de acceso (0-1)
  sizeWeight?: number; // Peso del tamaño del item (0-1)
  costWeight?: number; // Peso del costo de obtención (0-1)
  
  // Configuración de tiempo
  shortTermSpan?: number; // Ventana de tiempo para prioridad a corto plazo (ms)
  mediumTermSpan?: number; // Ventana de tiempo para prioridad a medio plazo (ms)
  
  // Configuración específica por sección
  sectionOverrides?: Record<string, Partial<PrioritizationCriteria>>; // Criterios específicos por sección
  patientEmphasis?: boolean; // Si debe enfatizar contexto de paciente actual
}

/**
 * Metadatos de uso para un elemento en caché
 */
export interface CacheItemUsage {
  key: string;
  accessCount: number;
  lastAccess: number;
  createdAt: number;
  size?: number;
  cost?: number;
  section?: string;
  patientId?: string;
}

/**
 * Resultado de la evaluación de prioridad
 */
export interface PriorityScore {
  key: string;
  score: number; // Mayor número = mayor prioridad
  factors: {
    recency?: number;
    frequency?: number;
    size?: number;
    cost?: number;
    contextual?: number;
  };
}

/**
 * Servicio que implementa diferentes algoritmos de priorización
 * para optimizar qué contenido se mantiene en caché
 */
export class CachePrioritizationService {
  private static instance: CachePrioritizationService<any>;
  private readonly weights = {
    frequency: 0.4,
    recency: 0.3,
    size: 0.1,
    relevance: 0.2
  };

  private constructor() { super(); }

  public static getInstance<T>(): CachePrioritizationService<T> {
    if (!CachePrioritizationService.instance) {
      CachePrioritizationService.instance = new CachePrioritizationService<T>();
    }
    return CachePrioritizationService.instance;
  }

  public calculateEntryScore(entry: CacheEntry<T>, stats: CacheStats): number {
    const frequencyScore = this.calculateFrequencyScore(entry.metadata.accessCount, stats);
    const recencyScore = this.calculateRecencyScore(entry.metadata.lastAccess);
    const sizeScore = this.calculateSizeScore(entry.metadata.size, stats);
    const relevanceScore = this.calculateRelevanceScore(entry.metadata);

    return (
      frequencyScore * this.weights.frequency +
      recencyScore * this.weights.recency +
      sizeScore * this.weights.size +
      relevanceScore * this.weights.relevance
    );
  }

  private calculateFrequencyScore(accessCount: number, stats: CacheStats): number {
    const maxAccesses = stats.maxAccessCount || 1;
    return (accessCount / maxAccesses) * 100;
  }

  private calculateRecencyScore(lastAccess: number): number {
    const now = Date.now();
    const hoursSinceLastAccess = (now - lastAccess) / (1000 * 60 * 60);
    return Math.max(0, 100 - (hoursSinceLastAccess * 2)); // -2 puntos por hora
  }

  private calculateSizeScore(size: number, stats: CacheStats): number {
    const maxSize = stats.maxEntrySize || 1;
    // Penalizar entradas grandes
    return 100 - ((size / maxSize) * 100);
  }

  private calculateRelevanceScore(metadata: CacheMetadata): number {
    let score = 0;

    // Priorizar por sección
    if (metadata.section === 'clinical-dashboard') score += 30;
    if (metadata.section === 'evidence-search') score += 25;
    
    // Priorizar datos de pacientes activos
    if (metadata.patientId) score += 20;
    
    // Priorizar datos críticos
    if (metadata.isCritical) score += 25;

    return score;
  }

  public selectEntriesForEviction(
    entries: CacheEntry<T>[],
    stats: CacheStats,
    targetSize: number
  ): string[] {
    // Calcular scores actualizados
    const scoredEntries = entries.map(entry => ({
      ...entry,
      score: this.calculateEntryScore(entry, stats)
    }));

    // Ordenar por score (menor a mayor)
    scoredEntries.sort((a, b) => a.score - b.score);

    let currentSize = stats.totalSize;
    const keysToEvict: string[] = [];

    // Seleccionar entradas para evicción hasta alcanzar el tamaño objetivo
    for (const entry of scoredEntries) {
      if (currentSize <= targetSize) break;
      keysToEvict.push(entry.key);
      currentSize -= entry.metadata.size;
    }

    return keysToEvict;
  }

  public getEntryPriority(entry: CacheEntry<T>, stats: CacheStats): 'high' | 'medium' | 'low' {
    const score = this.calculateEntryScore(entry, stats);
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  public monitorCachePerformance(stats: CacheStats): {
    hitRatio: number;
    evictionRate: number;
    avgEntryLifetime: number;
    recommendations: string[];
  } {
    const hitRatio = (stats.hits / (stats.hits + stats.misses)) * 100;
    const evictionRate = (stats.evictions / stats.totalEntries) * 100;
    const avgEntryLifetime = stats.totalEntryLifetime / stats.totalEntries;

    const recommendations: string[] = [];

    // Analizar rendimiento y generar recomendaciones
    if (hitRatio < 60) {
      recommendations.push('Considerar aumentar el tamaño del caché');
    }
    if (evictionRate > 20) {
      recommendations.push('Alta tasa de evicción - revisar política de retención');
    }
    if (avgEntryLifetime < 3600000) { // 1 hora
      recommendations.push('Tiempo de vida promedio bajo - ajustar TTL');
    }

    return {
      hitRatio,
      evictionRate,
      avgEntryLifetime,
      recommendations
    };
  }
} 