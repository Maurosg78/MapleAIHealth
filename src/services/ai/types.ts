export type MedicalSpecialty = 
  | 'physiotherapy'
  | 'occupationalTherapy'
  | 'speechTherapy'
  | 'general';

export interface AIResponse {
  content: string;
  confidence: number;
  references?: {
    title: string;
    url: string;
    year: number;
  }[];
}

export interface AIContext {
  specialty: MedicalSpecialty;
  currentSection: string;
  patientContext?: {
    patientId: string;
    patientData?: any;
  };
}

export interface ClinicalSuggestion {
  id: string;
  type: 'clinical' | 'diagnostic' | 'alert' | 'documentation' | 'reminder';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  section?: string;
  field?: string;
  evidence?: {
    level: string;
    source: string;
  };
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  evidenceThreshold: number;
  confidenceThreshold: number;
  maxResponseTime: number;
} 