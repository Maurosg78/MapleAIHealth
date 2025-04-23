import { CacheConfig } from '../types';;;;;

// Interfaz para estadísticas de la caché
export interface CacheStats {
  hitRatio: number;
  size: number;
  maxSize: number;
  evictions?: number;
  accessTime?: number;
  memoryUsage: number;
}

// Interfaz para estadísticas de rendimiento
export interface CacheMetrics {
  hitRatio: number;
  missRatio: number;
  evictionRate: number;
  avgAccessTime: number;
  avgEntrySize: number;
  totalEntries: number;
  memoryUsageMB: number;
  recommendedOptimizations: Recommendation[];
}

// Interfaz para recomendaciones de optimización
export interface Recommendation {
  type: 'size' | 'ttl' | 'algorithm' | 'preloading' | 'invalidation';
  message: string;
  currentValue?: number | string;
  recommendedValue?: number | string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Servicio para analizar el rendimiento de la caché y recomendar optimizaciones
 */
export class CacheAnalytics {
  private static readonly MIN_CACHE_SIZE = 50;
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly MIN_TTL = 60 * 1000; // 1 minuto
  private static readonly MAX_TTL = 60 * 60 * 1000; // 1 hora
  
  private static instance: CacheAnalytics;
  private metricsHistory: Map<string, CacheMetrics[]> = new Map();
  
  private constructor() { super(); }
  
  public static getInstance(): CacheAnalytics {
    if (!CacheAnalytics.instance) {
      CacheAnalytics.instance = new CacheAnalytics();
    }
    return CacheAnalytics.instance;
  }
  
  /**
   * Analiza las métricas de caché y propone optimizaciones
   * @param section Sección de la aplicación
   * @param stats Estadísticas actuales de la caché
   * @param config Configuración actual de la caché
   * @returns Métricas y recomendaciones
   */
  public analyzeCache(
    section: string,
    stats: CacheStats,
    config: CacheConfig
  ): CacheMetrics {
    // Calcular métricas
    const hitRatio = stats.hitRatio || 0;
    const missRatio = 1 - hitRatio;
    const evictionRate = stats.evictions ? stats.evictions / stats.size : 0;
    const avgAccessTime = stats.accessTime || 0;
    const avgEntrySize = stats.memoryUsage / Math.max(1, stats.size);
    const memoryUsageMB = stats.memoryUsage / (1024 * 1024);
    
    // Generar recomendaciones
    const recommendations: Recommendation[] = [];
    
    // Optimizar tamaño de caché
    if (hitRatio < 0.7 && stats.size >= config.maxSize * 0.9) {
      const recommendedSize = Math.min(
        CacheAnalytics.MAX_CACHE_SIZE,
        Math.ceil(config.maxSize * 1.5)
      );
      
      recommendations.push({
        type: 'size',
        message: 'Aumentar el tamaño máximo de la caché',
        currentValue: config.maxSize,
        recommendedValue: recommendedSize,
        impact: 'high'
      });
    } else if (hitRatio > 0.9 && stats.size <= config.maxSize * 0.5) {
      const recommendedSize = Math.max(
        CacheAnalytics.MIN_CACHE_SIZE,
        Math.floor(config.maxSize * 0.8)
      );
      
      recommendations.push({
        type: 'size',
        message: 'Reducir el tamaño máximo de la caché',
        currentValue: config.maxSize,
        recommendedValue: recommendedSize,
        impact: 'medium'
      });
    }
    
    // Optimizar TTL
    if (evictionRate > 0.2) {
      const recommendedTTL = Math.min(
        CacheAnalytics.MAX_TTL,
        config.ttlMs * 1.5
      );
      
      recommendations.push({
        type: 'ttl',
        message: 'Aumentar el tiempo de vida (TTL)',
        currentValue: config.ttlMs,
        recommendedValue: recommendedTTL,
        impact: 'medium'
      });
    } else if (evictionRate < 0.05 && memoryUsageMB > 10) {
      const recommendedTTL = Math.max(
        CacheAnalytics.MIN_TTL,
        config.ttlMs * 0.7
      );
      
      recommendations.push({
        type: 'ttl',
        message: 'Reducir el tiempo de vida (TTL)',
        currentValue: config.ttlMs,
        recommendedValue: recommendedTTL,
        impact: 'low'
      });
    }
    
    // Algoritmo de caché
    if (missRatio > 0.3) {
      recommendations.push({
        type: 'algorithm',
        message: 'Considerar cambiar el algoritmo de caché a "adaptive"',
        currentValue: 'current',
        recommendedValue: 'adaptive',
        impact: 'medium'
      });
    }
    
    // Precarga de datos
    if (section === 'evidence-search' && missRatio > 0.5) {
      recommendations.push({
        type: 'preloading',
        message: 'Implementar precarga de datos de búsqueda frecuentes',
        impact: 'high'
      });
    }
    
    // Estrategia de invalidación
    if (evictionRate > 0.3) {
      recommendations.push({
        type: 'invalidation',
        message: 'Revisar estrategia de invalidación para reducir evictions',
        impact: 'medium'
      });
    }
    
    const metrics: CacheMetrics = {
      hitRatio,
      missRatio,
      evictionRate,
      avgAccessTime,
      avgEntrySize,
      totalEntries: stats.size,
      memoryUsageMB,
      recommendedOptimizations: recommendations
    };
    
    // Guardar métricas en el historial
    this.saveMetrics(section, metrics);
    
    return metrics;
  }
  
  /**
   * Recomendar configuración de caché óptima basada en métricas históricas
   * @param section Sección de la aplicación
   * @param currentConfig Configuración actual
   * @returns Configuración optimizada
   */
  public getOptimizedConfig(section: string, currentConfig: CacheConfig): CacheConfig {
    const metrics = this.metricsHistory.get(section);
    if (!metrics || metrics.length < 5) {
      return currentConfig; // No hay suficientes datos para optimizar
    }
    
    const lastMetrics = metrics[metrics.length - 1];
    const optimizedConfig = { ...currentConfig };
    
    // Aplicar recomendaciones de alto impacto
    for (const recommendation of lastMetrics.recommendedOptimizations) {
      if (recommendation.impact !== 'high') continue;
      
      switch (recommendation.type) {
        case 'size':
          if (recommendation.recommendedValue) {
            optimizedConfig.maxSize = recommendation.recommendedValue as number;
          }
          break;
        case 'ttl':
          if (recommendation.recommendedValue) {
            optimizedConfig.ttlMs = recommendation.recommendedValue as number;
          }
          break;
      }
    }
    
    return optimizedConfig;
  }
  
  private saveMetrics(section: string, metrics: CacheMetrics): void {
    if (!this.metricsHistory.has(section)) {
      this.metricsHistory.set(section, []);
    }
    
    const sectionMetrics = this.metricsHistory.get(section)!;
    sectionMetrics.push(metrics);
    
    // Limitar el tamaño del historial
    if (sectionMetrics.length > 20) {
      sectionMetrics.shift();
    }
  }
  
  /**
   * Obtener el historial de métricas para una sección
   * @param section Sección de la aplicación
   * @returns Historial de métricas
   */
  public getMetricsHistory(section: string): CacheMetrics[] {
    return this.metricsHistory.get(section) || [];
  }
} 