import { PatientData } from '../ai/types';

/**
 * Interfaz base para adaptadores de EMR
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
  dateOfBirth?: Date;
  criteria?: string | number | boolean;
}

/**
 * Resultado de búsqueda de paciente
 */
export interface EMRPatientSearchResult {
  id: string;
  fullName: string;
  dateOfBirth?: Date;
  documentId?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  lastVisit?: Date;
  name?: string;
  birthDate?: string;
  gender?: string;
  mrn?: string;
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
  id?: string;
  patientId: string;
  providerId?: string;
  date: Date;
  reason: string;
  notes: string;
  diagnoses?: EMRDiagnosis[];
  vitalSigns?: EMRVitalSigns;
  treatmentPlan?: string;
  followUpDate?: Date;
  specialty?: string;
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
  date: Date;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  pain?: number;
}

/**
 * Resultado de laboratorio
 */
export interface EMRLabResult {
  id: string;
  patientId: string;
  date: Date;
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
  orderedBy: string;
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
  id?: string;
  patientId?: string;
  code: string;
  system: 'ICD-10' | 'ICD-11' | 'SNOMED-CT' | 'other' | string;
  description: string;
  date?: Date;
  status: 'active' | 'resolved' | 'recurrent' | 'chronic' | 'suspected';
  notes?: string;
  type?: string;
}

/**
 * Medicación
 */
export interface EMRMedication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'cancelled' | 'on-hold';
  prescribedBy: string;
  reason?: string;
}
