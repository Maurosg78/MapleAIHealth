/**
import { HttpService } from "../../../lib/api"; * Interfaz para adaptadores de sistemas EMR
 * Permite la integración con diferentes sistemas de historial médico electrónico
 */
export interface EMRAdapterInterface {
  /**
   * Nombre del sistema EMR
   */
  readonly systemName: string;

  /**
   * Versión de la API que se está utilizando
   */
  readonly apiVersion: string;

  /**
   * Obtiene los datos completos del EMR para un paciente
   * @param patientId Identificador único del paciente
   */
  getPatientEMR(patientId: string): Promise<EMRData>;

  /**
   * Obtiene las notas clínicas recientes para un paciente
   * @param patientId Identificador único del paciente
   * @param limit Número máximo de notas a recuperar
   * @param days Número de días hacia atrás para buscar
   */
  getRecentNotes(
    patientId: string,
    limit?: number,
    days?: number
  ): Promise<UnstructuredNote[]>;

  /**
   * Actualiza el EMR con nuevas notas, tratamientos o seguimientos
   * @param patientId Identificador único del paciente
   * @param data Datos a actualizar en el EMR
   */
  updatePatientRecord(
    patientId: string,
    data: Partial<EMRData>
  ): Promise<boolean>;

  /**
   * Sincroniza los tratamientos sugeridos con el sistema EMR
   * @param patientId Identificador único del paciente
   * @param treatments Tratamientos recomendados por IA
   */
  syncTreatments(
    patientId: string,
    treatments: Array<{
      name: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
      notes?: string;
      evidenceLevel?: 'alto' | 'moderado' | 'bajo';
      evidenceSource?: string;
    }>
  ): Promise<boolean>;

  /**
   * Obtiene el historial de interacciones del profesional con el paciente
   * @param patientId Identificador único del paciente
   * @param providerId Identificador del profesional de salud
   */
  getInteractionHistory(
    patientId: string,
    providerId: string
  ): Promise<
    Array<{
      date: string;
      type: string;
      summary: string;
      aiAssisted: boolean;
    }>
  >;
}
