/**
import {
   HttpService 
} from "../../../lib/api"; * Interfaz base para adaptadores de EMR
 * Define las operaciones comunes para interactuar con sistemas de Registros Médicos Electrónicos (EMR)
 */
export interface EMRAdapter {
  /**
   * Nombre identificador del sistema EMR
   */
  readonly name: string;

  /**
   * Verifica la conexión con el sistema EMR
   * @returns Promise que resuelve a true si la conexión es exitosa
   */
  testConnection(): Promise<boolean>;

  /**
   * Obtiene los datos completos de un paciente
   * @param patientId Identificador del paciente en el sistema EMR
   * @returns Promise con los datos del paciente estructurados
   */
  getPatientData(patientId: string): Promise<PatientData>;

  /**
   * Busca pacientes según criterios específicos
   * @param query Objeto con criterios de búsqueda
   * @param limit Límite de resultados a devolver
   * @returns Promise con array de resultados de pacientes
   */
  searchPatients(
    query: EMRSearchQuery,
    limit?: number
  ): Promise<EMRPatientSearchResult[]>;

  /**
   * Obtiene el historial médico de un paciente
   * @param patientId Identificador del paciente
   * @param options Opciones para filtrar el historial
   * @returns Promise con el historial médico estructurado
   */
  getPatientHistory(
    patientId: string,
    options?: EMRHistoryOptions
  ): Promise<EMRPatientHistory>;

  /**
   * Guarda una nueva consulta en el historial del paciente
   * @param consultation Datos de la consulta a guardar
   * @returns Promise con el ID de la consulta guardada
   */
  saveConsultation(consultation: EMRConsultation): Promise<string>;

  /**
   * Actualiza una consulta existente
   * @param consultationId ID de la consulta a actualizar
   * @param updates Campos a actualizar
   * @returns Promise que resuelve a true si la actualización fue exitosa
   */
  updateConsultation(
    consultationId: string,
    updates: Partial<EMRConsultation>
  ): Promise<boolean>;

  /**
   * Registra un nuevo tratamiento para un paciente
   * @param treatment Datos del tratamiento a registrar
   * @returns Promise con el ID del tratamiento registrado
   */
  registerTreatment(treatment: EMRTreatment): Promise<string>;

  /**
   * Obtiene métricas de salud del paciente
   * @param patientId ID del paciente
   * @param metricTypes Tipos de métricas a obtener
   * @returns Promise con las métricas de salud solicitadas
   */
  getPatientMetrics(
    patientId: string,
    metricTypes: string[]
  ): Promise<EMRPatientMetrics>;
}

/**
 * Opciones para filtrar el historial médico
 */
export interface EMRHistoryOptions {
  startDate?: Date;
  endDate?: Date;
  includeConsultations?: boolean;
  includeTreatments?: boolean;
  includeLabResults?: boolean;
  includeImaging?: boolean;
  includeDiagnoses?: boolean;
  specialty?: string;
}

/**
 * Consulta para buscar pacientes
 */
export interface EMRSearchQuery {
  name?: string;
  documentId?: string;
  email?: string;
  phone?: string;
  criteria?: string | Record<string, unknown>;
}

/**
 * Resultado de búsqueda de pacientes
 */
export interface EMRPatientSearchResult {
  id: string;
  fullName: string;
  name: string;
  birthDate: string;
  gender: string;
  mrn: string;
  documentId?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  lastVisit?: Date;
}

/**
 * Historia clínica del paciente
 */
export interface EMRPatientHistory {
  patientId: string;
  consultations: EMRConsultation[];
  treatments: EMRTreatment[];
  labResults?: EMRLabResult[];
  imagingResults?: EMRImagingResult[];
  diagnoses?: EMRDiagnosis[];
  allergies?: string[];
  medications?: EMRMedication[];
}

/**
 * Consulta médica
 */
export interface EMRConsultation {
  id: string;
  patientId: string;
  providerId: string;
  date: Date;
  reason: string;
  notes: string;
  specialty?: string;
  diagnoses?: EMRDiagnosis[];
  followUpDate?: Date;
}

/**
 * Tratamiento médico
 */
export interface EMRTreatment {
  id?: string;
  patientId: string;
  providerId: string;
  startDate: Date;
  endDate?: Date;
  name: string;
  type: 'medication' | 'procedure' | 'therapy' | 'lifestyle' | 'other';
  description: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled';
  consultationId?: string;
}

/**
 * Métricas de salud del paciente
 */
export interface EMRPatientMetrics {
  patientId: string;
  vitalSigns?: EMRVitalSigns[];
  labValues?: Record<string, number[]>;
  weightHistory?: Array<{ date: Date; value: number }>;
  heightHistory?: Array<{ date: Date; value: number }>;
  bloodPressureHistory?: Array<{
    date: Date;
    systolic: number;
    diastolic: number;
  }>;
  glucoseHistory?: Array<{
    date: Date;
    value: number;
    type: 'fasting' | 'postprandial' | 'random';
  }>;
  [key: string]: unknown;
}

/**
 * Signos vitales
 */
export interface EMRVitalSigns {
  id: string;
  patientId: string;
  date: Date;
  temperature?: number;
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    unit: string;
  };
  respiratoryRate?: number;
  oxygenSaturation?: number;
  notes?: string;
}

/**
 * Resultado de laboratorio
 */
export interface EMRLabResult {
  id: string;
  patientId: string;
  date: Date;
  type: string;
  orderedBy: string;
  results: Record<
    string,
    {
      value: string | number;
      unit?: string;
      normalRange?: string;
      isAbnormal?: boolean;
    }
  >;
  notes?: string;
}

/**
 * Resultado de imagen diagnóstica
 */
export interface EMRImagingResult {
  id: string;
  patientId: string;
  date: Date;
  type: string;
  region: string;
  findings: string;
  conclusion: string;
  imagePath?: string;
  orderedBy: string;
}

/**
 * Diagnóstico médico
 */
export interface EMRDiagnosis {
  id: string;
  patientId: string;
  date: Date;
  code: string;
  system: 'ICD-10' | 'ICD-11' | 'SNOMED-CT' | 'other';
  description: string;
  status: 'active' | 'resolved' | 'recurrent' | 'chronic' | 'suspected';
  type: string;
  notes?: string;
}

/**
 * Medicación
 */
export interface EMRMedication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescriber: string;
  pharmacy?: string;
  status: 'active' | 'discontinued' | 'completed';
  notes?: string;
}

/**
 * Alergia
 */
export interface EMRAllergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'refuted';
  onsetDate?: Date;
  notes?: string;
}

/**
 * Vacuna
 */
export interface EMRImmunization {
  id: string;
  patientId: string;
  vaccine: string;
  date: Date;
  provider: string;
  lotNumber?: string;
  manufacturer?: string;
  location?: string;
  notes?: string;
}

/**
 * Procedimiento
 */
export interface EMRProcedure {
  id: string;
  patientId: string;
  name: string;
  date: Date;
  provider: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  results?: string;
}

/**
 * Documento
 */
export interface EMRDocument {
  id: string;
  patientId: string;
  type: string;
  date: Date;
  author: string;
  title: string;
  content: string;
  status: 'draft' | 'final' | 'amended';
  notes?: string;
}
