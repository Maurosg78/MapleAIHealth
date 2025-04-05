/**
 * Servicio de logging para la aplicación
 */

// Crear una clase Logger para evitar la referencia circular
export class Logger {
  private$1$3: string;
  private readonly maxEntries = 1000;
  private entries: LogEntry[] = [];

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  public info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  public debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): void {
    console.log(`[${level.toUpperCase()}] [${this.serviceName}] ${message}`, data || '');
  }
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, unknown>;
}

// Crear una instancia del logger
const loggerInstance = new Logger('App');

// Exportar la instancia en lugar de la referencia circular
export default loggerInstance;
