/**
import { HttpService } from "../../../lib/api"; * Tipos de severidad para los errores monitoreados
 */
export enum ErrorSeverity {
  /** Error crítico que bloquea funcionalidad principal y debe ser atendido inmediatamente */
  CRITICAL = 'critical',
  /** Error grave que afecta funcionalidad importante pero permite operación limitada */
  HIGH = 'high',
  /** Error moderado que afecta funcionalidad secundaria */
  MEDIUM = 'medium',
  /** Error menor que no afecta funcionalidad principal */
  LOW = 'low',
  /** Advertencia que no afecta funcionalidad pero podría indicar problemas futuros */
  WARNING = 'warning',
  /** Información para seguimiento y análisis */
  INFO = 'info',
}

/**
 * Categorías de errores para facilitar su agrupación y análisis
 */
export enum ErrorCategory {
  /** Errores relacionados con la autenticación y autorización */
  AUTH = 'auth',
  /** Errores relacionados con la API o comunicación con servicios externos */
  API = 'api',
  /** Errores relacionados con la base de datos */
  DATABASE = 'database',
  /** Errores relacionados con la UI */
  UI = 'ui',
  /** Errores relacionados con la integración de EMR */
  EMR = 'emr',
  /** Errores relacionados con la integración de IA */
  AI = 'ai',
  /** Errores relacionados con la validación de datos */
  VALIDATION = 'validation',
  /** Errores relacionados con la red */
  NETWORK = 'network',
  /** Otros errores no categorizados */
  OTHER = 'other',
}

/**
 * Interface para representar un error monitorizado
 */
export interface MonitoredError {
  /** ID único del error */
  id: string;
  /** Mensaje descriptivo del error */
  message: string;
  /** Detalles técnicos del error */
  details?: string;
  /** Categoría del error */
  category: ErrorCategory;
  /** Severidad del error */
  severity: ErrorSeverity;
  /** Código de error (opcional, para errores específicos) */
  code?: string;
  /** Componente o módulo donde ocurrió el error */
  component?: string;
  /** Ruta o ubicación donde ocurrió el error */
  path?: string;
  /** Fecha y hora cuando ocurrió el error */
  timestamp: Date;
  /** Usuario afectado por el error (si aplica) */
  userId?: string;
  /** Si el error ya fue visto/reconocido */
  acknowledged: boolean;
  /** Si el error ha sido resuelto */
  resolved: boolean;
  /** Datos adicionales relacionados con el error */
  metadata?: Record<string, unknown>;
  /** Acciones tomadas para resolver el error */
  resolutionSteps?: string[];
  /** Usuario que resolvió el error (si aplica) */
  resolvedBy?: string;
  /** Fecha en que se resolvió el error (si aplica) */
  resolvedAt?: Date;
}

/**
 * Servicio para monitorear errores y advertencias del sistema
 */
export class ErrorMonitorService {
  private readonly logger: Logger;
  private errors: MonitoredError[] = [];
  private webhookUrl?: string;
  private notificationThreshold: ErrorSeverity = ErrorSeverity.HIGH;
  private static instance: ErrorMonitorService;

  /**
   * Constructor privado para implementar patrón Singleton
   */
  private constructor() {
    this.logger = new Logger('ErrorMonitorService');
    this.logger.info('Servicio de monitoreo de errores inicializado');
  }

  /**
   * Obtiene la instancia única del servicio (patrón Singleton)
   */
  public static getInstance(): ErrorMonitorService {
    if (!ErrorMonitorService.instance) {
      ErrorMonitorService.instance = new ErrorMonitorService();
    }
    return ErrorMonitorService.instance;
  }

  /**
   * Configura el servicio de monitoreo
   * @param config Configuración del servicio
   */
  public configure(config: {
    webhookUrl?: string;
    notificationThreshold?: ErrorSeverity;
  }): void {
    this.webhookUrl = config.webhookUrl;
    this.notificationThreshold =
      config.notificationThreshold ?? ErrorSeverity.HIGH;
    this.logger.info('Configuración de monitoreo actualizada', {
      notificationThreshold: this.notificationThreshold,
      webhookConfigured: !!this.webhookUrl,
    });
  }

  /**
   * Registra un nuevo error en el sistema
   * @param error Información del error a registrar
   * @returns ID del error registrado
   */
  public captureError(
    error: Omit<
      MonitoredError,
      'id' | 'timestamp' | 'acknowledged' | 'resolved'
    >
  ): string {
    const monitoredError: MonitoredError = {
      id: errorId,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      ...error,
    };

    this.errors.push(monitoredError);

    this.logger.error('Error registrado en el monitor', {
      errorId,
      message: monitoredError.message,
      category: monitoredError.category,
      severity: monitoredError.severity,
      component: monitoredError.component,
    });

    // Enviar notificación si la severidad del error es igual o mayor al umbral configurado
    this.maybeNotify(monitoredError);

    return errorId;
  }

  /**
   * Evalúa si un error debería enviarse como notificación
   */
  private maybeNotify(error: MonitoredError): void {
    // Si la severidad del error es mayor o igual que el umbral, notificar
    if (errorSeverityIndex <= thresholdIndex && this.webhookUrl) {
      this.sendNotification(error);
    }
  }

  /**
   * Envía una notificación a través del webhook configurado
   */
  private sendNotification(error: MonitoredError): void {
    if (!this.webhookUrl) return;

    try {
      // Aquí implementaríamos el envío real de la notificación
      // fetch(this.webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     error: {
      //       id: error.id,
      //       message: error.message,
      //       severity: error.severity,
      //       category: error.category,
      //       component: error.component,
      //       timestamp: error.timestamp
      //     }
      //   })
      // });

      this.logger.info('Notificación enviada para error', {
        errorId: error.id,
      });
    } catch (notifyError) {
      this.logger.error('Error al enviar notificación', {
        errorId: error.id,
        notifyError,
      });
    }
  }

  /**
   * Marca un error como reconocido
   * @param errorId ID del error a reconocer
   * @param userId ID del usuario que reconoce el error
   * @returns true si el error fue encontrado y actualizado
   */
  public acknowledgeError(errorId: string, userId: string): boolean {
    if (!error) return false;

    error.acknowledged = true;
    error.metadata = {
      ...error.metadata,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    };

    this.logger.info('Error reconocido', { errorId, userId });
    return true;
  }

  /**
   * Marca un error como resuelto
   * @param errorId ID del error a resolver
   * @param userId ID del usuario que resuelve el error
   * @param resolution Información sobre la resolución
   * @returns true si el error fue encontrado y actualizado
   */
  public resolveError(
    errorId: string,
    userId: string,
    resolution?: {
      steps?: string[];
      notes?: string;
    }
  ): boolean {
    if (!error) return false;

    error.resolved = true;
    error.resolvedBy = userId;
    error.resolvedAt = new Date();

    if (resolution?.steps?.length) {
      error.resolutionSteps = resolution.steps;
    }

    error.metadata = {
      ...error.metadata,
      resolutionNotes: resolution?.notes,
      resolutionDate: new Date(),
    };

    this.logger.info('Error resuelto', { errorId, userId });
    return true;
  }

  /**
   * Obtiene todos los errores activos (no resueltos)
   * @returns Lista de errores activos
   */
  public getActiveErrors(): MonitoredError[] {
    return this.errors.filter((error) => !error.resolved);
  }

  /**
   * Obtiene errores filtrados por criterios
   * @param filters Criterios de filtrado
   * @returns Lista de errores que cumplen los criterios
   */
  public getErrors(filters?: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    component?: string;
    resolved?: boolean;
    acknowledged?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): MonitoredError[] {
    let filteredErrors = [...this.errors];

    if (!filters) return filteredErrors;

    if (filters.severity) {
      filteredErrors = filteredErrors.filter(
        (error) => error.severity === filters.severity
      );
    }

    if (filters.category) {
      filteredErrors = filteredErrors.filter(
        (error) => error.category === filters.category
      );
    }

    if (filters.component) {
      filteredErrors = filteredErrors.filter(
        (error) => error.component === filters.component
      );
    }

    if (filters.resolved !== undefined) {
      filteredErrors = filteredErrors.filter(
        (error) => error.resolved === filters.resolved
      );
    }

    if (filters.acknowledged !== undefined) {
      filteredErrors = filteredErrors.filter(
        (error) => error.acknowledged === filters.acknowledged
      );
    }

    if (filters.startDate) {
      filteredErrors = filteredErrors.filter(
        (error) => error.timestamp >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredErrors = filteredErrors.filter(
        (error) => error.timestamp <= filters.endDate!
      );
    }

    return filteredErrors;
  }

  /**
   * Obtiene un resumen estadístico de los errores por categoría y severidad
   * @returns Estadísticas de errores
   */
  public getErrorStats(): {
    total: number;
    active: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    criticalUnresolved: number;
  } {
    const stats = {
      total: this.errors.length,
      active: this.getActiveErrors().length,
      bySeverity: Object.values(ErrorSeverity).reduce(
        (acc, severity) => {
          acc[severity] = this.errors.filter(
            (e) => e.severity === severity
          ).length;
          return acc;
        },
        {} as Record<ErrorSeverity, number>
      ),
      byCategory: Object.values(ErrorCategory).reduce(
        (acc, category) => {
          acc[category] = this.errors.filter(
            (e) => e.category === category
          ).length;
          return acc;
        },
        {} as Record<ErrorCategory, number>
      ),
      criticalUnresolved: this.errors.filter(
        (e) => e.severity === ErrorSeverity.CRITICAL && !e.resolved
      ).length,
    };

    return stats;
  }

  /**
   * Genera un ID único para un error
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Purga errores resueltos antiguos por fecha
   * @param olderThan Fecha límite para considerar errores antiguos
   * @returns Número de errores purgados
   */
  public purgeOldResolvedErrors(olderThan: Date): number {
    this.errors = this.errors.filter(
      (error) =>
        !error.resolved || (error.resolvedAt && error.resolvedAt > olderThan)
    );

    if (purgedCount > 0) {
      this.logger.info(`Purgados ${purgedCount} errores resueltos antiguos`);
    }

    return purgedCount;
  }
}

/**
 * Utilidad para convertir errores JavaScript a errores monitorizados
 */
export const captureException = (
  error: Error,
  options: {
    category: ErrorCategory;
    severity: ErrorSeverity;
    component?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): string => {
  return service.captureError({
    message: error.message,
    details: error.stack,
    category: options.category,
    severity: options.severity,
    component: options.component,
    userId: options.userId,
    metadata: options.metadata,
  });
};

export default ErrorMonitorService.getInstance();
