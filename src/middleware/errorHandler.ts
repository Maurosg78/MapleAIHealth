import { Request, Response, NextFunction } from 'express';;;;;
import { BaseError, handleError } from '../services/utils/errors';;;;;
import { Logger } from '../services/utils/logger';;;;;
import { APP_CONFIG } from '../config/constants';;;;;

const logger = new Logger({ name: 'ErrorHandler' });

interface ErrorWithStatusAndContext extends Error {
  statusCode?: number;
  context?: unknown;
}

export const errorHandler = (
  err: ErrorWithStatusAndContext,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof BaseError) {
    logger.error(`Error operacional: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      context: err.context
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    // Error no operacional
    logger.error(`Error no operacional: ${err.message}`, {
      path: req.path
    });

    handleError(err);

    res.status(500).json({
      success: false,
      message: APP_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: APP_CONFIG.ERROR_MESSAGES.NOT_FOUND
  });
}; 