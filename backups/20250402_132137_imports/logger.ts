/**
 * Niveles de registro disponibles
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Clase para manejar registros (logs) en la aplicación
 */
export class Logger {
  private readonly moduleName: string;
  private static logLevel: LogLevel = 'info';

  /**
   * Crea una nueva instancia de Logger
   * @param moduleName Nombre del módulo que generará los logs
   */
  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  /**
   * Establece el nivel de log global
   * @param level Nivel de log a establecer
   */
  public static setLogLevel(level: LogLevel): void {
    Logger.logLevel = level;
  }

  /**
   * Registra un mensaje de nivel debug
   * @param message Mensaje a registrar
   * @param context Contexto adicional opcional
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, context);
    }
  }

  /**
   * Registra un mensaje de nivel info
   * @param message Mensaje a registrar
   * @param context Contexto adicional opcional
   */
  public info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.log('info', message, context);
    }
  }

  /**
   * Registra un mensaje de nivel warn
   * @param message Mensaje a registrar
   * @param context Contexto adicional opcional
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, context);
    }
  }

  /**
   * Registra un mensaje de nivel error
   * @param message Mensaje a registrar
   * @param context Contexto adicional opcional
   */
  public error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      this.log('error', message, context);
    }
  }

  /**
   * Verifica si un nivel de log debería ser registrado
   * @param level Nivel a verificar
   * @returns true si el nivel debe ser registrado
   */
  private shouldLog(level: LogLevel): boolean {
    return targetLevelIndex >= currentLevelIndex;
  }

  /**
   * Registra un mensaje con el nivel especificado
   * @param level Nivel de log
   * @param message Mensaje a registrar
   * @param context Contexto adicional opcional
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    const logData = context
      ? { message: formattedMessage, ...context }
      : formattedMessage;

    switch (level) {
      case 'debug':
        console.debug(logData);
        break;
      case 'info':
        console.info(logData);
        break;
      case 'warn':
        console.warn(logData);
        break;
      case 'error':
        console.error(logData);
        break;
    }
  }
}
