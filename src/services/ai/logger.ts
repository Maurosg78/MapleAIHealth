/**
 * Servicio para logging en los servicios de IA
 *
 * Proporciona registro estructurado con niveles, timestamps y formateado para la consola
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, unknown>;
}

export class Logger {
  private serviceName: string;
  private readonly maxEntries = 1000;
  private entries: LogEntry[] = [];

  /**
   * Crea una nueva instancia del logger
   * @param serviceName Nombre del servicio que utiliza este logger
   */
  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Registra un mensaje de nivel info
   * @param message Mensaje a registrar
   * @param data Datos adicionales opcionales
   */
  public info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Registra un mensaje de nivel warn
   * @param message Mensaje a registrar
   * @param data Datos adicionales opcionales
   */
  public warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Registra un mensaje de nivel error
   * @param message Mensaje a registrar
   * @param data Datos adicionales opcionales
   */
  public error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  /**
   * Registra un mensaje de nivel debug
   * @param message Mensaje a registrar
   * @param data Datos adicionales opcionales
   */
  public debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  /**
   * Método interno para registrar mensajes
   * @param level Nivel de log
   * @param message Mensaje a registrar
   * @param data Datos adicionales opcionales
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      data,
    };

    // Registrar en la consola con colores según el nivel
    // Usamos un tipo de función en lugar de reasignar console.log directamente
    type ConsoleLogMethod = (
      message: string,
      ...optionalParams: unknown[]
    ) => void;
    let consoleMethod: ConsoleLogMethod = console.log;
    let colorCode = '\x1b[0m'; // Reset

    switch (level) {
      case 'error':
        consoleMethod = console.error;
        colorCode = '\x1b[31m'; // Rojo
        break;
      case 'warn':
        consoleMethod = console.warn;
        colorCode = '\x1b[33m'; // Amarillo
        break;
      case 'info':
        colorCode = '\x1b[36m'; // Cian
        break;
      case 'debug':
        colorCode = '\x1b[90m'; // Gris
        break;
    }

    // Formatear mensaje de consola
    const logPrefix = `${colorCode}[${entry.timestamp}] [${level.toUpperCase()}] [${this.serviceName}]\x1b[0m`;

    if (data) {
      consoleMethod(`${logPrefix} ${message}`, data);
    } else {
      consoleMethod(`${logPrefix} ${message}`);
    }

    // Agregar a la historia
    this.entries.push(entry);

    // Limitar el tamaño del historial
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  /**
   * Obtiene el historial de logs
   * @param level Filtrar por nivel
   * @param limit Límite de entradas a devolver
   * @returns Array de entradas de log
   */
  public getHistory(level?: LogLevel, limit = 100): LogEntry[] {
    let filteredEntries = this.entries;

    if (level) {
      filteredEntries = filteredEntries.filter((entry) => entry.level === level);
    }

    return filteredEntries.slice(-limit);
  }

  /**
   * Limpia el historial de logs
   */
  public clearHistory(): void {
    this.entries = [];
  }
}
