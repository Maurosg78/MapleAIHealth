/**
 * Tipos para el Dashboard de Información Clínica
 */

/**
 * Interfaces para fuentes de evidencia clínica
 */
export interface EvidenceSource {
  id: string;
  name: string;
  url?: string;
  type: 'journal' | 'guideline' | 'study' | 'systematic_review' | 'meta_analysis' | 'expert_opinion' | 'other';
  reliability: 1 | 2 | 3 | 4 | 5; // Escala de fiabilidad (1-5)
  verificationStatus: 'verified' | 'pending' | 'unverified';
  lastUpdated: string;
}

/**
 * Estructura de evidencia clínica
 */
export interface ClinicalEvidence {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  reliability: number;
  relevanceScore: number;
  conditionTags: string[];
  treatmentTags: string[];
  categoryTags: string[];
  lastUpdated: string;
}

/**
 * Estructura para visualización de evidencia
 */
export interface EvidenceVisualization {
  id: string;
  title: string;
  evidenceId: string;
  type: 'chart' | 'table' | 'graph' | 'timeline' | 'comparison';
  config: Record<string, unknown>;
  lastRendered?: string;
}

/**
 * Datos para el gráfico de nivel de evidencia
 */
export interface EvidenceLevelData {
  level: string;
  count: number;
  description: string;
  color: string;
}

/**
 * Estadísticas de uso de evidencia
 */
export interface EvidenceUsageStats {
  totalEvidenceCount: number;
  recentlyAccessedCount: number;
  byCategory: Record<string, number>;
  byCondition: Record<string, number>;
  byTreatment: Record<string, number>;
  bySource: Record<string, number>;
  byReliability: Record<string, number>;
}

/**
 * Indicadores clínicos para el dashboard
 */
export interface ClinicalMetrics {
  patientId: string;
  lastVisit: string;
  nextAppointment: string;
  treatmentProgress: number;
  painLevel: number;
  mobilityScore: number;
  adherenceToTreatment: number;
  lastUpdated: string;
  evidenceUsageStats: EvidenceUsageStats;
  evidenceLevels: EvidenceLevelData[];
  popularSearches: Array<{
    term: string;
    count: number;
    trending?: boolean;
  }>;
  recentlyUpdated: ClinicalEvidence[];
  cachePerformance: {
    hitRate: number;
    missRate: number;
    avgLoadTime: number;
    size: number;
  };
}

/**
 * Filtros para el dashboard clínico
 */
export interface ClinicalDashboardFilters {
  categories?: string[];
  conditions?: string[];
  treatments?: string[];
  evidenceTypes?: string[];
  minReliability?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  patientId?: string;
  specialty?: string;
  evidenceType?: string[];
  status?: string[];
}

/**
 * Opciones de configuración para el dashboard
 */
export interface ClinicalDashboardConfig {
  defaultFilters: ClinicalDashboardFilters;
  refreshInterval?: number; // en ms
  enableCache: boolean;
  cacheConfig?: {
    ttl: number; // en ms
    priority: 'high' | 'medium' | 'low';
  };
  layout?: 'grid' | 'horizontal' | 'vertical';
  charts?: {
    colorScheme?: string;
    showLegends?: boolean;
    interactive?: boolean;
  };
}

/**
 * Respuesta completa del Dashboard de Información Clínica
 */
export interface ClinicalDashboardData {
  patientId: string;
  metrics: {
    evidenceUsageStats: {
      totalEvidenceCount: number;
      recentlyAccessedCount: number;
      byCategory: Record<string, number>;
    };
    cachePerformance: {
      hitRate: number;
      missRate: number;
      avgLoadTime: number;
    };
    evidenceLevels: Array<{
      level: string;
      count: number;
    }>;
  };
  config?: {
    refreshInterval?: number;
  };
  lastUpdated: string;
  recentEvidence: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
} 