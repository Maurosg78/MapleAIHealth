export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface EMRConsultation {
  id: string;
  patientId: string;
  date: string;
  notes: string;
  status: EMRStatus;
}

export interface EMRTreatment {
  id: string;
  consultationId: string;
  description: string;
  status: EMRStatus;
}

export type EMRStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'cancelled'
  | 'completed';

/**
 * Representa una nota médica no estructurada en el sistema EMR
 */
export interface EMRUnstructuredNote {
  id: string;
  patientId: string;
  date: string;
  provider: string;
  content: string;
  type: 'consultation' | 'discharge' | 'referral' | 'other';
  createdAt: Date;
  specialty?: string;
  consultationId?: string;
}

/**
 * Representa información vital del paciente
 */
export interface EMRVitalSign {
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
}

/**
 * Representa un medicamento en el historial del paciente
 */
export interface EMRMedication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  prescribedBy?: string;
}

/**
 * Representa un procedimiento médico en el historial del paciente
 */
export interface EMRProcedure {
  name: string;
  date: string;
  provider?: string;
  notes?: string;
  status?: EMRStatus;
}

/**
 * Representa los datos demográficos del paciente
 */
export interface EMRDemographics {
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  dob: string;
  ethnicity?: string;
  language?: string;
}

/**
 * Representa un laboratorio o prueba diagnóstica
 */
export interface EMRLabResult {
  name: string;
  date: string;
  value: string;
  unit?: string;
  normalRange?: string;
  isAbnormal?: boolean;
  notes?: string;
}

/**
 * Representa una condición médica o diagnóstico
 */
export interface EMRCondition {
  name: string;
  diagnosisDate?: string;
  status: 'active' | 'resolved' | 'inactive';
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

/**
 * Representa una alergia en el historial médico
 */
export interface EMRAllergy {
  substance: string;
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  onsetDate?: string;
  status: 'active' | 'inactive';
}

/**
 * Representa el historial médico completo del paciente
 */
export interface EMRMedicalHistory {
  conditions: EMRCondition[];
  allergies: string[];
  medications: EMRMedication[];
  procedures: EMRProcedure[];
  labResults?: EMRLabResult[];
  familyHistory?: string[];
  socialHistory?: Record<string, string>;
  immunizations?: Array<{ name: string; date: string }>;
}

/**
 * Representa los datos completos de EMR para un paciente
 * Este formato es compatible con el formato esperado por el servicio de IA
 */
export interface CompleteEMRData {
  patientId: string;
  demographics: EMRDemographics;
  medicalHistory: EMRMedicalHistory;
  vitalSigns?: EMRVitalSign[];
  consultations?: EMRConsultation[];
  unstructuredNotes?: EMRUnstructuredNote[];
  lastUpdated: string;
}

/**
 * Representa los datos que se utilizan en las interfaces de EMR
 */
export interface EMRUIData {
  patient: PatientData;
  emrData: CompleteEMRData;
  lastUpdated: Date;
  status: 'loading' | 'loaded' | 'error';
  error?: string;
}

/**
 * Sistemas EMR soportados
 */
export type EMRSystem =
  | 'EPIC'
  | 'OSCAR'
  | 'ClinicCloud'
  | 'Cerner'
  | 'MedTrack'
  | 'GenericEMR';
