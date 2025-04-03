// Exportar todos los servicios, tipos y clases del módulo IA

// Servicios principales
import { aiService } from './aiService';
import { cacheService } from './cacheService';
import { AIService, AIServiceError } from './aiService';
import { Logger } from './logger';
import { evidenceEvaluationService, medicalSourceVerifier } from './evidence';

// Exportar todo lo necesario
export {
  aiService,
  cacheService,
  AIService,
  AIServiceError,
  Logger,
  evidenceEvaluationService,
  medicalSourceVerifier
};

// Exportar tipos
export * from './types';
