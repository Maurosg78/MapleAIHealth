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
  inspection: string;
  palpation: string;
  rangeOfMotion: Record<string, RangeOfMotionData>;
  muscleStrength: Record<string, number>;
  specialTests: Record<string, string>;
}

// Estructura para datos subjetivos
export interface SubjectiveData {
  chiefComplaint: string;
  painLevel?: number;
  painIntensity?: number;
  painDescription?: string;
  painLocation?: string[];
  painQuality?: string[];
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  previousTreatments?: string[];
  patientGoals?: string[];
  symptoms?: string;
  onsetDate?: string;
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
  recommendations: string;
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
  };
  reevaluationPlan?: string;
  precautions?: string[];
  contraindications?: string[];
}

// Estructura para datos de evaluación
export interface AssessmentData {
  diagnosis: string;
  clinicalFindings: string;
  impression: string;
  problemList: string[];
  differentialDiagnosis: string;
  reasoning: string;
  prognosis: string;
  functionalDiagnosis?: string;
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