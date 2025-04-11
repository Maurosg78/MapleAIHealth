import { Logger } from './logger';
import { cacheService } from './cacheService';
import { aiService } from './aiService';

/**
 * Servicio de monitoreo para supervisar el rendimiento y uso del servicio de IA
 * Implementa un patrón singleton para asegurar una única instancia
 */
export class MonitorService {
  private static instance: MonitorService;
  private logger: Logger;
  private readonly checkIntervalMs = 60 * 60 * 1000; // 1 hora
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  // Métricas de rendimiento
  private metrics = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    averageResponseTime: 0,
    lastCheckTime: Date.now(),
    uptime: 0,
  };

  private constructor() {
    this.logger = new Logger('MonitorService');
    this.logger.info('MonitorService initialized');
  }

  /**
   * Obtiene la instancia única del servicio de monitoreo
   */
  public static getInstance(): MonitorService {
    if (!MonitorService.instance) {
      MonitorService.instance = new MonitorService();
    }
    return MonitorService.instance;
  }

  /**
   * Inicia el monitoreo periódico
   */
  public start(): void {
    if (this.isRunning) {
      this.logger.warn('Monitor service is already running');
      return;
    }

    this.logger.info('Starting AI service monitoring');
    this.isRunning = true;

    // Realizar primera verificación inmediatamente
    this.checkHealth();

    // Configurar intervalo para verificaciones periódicas
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, this.checkIntervalMs);
  }

  /**
   * Detiene el monitoreo
   */
  public stop(): void {
    if (!this.isRunning || !this.checkInterval) {
      return;
    }

    clearInterval(this.checkInterval);
    this.checkInterval = null;
    this.isRunning = false;
    this.logger.info('AI service monitoring stopped');
  }

  /**
   * Verifica la salud del servicio de IA
   */
  private checkHealth(): void {
    try {
      // Recopilar estadísticas de servicios
      const aiStats = aiService.getStats();
      const cacheStats = cacheService.getStats();

      // Actualizar métricas de monitoreo
      this.updateMetrics(aiStats, cacheStats);

      // Registrar verificación de salud
      this.logger.info('Health check completed', {
        metrics: this.metrics,
        aiStats,
        cacheStats,
      });

      // Verificar posibles problemas
      this.checkForIssues();
    } catch (error) {
      this.logger.error('Error during health check', { error });
    }
  }

  /**
   * Actualiza las métricas basadas en estadísticas de servicios
   */
  private updateMetrics(
    aiStats: Record<string, unknown>,
    cacheStats: Record<string, unknown>
  ): void {
    const now = Date.now();

    // Actualizar uptime
    this.metrics.uptime = now - this.metrics.lastCheckTime;

    // Actualizar estadísticas de caché
    const totalItems = (cacheStats.totalItems ) || 0;
    const activeItems = (cacheStats.activeItems ) || 0;

    const totalItemsCount = typeof totalItems === 'number' ? totalItems : 0;
    const activeItemsCount = typeof activeItems === 'number' ? activeItems : 0;

    if (totalItemsCount > 0) {
      this.metrics.cacheHits = activeItemsCount;
      this.metrics.cacheMisses = totalItemsCount - activeItemsCount;
      this.metrics.totalQueries = totalItemsCount;
    }

    // Obtener propiedades de rendimiento
    const simulationMode = aiStats.simulationMode ;

    // Registrar modo simulación
    if (simulationMode) {
      this.logger.info('AI service is running in simulation mode');
    }

    // Actualizar tiempo de última verificación
    this.metrics.lastCheckTime = now;
  }

  /**
   * Verifica posibles problemas basados en métricas
   */
  private checkForIssues(): void {
    // Verificar ratio de errores
    const errorRate =
      this.metrics.totalQueries > 0
        ? this.metrics.errors / this.metrics.totalQueries
        : 0;

    if (errorRate > 0.05) {
      // Si más del 5% de consultas fallan
      this.logger.warn('High error rate detected', {
        errorRate,
        totalErrors: this.metrics.errors,
        totalQueries: this.metrics.totalQueries,
      });
    }

    // Verificar uso del caché
    const cacheHitRate =
      this.metrics.totalQueries > 0
        ? this.metrics.cacheHits / this.metrics.totalQueries
        : 0;

    if (cacheHitRate < 0.3) {
      // Si menos del 30% de consultas usan caché
      this.logger.info('Low cache hit rate', {
        cacheHitRate,
        cacheHits: this.metrics.cacheHits,
        totalQueries: this.metrics.totalQueries,
      });
    }
  }

  /**
   * Registra un error para monitoreo
   */
  public trackError(error: Error): void {
    this.metrics.errors++;
    this.logger.error('AI service error tracked', { error });
  }

  /**
   * Registra una consulta exitosa
   */
  public trackQuery(responseTime: number, cacheHit: boolean): void {
    this.metrics.totalQueries++;

    if (cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    // Actualizar tiempo de respuesta promedio
    const currentTotal =
      this.metrics.averageResponseTime * (this.metrics.totalQueries - 1);
    this.metrics.averageResponseTime =
      (currentTotal + responseTime) / this.metrics.totalQueries;
  }

  /**
   * Obtiene métricas actuales
   */
  public getMetrics(): Record<string, unknown> {
    return { ...this.metrics };
  }

  /**
   * Genera un reporte de uso del servicio
   */
  public generateReport(): Record<string, unknown> {
    return {
      metrics: this.metrics,
      timestamp: new Date().toISOString(),
      aiService: aiService.getStats(),
      cacheService: cacheService.getStats(),
    };
  }
}

// Exportar instancia única del servicio de monitoreo
export const monitorService = MonitorService.getInstance();
