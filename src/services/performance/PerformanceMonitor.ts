import { useEffect, useRef } from 'react';;;;;

/**
 * Tipo de métrica de rendimiento
 */
export type PerformanceMetric = {
  id: string;
  type: 'api' | 'render' | 'calculation' | 'loading';
  startTime: number;
  endTime?: number;
  duration?: number;
  context?: Record<string, unknown>;
  componentName?: string;
  sampleSize?: number;
  avgDuration?: number;
};

/**
 * Configuración del monitor de rendimiento
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, porcentaje de operaciones a medir
  threshold: {
    api: number; // Umbral en ms para considerar una API como lenta
    render: number; // Umbral en ms para considerar un renderizado como lento
    calculation: number; // Umbral en ms para considerar un cálculo como lento
    loading: number; // Umbral en ms para considerar una carga como lenta
  };
  logToConsole: boolean;
  collectMetrics: boolean;
  maxMetricsStored: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PerformanceMonitorConfig = {
  enabled: true,
  sampleRate: 0.1, // Medir solo el 10% de las operaciones por defecto
  threshold: {
    api: 500, // ms
    render: 100, // ms
    calculation: 50, // ms
    loading: 300, // ms
  },
  logToConsole: process.env.NODE_ENV === 'development',
  collectMetrics: true,
  maxMetricsStored: 100
};

/**
 * Servicio para monitorizar y optimizar el rendimiento de la aplicación
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetric[] = [];
  private aggregatedMetrics: Record<string, { count: number, totalDuration: number, avgDuration: number }> = {};

  private constructor(config: PerformanceMonitorConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Obtener la instancia del monitor de rendimiento (Singleton)
   */
  public static getInstance(config?: PerformanceMonitorConfig): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    } else if (config) {
      PerformanceMonitor.instance.updateConfig(config);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Actualizar la configuración del monitor
   */
  public updateConfig(config: Partial<PerformanceMonitorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Iniciar una medición de rendimiento
   */
  public startMeasure(
    id: string,
    type: PerformanceMetric['type'],
    context?: Record<string, unknown>,
    componentName?: string
  ): string {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return id;
    }

    const metricId = `${id}_${Date.now()}`;
    
    const metric: PerformanceMetric = {
      id: metricId,
      type,
      startTime: performance.now(),
      context,
      componentName
    };
    
    this.metrics.push(metric);
    
    // Limitar el número de métricas almacenadas
    if (this.metrics.length > this.config.maxMetricsStored) {
      this.metrics.shift();
    }
    
    return metricId;
  }

  /**
   * Finalizar una medición de rendimiento
   */
  public endMeasure(id: string): PerformanceMetric | undefined {
    if (!this.config.enabled) return undefined;
    
    const metricIndex = this.metrics.findIndex(m => m.id === id);
    if (metricIndex === -1) return undefined;
    
    const metric = this.metrics[metricIndex];
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    // Actualizar métricas agregadas
    const aggregateKey = metric.componentName 
      ? `${metric.type}_${metric.componentName}` 
      : `${metric.type}_${id.split('_')[0]}`;
    
    if (!this.aggregatedMetrics[aggregateKey]) {
      this.aggregatedMetrics[aggregateKey] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0
      };
    }
    
    const agg = this.aggregatedMetrics[aggregateKey];
    agg.count++;
    agg.totalDuration += metric.duration;
    agg.avgDuration = agg.totalDuration / agg.count;
    
    // Actualizar la métrica con el promedio
    metric.sampleSize = agg.count;
    metric.avgDuration = agg.avgDuration;
    
    // Loggear si supera el umbral
    if (
      this.config.logToConsole && 
      metric.duration > this.config.threshold[metric.type]
    ) {
      console.warn(
        `[Performance] ${metric.type.toUpperCase()} operation "${id.split('_')[0]}" ` +
        `took ${metric.duration.toFixed(2)}ms ` +
        `(avg: ${agg.avgDuration.toFixed(2)}ms over ${agg.count} samples)`
      );
    }
    
    return metric;
  }

  /**
   * Obtener todas las métricas recolectadas
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Obtener métricas agregadas
   */
  public getAggregatedMetrics(): Record<string, { count: number, totalDuration: number, avgDuration: number }> {
    return { ...this.aggregatedMetrics };
  }

  /**
   * Limpiar todas las métricas almacenadas
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.aggregatedMetrics = {};
  }

  /**
   * Analizar el rendimiento y generar recomendaciones
   */
  public analyzePerformance(): { 
    slowestOperations: Array<{ id: string, avgDuration: number, count: number, type: string }>;
    recommendations: string[];
  } {
    const slowestOperations = Object.entries(this.aggregatedMetrics)
      .map(([id, data]) => ({
        id,
        avgDuration: data.avgDuration,
        count: data.count,
        type: id.split('_')[0]
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);
    
    const recommendations: string[] = [];
    
    // Generar recomendaciones basadas en las métricas
    slowestOperations.forEach(op => {
      const opType = op.type as keyof typeof this.config.threshold;
      const threshold = this.config.threshold[opType] || 100;
      
      if (op.avgDuration > threshold * 2) {
        if (op.type === 'api') {
          recommendations.push(`Optimizar llamada a API "${op.id}" (${op.avgDuration.toFixed(2)}ms) implementando caché o reduciendo la cantidad de datos.`);
        } else if (op.type === 'render') {
          recommendations.push(`Optimizar renderizado del componente "${op.id}" (${op.avgDuration.toFixed(2)}ms) usando React.memo o useMemo.`);
        } else if (op.type === 'calculation') {
          recommendations.push(`Optimizar el cálculo "${op.id}" (${op.avgDuration.toFixed(2)}ms) memorizando resultados o usando Web Workers.`);
        } else if (op.type === 'loading') {
          recommendations.push(`Optimizar tiempo de carga "${op.id}" (${op.avgDuration.toFixed(2)}ms) usando estrategias de lazy loading o skeleton screens.`);
        }
      }
    });
    
    return {
      slowestOperations,
      recommendations
    };
  }
}

/**
 * Hook para medir el tiempo de renderizado de un componente
 */
export function useRenderMonitor(componentName: string): void {
  const monitor = PerformanceMonitor.getInstance();
  const metricId = useRef<string | null>(null);
  
  useEffect(() => {
    // Inicio de la medición al montar
    metricId.current = monitor.startMeasure(
      `render_${componentName}`,
      'render',
      undefined,
      componentName
    );
    
    // Finalizar medición al desmontar
    return () => {
      if (metricId.current) {
        monitor.endMeasure(metricId.current);
      }
    };
  }, [componentName]);
  
  // Nueva medición cada vez que se renderiza
  useEffect(() => {
    if (metricId.current) {
      monitor.endMeasure(metricId.current);
    }
    
    metricId.current = monitor.startMeasure(
      `render_${componentName}`,
      'render',
      undefined,
      componentName
    );
  });
}

/**
 * Función para medir el tiempo de ejecución de una función
 */
export function measurePerformance<T extends (...args: unknown[]) => ReturnType<T>>(
  fn: T,
  operationId: string,
  type: PerformanceMetric['type'] = 'calculation',
  context?: Record<string, unknown>
): (...args: Parameters<T>) => ReturnType<T> {
  const monitor = PerformanceMonitor.getInstance();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const metricId = monitor.startMeasure(operationId, type, context);
    const result = fn(...args);
    
    // Si es una promesa, medir cuando se resuelva
    if (result instanceof Promise) {
      return result
        .then(value => {
          monitor.endMeasure(metricId);
          return value;
        })
        .catch(error => {
          monitor.endMeasure(metricId);
          throw error;
        }) as ReturnType<T>;
    }
    
    // Para funciones síncronas
    monitor.endMeasure(metricId);
    return result;
  };
} 