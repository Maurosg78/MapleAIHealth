/**
 * Tipos para el sistema clínico de AIDUX EMR
 * Diseñado con arquitectura expandible para soportar múltiples especialidades
 */

// Especialidades médicas soportadas por el sistema
export type SpecialtyType = 'physiotherapy' | 'general' | 'pediatrics' | 'nutrition' | 'psychology';

// Tipos de elementos de formulario que pueden usarse en la configuración SOAP
export type FormElementType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'range'
  | 'anatomical-selector'
  | 'pain-scale'
  | 'rom-measurement'
  | 'strength-measurement';

// Estructura para opciones en elementos de selección (select, multiselect, radio, checkbox)
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

// Elemento de formulario base para configuraciones dinámicas
export interface FormFieldConfig {
  id: string;
  type: FormElementType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  conditional?: {
    dependsOn: string;
    showWhen: string | number | boolean | string[];
    operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  };
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    customValidation?: string;
  };
  defaultValue?: string | number | boolean | string[] | null;
  disabled?: boolean;
  readOnly?: boolean;
  width?: 'full' | 'half' | 'third';
  className?: string;
}

/**
 * Interfaz para el rango de movimiento de una articulación
 * @property active - Valor en grados del rango activo
 * @property passive - Valor en grados del rango pasivo
 * @property normal - Valor normal esperado en grados
 */
export interface RangeOfMotionData {
  active?: number;
  passive?: number;
  normal?: number;
}

/**
 * Interfaz para las mediciones de fuerza muscular
 * @property value - Valor de fuerza en escala 0-5
 * @property notes - Notas adicionales sobre la medición
 */
export interface StrengthMeasurementData {
  value: number;
  notes?: string;
}

/**
 * Datos objetivos recogidos durante la exploración física
 * @property observation - Observaciones generales
 * @property inspection - Hallazgos visuales durante la inspección
 * @property palpation - Hallazgos durante la palpación
 * @property rangeOfMotion - Mediciones del rango de movimiento por articulación
 * @property muscleStrength - Valoración de fuerza muscular (0-5)
 * @property specialTests - Resultados de pruebas específicas
 */
export interface ObjectiveData {
  observation: string;
  rangeOfMotion?: Record<string, number | RangeOfMotionData>;
  strength?: Record<string, number>;
  specialTests?: Record<string, string> | {
    name: string;
    result: 'positive' | 'negative' | 'inconclusive';
    notes?: string;
  }[];
  functionalTests?: Record<string, string>;
  vitalSigns?: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    height?: number;
    weight?: number;
  };
  posture?: string;
  gait?: string;
  palpation?: string;
  inspection?: string;
  neurologicalTests?: Record<string, string>;
  edema?: string;
  skinCondition?: string;
  scars?: string;
  swelling?: string;
  deformity?: string;
  muscleTone?: string;
  reflexes?: Record<string, string>;
  sensation?: Record<string, string>;
  coordination?: string;
  balance?: string;
  functionalMobility?: string;
  activitiesOfDailyLiving?: string;
  workRelatedActivities?: string;
  sportsSpecificTests?: Record<string, string>;
  otherTests?: Record<string, string>;
  balanceTests?: {
    romberg?: boolean;
    tandemStance?: boolean;
    functionalReach?: boolean;
  };
  strengthTests?: {
    manualMuscleTesting?: boolean;
    functionalStrength?: boolean;
    enduranceTesting?: boolean;
  };
  muscleStrength?: Record<string, {
    right: number;
    left: number;
  }>;
}

// Estructura para datos subjetivos
export interface SubjectiveData {
  chiefComplaint: string;
  painScale?: number;
  painLevel?: number;
  painIntensity?: number;
  painDescription?: string;
  painLocation?: string[];
  painQuality?: string[];
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  previousTreatments?: string[];
  patientGoals?: string[];
  symptoms?: string | string[];
  onset?: string;
  onsetDate?: string;
  history?: string;
  medicalHistory: string;
  currentMedications?: string;
  functionalLimitations?: string;
  dailyActivities?: string;
}

// Estructura para datos de plan
export interface PlanData {
  goals: string[];
  shortTermGoals: string[];
  longTermGoals: string[];
  treatment: string;
  recommendations: string | string[];
  homeExerciseProgram: string;
  followUpPlan: string;
  expectedOutcomes: string;
  referrals: string;
  treatmentFrequency?: string;
  treatmentDuration?: string;
  interventions?: {
    manual?: string[];
    exercises?: string[];
    modalities?: string[];
    education?: string[];
    type?: string;
    description?: string;
    frequency?: string;
    duration?: string;
  }[] | {
    manual?: string[];
    exercises?: string[];
    modalities?: string[];
    education?: string[];
  };
  reevaluationPlan?: string;
  precautions?: string[];
  contraindications?: string[];
  homeExercises?: {
    name: string;
    sets: number;
    reps: number;
    frequency: string;
    instructions: string;
  }[];
  nextVisit?: Date;
}

// Estructura para datos de evaluación
export interface AssessmentData {
  diagnosis: string;
  diagnoses?: {
    primary: string;
    differential: string[];
  };
  clinicalReasoning?: string;
  clinicalFindings: string;
  impression: string;
  problemList: string[];
  differentialDiagnosis: string;
  reasoning: string;
  prognosis: string;
  functionalDiagnosis?: string;
  functionalLimitations?: string[];
  clinicalClassification?: string[];
  riskFactors?: string[];
  prognosticFactors?: string[];
  comorbidities?: string[];
}

// Datos completos SOAP
export interface SoapData {
  id?: string;
  patientId: string;
  visitId?: string;
  date: string;
  clinicianId: string;
  specialty: SpecialtyType;
  subjective: SubjectiveData;
  objective: ObjectiveData;
  assessment: AssessmentData;
  plan: PlanData;
  status: 'draft' | 'completed' | 'signed';
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Configuración SOAP específica por especialidad
export interface SoapSpecialtyConfig {
  specialty: SpecialtyType;
  name: string;
  description?: string;
  version?: string;
  sections: {
    subjective: FormFieldConfig[];
    objective: FormFieldConfig[];
    assessment: FormFieldConfig[];
    plan: FormFieldConfig[];
  };
  templates?: {
    diagnoses?: { id: string; name: string; description?: string; code?: string }[];
    treatments?: { id: string; name: string; description?: string }[];
    exercises?: { id: string; name: string; description?: string; instructions?: string }[];
  };
  customFields?: Record<string, FormFieldConfig>;
}

/**
 * Tipo de unidad para mediciones clínicas
 */
export type MeasurementUnit = 'cm' | 'mm' | 'kg' | 'lb' | 'in' | 'degrees' | 'points' | 'percentage' | 'score';

/**
 * Interfaz para mediciones específicas del paciente
 */
export interface ClinicalMeasurement {
  name: string;
  value: number;
  unit: MeasurementUnit;
  date: string;
  notes?: string;
  assessmentId?: string;
}

/**
 * Interfaz para el registro de progreso
 * Usado en componentes de visualización de progreso
 */
export interface ProgressRecord {
  date: string;
  rom?: Record<string, RangeOfMotionData>;
  strength?: Record<string, StrengthMeasurementData>;
  functionalScores?: Record<string, number>;
  notes?: string;
  visitId?: string;
}

/**
 * Interfaz para el seguimiento del progreso del paciente
 */
export interface PatientProgress {
  patientId: string;
  clinicianId: string;
  startDate: string;
  currentDate?: string;
  measurements: Record<string, ClinicalMeasurement[]>;
  progressRecords?: ProgressRecord[];
  goals: {
    id: string;
    description: string;
    targetValue?: number;
    targetUnit?: MeasurementUnit;
    targetDate?: string;
    status: 'pending' | 'in-progress' | 'achieved' | 'modified';
    notes?: string;
  }[];
  notes: string;
}

/**
 * Estado de un documento o consentimiento
 */
export type DocumentStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'revoked';

/**
 * Interfaz para consentimientos informados
 */
export interface InformedConsent {
  id: string;
  patientId: string;
  clinicianId: string;
  title: string;
  type: 'treatment' | 'procedure' | 'research' | 'dataSharing' | 'other';
  content: string;
  signature?: {
    patientSignature: string;
    patientName: string;
    date: string;
    witnessSignature?: string;
    witnessName?: string;
  };
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

/**
 * Interfaz para documentos clínicos (certificados, informes, etc.)
 */
export interface ClinicalDocument {
  id: string;
  patientId: string;
  clinicianId: string;
  visitId?: string;
  title: string;
  type: 'certificate' | 'referral' | 'prescription' | 'labOrder' | 'report' | 'other';
  content: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Estructura de datos para almacenar toda la información SOAP completa
 */
export interface SOAPData {
  patientId: string;
  subjective: SubjectiveData | null;
  objective: ObjectiveData | null;
  assessment: AssessmentData | null;
  plan: PlanData | null;
}

export type SOAPSection = 'subjective' | 'objective' | 'assessment' | 'plan';

export interface SOAPNote {
  subjective: {
    chiefComplaint: string;
    painScale: number;
    symptoms: string[];
    onset: string;
    history: string;
    aggravatingFactors: string[];
    relievingFactors: string[];
  };
  
  objective: {
    observation: string;
    palpation: string;
    rangeOfMotion: {
      [joint: string]: {
        active: {
          flexion?: number;
          extension?: number;
          rotation?: number;
          abduction?: number;
          adduction?: number;
        };
        passive: {
          flexion?: number;
          extension?: number;
          rotation?: number;
          abduction?: number;
          adduction?: number;
        };
      };
    };
    muscleStrength: {
      [muscle: string]: {
        right: number;
        left: number;
      };
    };
    specialTests: {
      name: string;
      result: 'positive' | 'negative' | 'inconclusive';
      notes?: string;
    }[];
  };
  
  assessment: {
    diagnoses: {
      primary: string;
      differential: string[];
    };
    clinicalReasoning: string;
    functionalLimitations: string[];
    prognosis: string;
  };
  
  plan: {
    shortTermGoals: string[];
    longTermGoals: string[];
    interventions: {
      type: string;
      description: string;
      frequency: string;
      duration: string;
    }[];
    homeExercises: {
      name: string;
      sets: number;
      reps: number;
      frequency: string;
      instructions: string;
    }[];
    nextVisit: Date;
    recommendations: string[];
  };
  
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    therapistId: string;
    patientId: string;
    visitNumber: number;
  };
}

export interface PhysicalAssessment {
  posture: {
    anterior: string;
    posterior: string;
    lateral: string;
    notes: string;
  };
  
  gait: {
    pattern: string;
    deviations: string[];
    assistiveDevices: string[];
    notes: string;
  };
  
  balance: {
    static: {
      score: number;
      notes: string;
    };
    dynamic: {
      score: number;
      notes: string;
    };
  };
  
  neurological: {
    dermatomes: {
      [level: string]: {
        right: 'normal' | 'altered' | 'absent';
        left: 'normal' | 'altered' | 'absent';
      };
    };
    reflexes: {
      [reflex: string]: {
        right: number;
        left: number;
      };
    };
    notes: string;
  };
  
  painAssessment: {
    vas: number;
    location: string[];
    quality: string[];
    behavior: 'constant' | 'intermittent' | 'mechanical' | 'chemical';
    aggravatingFactors: string[];
    relievingFactors: string[];
  };
}

export type MuscleStrengthGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface ROMAssessment {
  value: number;
  endFeel?: 'normal' | 'empty' | 'firm' | 'hard' | 'spasm';
  pain?: boolean;
  notes?: string;
}

export type SuggestionType = 
  | 'documentation'  // Sugerencias para mejorar la documentación
  | 'warning'       // Advertencias clínicas importantes
  | 'blindspot'     // Posibles puntos ciegos en la evaluación
  | 'interaction'   // Interacciones medicamentosas o contraindicaciones
  | 'followup'      // Sugerencias de seguimiento
  | 'reference'     // Referencias a guías clínicas o protocolos;

export interface AssistantSuggestion {
  id: string;
  type: SuggestionType;
  content: string;
  confidence?: number;  // Nivel de confianza de la sugerencia (0-1)
  source?: string;     // Fuente de la sugerencia (ej: "Guía Clínica X")
  priority?: 'high' | 'medium' | 'low';
  metadata?: {
    section?: string;  // Sección SOAP a la que se aplica
    context?: string; // Contexto específico de la sugerencia
    references?: string[]; // Referencias bibliográficas
  };
}

export interface SuggestionStats {
  total: number;
  accepted: number;
  rejected: number;
  byType: Record<SuggestionType, number>;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ClinicalContext {
  patientId: string;
  visitId: string;
  specialty: string;
  activeSection: string;
  documentation: string;
  previousNotes?: string[];
  patientHistory?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
}

/**
 * Evento médico en la línea de tiempo
 */
export interface MedicalEvent {
  id: string;
  type: 'condition' | 'medication' | 'procedure' | 'test' | 'visit' | 'symptom';
  date: string;
  description: string;
  severity?: number;
  status?: 'active' | 'resolved' | 'chronic';
  relatedEvents?: string[];
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Línea de tiempo médica del paciente
 */
export interface MedicalTimeline {
  patientId: string;
  events: MedicalEvent[];
  conditions: {
    [conditionId: string]: {
      onset: string;
      resolution?: string;
      severity: number;
      relatedEvents: string[];
    };
  };
  medications: {
    [medicationId: string]: {
      startDate: string;
      endDate?: string;
      dosage: string;
      frequency: string;
      relatedEvents: string[];
    };
  };
  tests: {
    [testId: string]: {
      date: string;
      type: string;
      results: string;
      relatedEvents: string[];
    };
  };
}

/**
 * Sugerencia de test basada en evidencia
 */
export interface EvidenceBasedTest {
  id: string;
  name: string;
  description: string;
  evidenceLevel: EvidenceLevel;
  relevance: number;
  urgency: 'immediate' | 'urgent' | 'routine';
  conditions: string[];
  contraindications: string[];
  references: {
    source: string;
    title: string;
    url: string;
    publicationDate: string;
  }[];
} 