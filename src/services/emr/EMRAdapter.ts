import {
  PatientData,
  EMRConsultation,
  EMRTreatment,
  EMRUnstructuredNote,
  CompleteEMRData,
} from './types';

/**
 * Interfaz base para todos los adaptadores de EMR
 * Define las operaciones comunes que todos los adaptadores deben implementar
 */
export interface EMRAdapter {
  /**
   * Obtiene datos del paciente
   * @param patientId ID del paciente
   */
  getPatientData(patientId: string): Promise<PatientData>;

  /**
   * Busca pacientes según criterios
   * @param criteria Criterios de búsqueda
   * @param limit Límite de resultados
   */
  searchPatients(
    criteria: Record<string, unknown>,
    limit?: number
  ): Promise<PatientData[]>;

  /**
   * Obtiene consultas médicas del paciente
   * @param patientId ID del paciente
   * @param limit Límite de resultados
   */
  getConsultations(
    patientId: string,
    limit?: number
  ): Promise<EMRConsultation[]>;

  /**
   * Obtiene tratamientos asociados a una consulta
   * @param consultationId ID de la consulta
   */
  getTreatments(consultationId: string): Promise<EMRTreatment[]>;

  /**
   * Verifica si la conexión con el EMR está activa
   */
  testConnection(): Promise<boolean>;

  /**
   * Obtiene notas médicas no estructuradas del paciente
   * @param patientId ID del paciente
   * @param limit Límite de resultados
   */
  getUnstructuredNotes(
    patientId: string,
    limit?: number
  ): Promise<EMRUnstructuredNote[]>;

  /**
   * Obtiene datos clínicos completos del paciente en un formato estandarizado
   * Este método proporciona toda la información necesaria para análisis de IA
   * @param patientId ID del paciente
   */
  getCompleteEMRData(patientId: string): Promise<CompleteEMRData>;
}
