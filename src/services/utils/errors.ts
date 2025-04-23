import { APP_CONFIG } from '../../config/constants';;;;;

export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message = APP_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR, context?: Record<string, unknown>) {
    super(message, 400, true, context);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message = APP_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS, context?: Record<string, unknown>) {
    super(message, 401, true, context);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message = APP_CONFIG.ERROR_MESSAGES.FORBIDDEN, context?: Record<string, unknown>) {
    super(message, 403, true, context);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = APP_CONFIG.ERROR_MESSAGES.USER_NOT_FOUND, context?: Record<string, unknown>) {
    super(message, 404, true, context);
  }
}

export class ServerError extends BaseError {
  constructor(message = APP_CONFIG.ERROR_MESSAGES.SERVER_ERROR, context?: Record<string, unknown>) {
    super(message, 500, false, context);
  }
}

export const isOperationalError = (error: Error): boolean => {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
};

export const handleError = (error: Error): void => {
  if (!isOperationalError(error)) {
    // Aquí podríamos agregar lógica para notificar al equipo de desarrollo
    console.error('Error no operacional detectado:', error);
    process.exit(1);
  }
}; 