import { LogEntry, LogLevel } from './types';

/**
 * Servicio de logging para registrar eventos y errores del servicio de IA
 */
export class Logger {
  private readonly serviceName: string;
  private readonly isProduction: boolean;
  private static logHistory: LogEntry[] = [];
  private static readonly MAX_LOG_HISTORY = 1000;

  /**
   * Constructor del logger
   * @param serviceName - Nombre del servicio que utilizará el logger
   */
  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Registra un mensaje informativo
   * @param message - Mensaje a registrar
   * @param data - Datos adicionales opcionales
   */
  public info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Registra un mensaje de advertencia
   * @param message - Mensaje a registrar
   * @param data - Datos adicionales opcionales
   */
  public warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Registra un mensaje de error
   * @param message - Mensaje a registrar
   * @param data - Datos adicionales opcionales
   */
  public error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  /**
   * Registra un mensaje de depuración (solo en desarrollo)
   * @param message - Mensaje a registrar
   * @param data - Datos adicionales opcionales
   */
  public debug(message: string, data?: Record<string, unknown>): void {
    // Los mensajes de debug solo se registran en entorno no-producción
    if (!this.isProduction) {
      this.log('debug', message, data);
    }
  }

  /**
   * Registra un mensaje con el nivel especificado
   * @param level - Nivel de log (info, warn, error, debug)
   * @param message - Mensaje a registrar
   * @param data - Datos adicionales opcionales
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();

    const logEntry: LogEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      data
    };

    // Agregar al historial
    Logger.addToHistory(logEntry);

    // Formatear el mensaje para la consola
    const formattedMessage = this.formatLogMessage(logEntry);

    // Salida a consola según el nivel
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.info(formattedMessage);
    }

    // En producción, podríamos enviar logs críticos a un servicio de monitoreo
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      this.sendToMonitoringService(logEntry);
    }
  }

  /**
   * Formatea un mensaje de log para la consola
   */
  private formatLogMessage(logEntry: LogEntry): string {
    const { timestamp, level, service, message, data } = logEntry;
    let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${service}] ${message}`;

    if (data) {
      formattedMessage += '\n' + JSON.stringify(data, null, 2);
    }

    return formattedMessage;
  }

  /**
   * Envía logs críticos a un servicio de monitoreo externo
   * Implementación simulada - en un caso real enviaría a un servicio como Sentry, DataDog, etc.
   */
  private sendToMonitoringService(logEntry: LogEntry): void {
    // Implementación simulada
    if (logEntry.level === 'error') {
      // En una implementación real, enviaríamos el log a un servicio de monitoreo
      console.info(`[MONITOR] Error enviado a servicio de monitoreo: ${logEntry.message}`);
    }
  }

  /**
   * Agrega una entrada al historial de logs
   */
  private static addToHistory(logEntry: LogEntry): void {
    this.logHistory.push(logEntry);

    // Limitar el tamaño del historial
    if (this.logHistory.length > this.MAX_LOG_HISTORY) {
      this.logHistory.shift();
    }
  }

  /**
   * Obtiene el historial de logs
   */
  public static getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Limpia el historial de logs
   */
  public static clearHistory(): void {
    this.logHistory = [];
  }
}
