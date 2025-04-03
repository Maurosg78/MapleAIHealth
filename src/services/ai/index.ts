// Exportar todos los servicios, tipos y clases del módulo IA

// Importar y exportar servicios
import { AIService } from './aiService';
import { CacheService } from './cacheService';
import { Logger } from './logger';
import { MonitorService } from './monitorService';
import { CachePrioritizationService, cachePrioritizationService, PrioritizationStrategy } from './cache';

// Exportar tipos desde types.ts
import type {
  AIQuery,
  AIResponse,
  AIProvider
} from './types';

// Instancias de Servicios
export const aiService = AIService.getInstance();
export const cacheService = CacheService.getInstance();
export const monitorService = MonitorService.getInstance();

// Exportar todos los servicios
export {
  AIService,
  CacheService,
  MonitorService,
  Logger,
  CachePrioritizationService,
  cachePrioritizationService
};

// Exportar tipos
export type {
  AIProvider,
  AIQuery,
  AIResponse,
  PrioritizationStrategy
};
