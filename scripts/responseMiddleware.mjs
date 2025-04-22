// responseMiddleware.js - Middleware para procesar consultas

import ResponseClassifier from './responseMode.mjs';
import { createLogger } from './logger.mjs';
import config from '../config/response.config.mjs';

class ResponseMiddleware {
  constructor(config = {}) {
    this.config = config;
    this.logger = createLogger('ResponseMiddleware');
    this.lastMode = null;
    this.consecutiveThinkingCount = 0;
  }

  validateContext(context) {
    try {
      if (!context || typeof context !== 'object') {
        throw new Error('Contexto inválido: debe ser un objeto');
      }
      return true;
    } catch (error) {
      this.logger.error(`Error al validar contexto: ${error.message}`);
      return false;
    }
  }

  shouldForceAutoMode(classification) {
    // No forzar modo auto si la consulta tiene patrones complejos
    if (classification.hasComplexPattern) {
      return false;
    }

    // Forzar modo auto si hay demasiadas consultas thinking consecutivas
    if (this.consecutiveThinkingCount >= this.config.maxConsecutiveThinking) {
      return true;
    }

    // Forzar modo auto si es una respuesta simple con alta confianza
    if (classification.confidence >= 0.9 && classification.mode === 'auto') {
      return true;
    }

    return false;
  }

  updateModeStats(mode, classification) {
    if (mode === 'thinking' && classification.hasComplexPattern) {
      this.consecutiveThinkingCount++;
      // Resetear contador si excede el máximo
      if (this.consecutiveThinkingCount > this.config.maxConsecutiveThinking) {
        this.consecutiveThinkingCount = 1;
      }
    } else {
      this.consecutiveThinkingCount = 0;
    }
    this.lastMode = mode;
  }

  async processQuery(query, context = {}) {
    const startTime = Date.now();
    try {
      // Validar entrada
      if (!ResponseClassifier.validateQuery(query)) {
        throw new Error('Query inválida');
      }

      if (!this.validateContext(context)) {
        throw new Error('Contexto inválido');
      }

      // Clasificar y procesar la query
      const mode = ResponseClassifier.classifyQuery(query);
      const autoResponse = ResponseClassifier.getAutoResponse(query);

      // Validar respuesta automática si está disponible
      if (autoResponse && !ResponseClassifier.isValidResponse(autoResponse)) {
        this.logger.warn('Respuesta automática inválida, continuando con procesamiento normal');
      }

      const processingTime = Date.now() - startTime;
      this.logger.info({
        message: 'Query procesada exitosamente',
        queryLength: query.length,
        mode,
        processingTime,
        hasAutoResponse: !!autoResponse
      });

      return {
        mode,
        autoResponse,
        processingTime
      };

    } catch (error) {
      this.logger.error({
        message: `Error al procesar query: ${error.message}`,
        query,
        error: error.stack
      });
      
      throw new Error(`Error en el procesamiento: ${error.message}`);
    }
  }

  async logResponse(query, response, mode, timing) {
    if (!this.config.logging.enabled) return;

    try {
      const logData = {
        query,
        responseLength: response.length,
        mode,
        processingTime: timing,
        consecutiveThinking: this.consecutiveThinkingCount,
        timestamp: new Date().toISOString()
      };

      // Registrar en consola
      this.logger.info('Registro de respuesta:', logData);

      // Registrar métricas de uso de modos
      if (mode === 'thinking') {
        this.logger.info(`Consultas thinking consecutivas: ${this.consecutiveThinkingCount}`);
      }
    } catch (error) {
      this.logger.error('Error al registrar respuesta:', error);
    }
  }
}

export default ResponseMiddleware; 