export interface DashboardMetrics {
  totalPatients: number;
  activePatients: number;
  pendingAppointments: number;
  recentActivities: Activity[];
  appointmentsToday: number;
  pendingTasks: number;
  aiQueries: number;
}

export interface Activity {
  id: string;
  description: string;
  timestamp: string;
  type: 'appointment' | 'patient' | 'task' | 'ai_query';
}

/**
 * Datos para el Dashboard de Información Clínica
 */
export interface ClinicalDashboardData {
  evidenceSummary: EvidenceSummary;
  recentEvaluations: RecentEvaluation[];
  topMedicalTopics: MedicalTopic[];
  sourceVerifications: SourceVerificationStats;
}

/**
 * Resumen de evaluaciones de evidencia
 */
export interface EvidenceSummary {
  totalEvaluations: number;
  byLevel: Record<'A' | 'B' | 'C' | 'D', number>;
  averageConfidenceScore: number;
}

/**
 * Evaluación reciente de evidencia
 */
export interface RecentEvaluation {
  id: string;
  content: string;
  timestamp: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  confidenceScore: number;
  sources: number;
}

/**
 * Tema médico con estadísticas
 */
export interface MedicalTopic {
  name: string;
  count: number;
  averageEvidenceLevel: 'A' | 'B' | 'C' | 'D';
}

/**
 * Estadísticas de verificación de fuentes
 */
export interface SourceVerificationStats {
  verified: number;
  unverified: number;
  pending: number;
  byDatabase: DatabaseCount[];
}

/**
 * Conteo por base de datos
 */
export interface DatabaseCount {
  name: string;
  count: number;
}
