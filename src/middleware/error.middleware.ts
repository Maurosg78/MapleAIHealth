import { Request, Response, NextFunction } from 'express';;;;;
import { APP_CONFIG } from '../config/app.config';;;;;
import { Logger } from '../services/utils/logger';;;;;

const logger = new Logger({ name: 'ErrorMiddleware' });

export class ErrorMiddleware {
  static notFound(req: Request, res: Response) {
    logger.error(`Ruta no encontrada: ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: APP_CONFIG.ERROR_MESSAGES.NOT_FOUND
    });
  }

  static handleError(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: APP_CONFIG.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
} 