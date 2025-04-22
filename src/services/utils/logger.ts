export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LoggerOptions {
  name: string;
}

export class Logger {
  private name: string;

  constructor(options: LoggerOptions) {
    this.name = options.name;
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[${this.name}] ${message}`, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[${this.name}] ${message}`, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[${this.name}] ${message}`, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    console.debug(`[${this.name}] ${message}`, context);
  }
} 