// Exportaciones de hooks principales
export * from './useApi';
export * from './useAuth';
export * from './useDashboard';
export * from './useAIQuery';
export * from './useEMRAI';
export * from './useResizeObserver';

// Exportaciones de módulos organizados
export * from './list';

export { default as useClinicalRecommendations } from './useClinicalRecommendations';
export type {
  PatientContext,
  UseClinicalRecommendationsOptions,
  UseClinicalRecommendationsResult
} from './useClinicalRecommendations';
