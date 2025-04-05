/**
 * Tipos de nivel de log
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Interfaz para entradas de log
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Logger simple para servicios
 */
export class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Registra un mensaje con el nivel especificado
   */
  log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      data,
    };

    this.logs.push(entry);

    // Mantener un límite de logs en memoria
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console[level](
        `[${this.serviceName}] ${entry.timestamp} - ${message}`,
        data ?? ''
      );
    }
  }

  /**
   * Registra un mensaje de nivel info
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Registra un mensaje de nivel warn
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Registra un mensaje de nivel error
   */
  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  /**
   * Registra un mensaje de nivel debug
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  /**
   * Obtiene los logs, opcionalmente filtrados por nivel
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Limpia todos los logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Exportamos una instancia por defecto para el logger del sistema
const logger = new Logger('system');
export default logger;
