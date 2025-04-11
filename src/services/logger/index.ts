/**
 * Servicio simple de logging para la aplicación
 * Adapta mensajes y niveles de log para desarrollo y producción
 */

/**
 * Nivel de log
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Servicio de logger
 */
class Logger {
  /**
   * Log de nivel debug - solo visible en desarrollo
   * @param message Mensaje a loguear
   * @param context Contexto opcional (objetos, datos adicionales)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this._log('debug', message, context);
  }

  /**
   * Log de nivel info - información general
   * @param message Mensaje a loguear
   * @param context Contexto opcional (objetos, datos adicionales)
   */
  info(message: string, context?: Record<string, unknown>): void {
    this._log('info', message, context);
  }

  /**
   * Log de nivel warn - advertencias
   * @param message Mensaje a loguear
   * @param context Contexto opcional (objetos, datos adicionales)
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this._log('warn', message, context);
  }

  /**
   * Log de nivel error - errores críticos
   * @param message Mensaje a loguear
   * @param context Contexto opcional (objetos, datos adicionales)
   */
  error(message: string, context?: Record<string, unknown>): void {
    this._log('error', message, context);
  }

  /**
   * Función interna para manejar todos los logs
   * @param level Nivel de log
   * @param message Mensaje
   * @param context Contexto adicional
   */
  private _log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // En producción, esto podría enviar los logs a un servicio
    // externo o aplicar filtros según el entorno
    switch (level) {
      case 'debug':
        // Solo loguear en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          console.debug(formattedMessage, context || '');
        }
        break;
      case 'info':
        console.info(formattedMessage, context || '');
        break;
      case 'warn':
        console.warn(formattedMessage, context || '');
        break;
      case 'error':
        console.error(formattedMessage, context || '');
        break;
    }
  }
}

// Exportar una instancia singleton
const logger = new Logger();
export default logger;
