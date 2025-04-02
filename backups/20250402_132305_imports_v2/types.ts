/**
 * Tipos e interfaces comunes para el sistema de IA
import {
   HttpService 
} from "../../../lib/api"; */

export type NoteType =
  | 'consultation'
  | 'emergency'
  | 'follow-up'
  | 'lab-result'
  | 'prescription'
  | 'other';
export type InsightType =
  | 'timeline-gap'
  | 'treatment-pattern'
  | 'risk-factor'
  | 'contradiction'
  | 'missing-follow-up'
  | 'vital-signs-trend'
  | 'symptom-pattern';
export type SeverityType = 'high' | 'medium' | 'low';
export type RecommendationType =
  | 'medication'
  | 'test'
  | 'follow-up'
  | 'alert'
  | 'referral';

export interface VitalSigns {
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  painLevel?: number;
}

export interface EMRData {
  patientId: string;
  medicalHistory: Array<{
    date: string;
    type: string;
    description: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  vitalSigns: Array<{
    date: string;
    values: Omit<VitalSigns, 'respiratoryRate' | 'painLevel'>;
  }>;
}

export interface UnstructuredNote {
  content: string;
  timestamp: string;
  author: string;
  type: NoteType;
  symptoms?: string[];
  medications?: string[];
  vitalSigns?: VitalSigns;
  diagnosis?: string;
  treatment?: string;
  followUp?: {
    date: string;
    notes: string;
  };
}

export interface AIProvider {
  id: string;
  name: string;
  costPerQuery: number;
  capabilities: string[];
}

export interface AIQuery {
  query: string;
  patientId?: string;
  providerId?: string;
  context?: {
    type: 'emr' | 'appointment' | 'general';
    data?: EMRData;
  };
  unstructuredNotes?: UnstructuredNote[];
}

export interface TimelineEvent {
  type: string;
  description: string;
  source: string;
  confidence: number;
}

export interface Insight {
  type: InsightType;
  description: string;
  severity: SeverityType;
  evidence: string[];
  recommendation?: string;
}

export interface Recommendation {
  type: RecommendationType;
  description: string;
  priority: SeverityType;
  evidence: string[];
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  timeline?: Array<{
    date: string;
    events: TimelineEvent[];
  }>;
  insights?: Insight[];
  recommendations?: Recommendation[];
}

export interface CachedResponse {
  query: string;
  response: AIResponse;
  timestamp: number;
  id: string;
  queryHash: string;
  lastAccessed: string;
  accessCount: number;
  metadata?: {
    provider: string;
    cost: number;
    processingTime: number;
  };
}

/**
 * Interfaz para métodos internos de AIService (usado para testing)
 */
export interface AIServiceInternals {
  getEMRData: (patientId: string) => Promise<EMRData>;
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    retries?: number
  ) => Promise<T>;
  generateSimulatedResponse: (query: AIQuery) => Promise<AIResponse>;
  detectContradictions: (
    emrData: EMRData,
    notes: UnstructuredNote[]
  ) => Insight[];
  generateInsights: (response: AIResponse, emrData: EMRData) => Insight[];
  generateRecommendations: (response: AIResponse) => Recommendation[];
}

/**
 * Nivel de evidencia clínica
 */
export type EvidenceLevel = 'alto' | 'moderado' | 'bajo';

/**
 * Fuente de evidencia clínica
 */
export interface EvidenceSource {
  title: string;
  authors?: string[];
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  summary: string;
  evidenceLevel: EvidenceLevel;
}

/**
 * Tratamiento sugerido basado en evidencia
 */
export interface TreatmentSuggestion {
  name: string;
  type: 'medicamento' | 'terapia' | 'procedimiento' | 'cambio-estilo-vida';
  description: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  contraindications?: string[];
  sideEffects?: string[];
  expectedOutcomes?: string[];
  evidenceLevel: EvidenceLevel;
  evidenceSources: EvidenceSource[];
  confidence: number;
  alternativeTreatments?: string[];
}

/**
 * Pregunta sugerida durante la consulta
 */
export interface SuggestedQuestion {
  question: string;
  context: string;
  importance: 'alta' | 'media' | 'baja';
  rationale: string;
  expectedInsights: string[];
  differentialDiagnosis?: string[];
}

/**
 * Tipos de etapas de la consulta médica
 */
export type ConsultationStage =
  | 'anamnesis'
  | 'examen-fisico'
  | 'diagnostico'
  | 'plan-tratamiento'
  | 'educacion-paciente'
  | 'seguimiento';

/**
 * Ampliar AIResponse para incluir sugerencias de tratamiento y preguntas
 */
export interface EnhancedAIResponse extends AIResponse {
  treatmentSuggestions?: TreatmentSuggestion[];
  suggestedQuestions?: SuggestedQuestion[];
  currentStage?: ConsultationStage;
  nextSteps?: string[];
  educationalContent?: {
    forPatient?: string;
    forProvider?: string;
    resources?: Array<{ title: string; url: string }>;
  };
}

/**
 * Contexto de la consulta actual
 */
export interface ConsultationContext {
  patientId: string;
  providerId: string;
  specialtyArea: string;
  reasonForVisit: string;
  isFirstVisit: boolean;
  previousDiagnoses?: string[];
  currentMedications?: string[];
  stage: ConsultationStage;
  timeElapsed?: number; // Tiempo transcurrido en la consulta (minutos)
  timeRemaining?: number; // Tiempo restante estimado (minutos)
}

/**
 * Ampliar AIQuery para incluir contexto de consulta
 */
export interface EnhancedAIQuery extends AIQuery {
  consultationContext?: ConsultationContext;
  requiresTreatmentSuggestions?: boolean;
  requiresQuestionSuggestions?: boolean;
  requiresEducationalContent?: boolean;
  evidenceLevelThreshold?: EvidenceLevel;
}

/**
 * Datos del paciente
 */
export interface PatientData {
  id: string;
  personalInfo: {
    fullName: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    documentId?: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  medicalHistory?: {
    allergies?: string[];
    chronicConditions?: string[];
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate?: string;
      endDate?: string;
    }>;
    surgeries?: Array<{
      procedure: string;
      date: string;
      notes?: string;
    }>;
    familyHistory?: Record<string, string[]>;
  };
  vitalSigns?: {
    height?: number;
    weight?: number;
    bmi?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    lastUpdated?: string;
  };
  consultations?: Array<{
    id: string;
    date: string;
    provider: string;
    specialty?: string;
    reason: string;
    diagnosis?: string[];
    notes: string;
    treatmentPlan?: string;
    followUp?: string;
  }>;
  labResults?: Array<{
    id: string;
    date: string;
    type: string;
    results: Record<
      string,
      {
        value: string | number;
        unit?: string;
        referenceRange?: string;
        isAbnormal?: boolean;
      }
    >;
  }>;
  currentTreatments?: Array<{
    name: string;
    type: string;
    startDate: string;
    endDate?: string;
    status: string;
    notes?: string;
  }>;
}
