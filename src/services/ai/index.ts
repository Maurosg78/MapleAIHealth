// Exportar todos los servicios, tipos y clases del módulo IA

// Importar y exportar servicios
import { AIService } from './aiService';
import { CacheService } from './cacheService';
import { Logger } from './logger';
import { MonitorService } from './monitorService';
import {
  CachePrioritizationService,
  cachePrioritizationService,
  PrioritizationStrategy,
} from './cache';

// Exportar tipos desde types.ts
import type { AIQuery, AIResponse, AIProvider, UnstructuredNote } from './types';

// Re-exportar los tipos de types.ts
export type { AIQuery, AIResponse, AIProvider, PrioritizationStrategy, UnstructuredNote };

export type ContextType = 'emr' | 'appointment' | 'general';

export interface AIContext {
  type: ContextType;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>; // Para compatibilidad con AIContextInterface
}

export interface Recommendation {
  id: string;
  content: string;
  confidence: number;
  evidence?: string[];
  metadata?: Record<string, unknown>;
  // Compatibilidad con AIRecommendation
  type?: string;
}

// Mock del servicio de evaluación de evidencia
export const evidenceEvaluationService = {
  evaluateEvidence: (evidence: string[]) => ({
    score: 0.85,
    validatedEvidence: evidence,
    confidence: 'high',
  }),
  evaluateRecommendation: (recommendation: Recommendation) => ({
    score: 0.9,
    evidenceLevel: recommendation.evidenceLevel ?? 'B',
    confidenceScore: 85,
    reliability: 'high',
    limitations: [],
    sources: recommendation.evidence ?? [],
  }),
};

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
  cachePrioritizationService,
};
