import { PatientData } from '../types';

/**
 * Opciones para la búsqueda de pacientes
 */
export interface EMRSearchQuery {
  name?: string;
  documentId?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

/**
 * Resultado de búsqueda de pacientes
 */
export interface EMRPatientSearchResult {
  id: string;
  fullName: string;
  name?: string;
  birthDate?: string;
  gender?: string;
  mrn?: string;
  documentId?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

/**
 * Opciones para obtener el historial del paciente
 */
export interface EMRHistoryOptions {
  includeConsultations?: boolean;
  includeTreatments?: boolean;
  includeLabResults?: boolean;
  includeDiagnoses?: boolean;
  startDate?: Date;
  endDate?: Date;
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
  diagnoses?: Array<{
    id: string;
    code: string;
    system: string;
    description: string;
    date: Date;
    status: string;
    type?: string;
  }>;
}

/**
 * Tratamiento médico
 */
export interface EMRTreatment {
  id: string;
  patientId: string;
  providerId: string;
  type: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  description?: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  consultationId?: string;
}

/**
 * Diagnóstico médico
 */
export interface EMRDiagnosis {
  id: string;
  patientId: string;
  code: string;
  system: string;
  description: string;
  date: Date;
  status: string;
  type?: string;
}

/**
 * Historial médico del paciente
 */
export interface EMRPatientHistory {
  patientId: string;
  consultations: EMRConsultation[];
  treatments: EMRTreatment[];
  labResults: Array<{
    id: string;
    patientId: string;
    date: Date;
    type: string;
    name: string;
    results: Record<
      string,
      {
        value: string | number;
        unit?: string;
        referenceRange?: string;
        isAbnormal?: boolean;
      }
    >;
    units?: string;
    range?: string;
    abnormal?: boolean;
    notes?: string;
    orderedBy: string;
  }>;
  diagnoses: EMRDiagnosis[];
}

/**
 * Métricas del paciente
 */
export interface EMRPatientMetrics {
  patientId: string;
  weight: Array<{ date: Date; value: number }>;
  height: Array<{ date: Date; value: number }>;
  bloodPressure: Array<{ date: Date; systolic: number; diastolic: number }>;
  glucose: Array<{ date: Date; value: number; type: string }>;
  cholesterol: Array<{ date: Date; value: number }>;
}

/**
 * Interfaz base para adaptadores de EMR
 */
export interface EMRAdapter {
  /**
   * Nombre identificador del sistema EMR
   */
  readonly name: string;

  /**
   * Descripción del adaptador
   */
  readonly description?: string;

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
   * @returns Promise con los resultados de la búsqueda
   */
  searchPatients(
    query: EMRSearchQuery,
    limit?: number
  ): Promise<EMRPatientSearchResult[]>;

  /**
   * Obtiene el historial médico completo de un paciente
   * @param patientId Identificador del paciente
   * @param options Opciones para filtrar el historial
   * @returns Promise con el historial médico del paciente
   */
  getPatientHistory(
    patientId: string,
    options?: EMRHistoryOptions
  ): Promise<EMRPatientHistory>;

  /**
   * Guarda una nueva consulta médica
   * @param consultation Datos de la consulta a guardar
   * @returns Promise con el ID de la consulta guardada
   */
  saveConsultation(consultation: EMRConsultation): Promise<string>;

  /**
   * Actualiza una consulta médica existente
   * @param consultationId ID de la consulta a actualizar
   * @param updates Datos a actualizar
   * @returns Promise que resuelve a true si la actualización fue exitosa
   */
  updateConsultation(
    consultationId: string,
    updates: Partial<EMRConsultation>
  ): Promise<boolean>;

  /**
   * Registra un nuevo tratamiento médico
   * @param treatment Datos del tratamiento a registrar
   * @returns Promise con el ID del tratamiento registrado
   */
  registerTreatment(treatment: EMRTreatment): Promise<string>;

  /**
   * Obtiene métricas específicas del paciente
   * @param patientId Identificador del paciente
   * @param metricTypes Tipos de métricas a obtener
   * @returns Promise con las métricas del paciente
   */
  getPatientMetrics(
    patientId: string,
    metricTypes: string[]
  ): Promise<EMRPatientMetrics>;
}
