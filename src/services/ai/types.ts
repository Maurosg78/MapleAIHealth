// types simplificado
export const types = {
  // Implementación básica
};

// Define tipos para el servicio de IA

// Tipos de datos médicos
export interface EMRData {
  patientId: string;
  demographics: {
    name: string;
    age: number;
    sex: 'male' | 'female' | 'other';
    dob: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: Medication[];
    procedures: Procedure[];
  };
  vitalSigns?: VitalSigns[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  prescribedBy?: string;
}

export interface Procedure {
  name: string;
  date: string;
  provider?: string;
  notes?: string;
}

export interface VitalSigns {
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
}

// Tipos para notas clínicas no estructuradas
export interface UnstructuredNote {
  id: string;
  date: string;
  provider: string;
  content: string;
  type: 'progress' | 'consultation' | 'discharge' | 'referral' | 'other';
  specialty?: string;
}

// Tipos para consultas de IA
export type ContextType = 'emr' | 'appointment' | 'general';

export interface AIContext {
  type: ContextType;
  data: EMRData | Record<string, unknown>;
}

export interface AIQuery {
  query: string;
  patientId?: string;
  context?: AIContext;
  unstructuredNotes?: UnstructuredNote[];
  options?: {
    provider?: string;
    language?: string;
    maxTokens?: number;
  };
}

// Tipos para respuestas de IA
export type InsightType =
  | 'contradiction'
  | 'missing-information'
  | 'clinical-pattern'
  | 'risk-factor'
  | 'treatment-gap';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  sourcesReferences?: {
    noteId?: string;
    date?: string;
    excerpt?: string;
  }[];
}

export type RecommendationType =
  | 'follow-up'
  | 'test'
  | 'medication'
  | 'consultation'
  | 'lifestyle';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timeframe?: string;
  rationale?: string;
  evidenceLevel?: 'low' | 'moderate' | 'high';
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  category: 'condition' | 'medication' | 'procedure' | 'visit' | 'other';
  source?: string;
}

export interface AIResponse {
  summary: string;
  timeline?: TimelineEvent[];
  insights?: Insight[];
  recommendations?: Recommendation[];
  followUpQuestions?: string[];
  responseId: string;
  processingTime?: number;
}

// Tipos para proveedores de IA
export type CapabilityType =
  | 'emr-analysis'
  | 'timeline-organization'
  | 'insight-detection'
  | 'clinical-evidence'
  | 'treatment-patterns';

export interface AIProvider {
  id: string;
  name: string;
  costPerQuery: number;
  capabilities: CapabilityType[];
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  projectId?: string;
}

// Tipos para el sistema de caché
export interface CacheItem<T> {
  value: T;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Tipos para logging y servicio interno
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, unknown>;
}

// Tipos para servicios internos
export interface AIServiceInternals {
  providers: AIProvider[];
  activeProvider: string;
  simulationMode: boolean;
  retryCount: number;
  retryDelay: number;
}
