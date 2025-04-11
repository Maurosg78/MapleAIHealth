import { EMRAdapter } from '../EMRAdapter';
import { PatientData, EMRUnstructuredNote, CompleteEMRData } from '../types';
import { EMRAdapterConfig } from '../EMRAdapterFactory';
import { GenericEMRAdapter } from './GenericEMRAdapter';

/**
 * Adaptador para el sistema EMR OSCAR
 * Extiende el adaptador genérico pero puede implementar métodos específicos
 */

import logger from '../../../services/logger';
export class OSCARAdapter extends GenericEMRAdapter implements EMRAdapter {
  constructor(config: EMRAdapterConfig) {
    super(config);
    // Configuración específica para OSCAR
    this.validateOSCARConfig(config);
  }

  /**
   * Valida que la configuración tenga los parámetros necesarios para OSCAR
   * @param config Configuración del adaptador
   */
  private validateOSCARConfig(config: EMRAdapterConfig): void {
    if (!config.baseUrl) {
      console.warn(
        'OSCAR Adapter: baseUrl no especificada, usando valor por defecto'
      );
    }
  }

  /**
   * Verifica si la conexión con OSCAR está activa
   * Implementación específica para OSCAR
   */
  async testConnection(): Promise<boolean> {
    // Aquí iría la implementación real para verificar la conexión con OSCAR
    // Por ahora simulamos que la conexión es exitosa
    logger.debug('Verificando conexión con OSCAR en:', { url: this.config.baseUrl });

    return true;
  }

  /**
   * Obtiene datos del paciente desde OSCAR
   * Implementación específica para OSCAR
   * @param patientId ID del paciente en OSCAR
   */
  async getPatientData(patientId: string): Promise<PatientData> {
    // Aquí iría la implementación real para obtener datos del paciente desde OSCAR
    // Por ahora usamos datos simulados pero con formato específico de OSCAR
    logger.debug('Obteniendo datos del paciente desde OSCAR:', { patientId });

    // Simulamos un retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      id: patientId,
      firstName: 'Juan',
      lastName: 'Ejemplo',
      dateOfBirth: '1978-05-15',
      gender: 'male',
      email: 'juan.ejemplo@example.com',
      phone: '+56 9 1234 5678',
      address: 'Av. Ejemplo 123, Santiago, Chile',
    };
  }

  /**
   * Obtiene notas médicas no estructuradas desde OSCAR
   * Implementación específica para OSCAR
   * @param patientId ID del paciente
   * @param limit Límite de resultados
   */
  async getUnstructuredNotes(
    patientId: string,
    limit = 10
  ): Promise<EMRUnstructuredNote[]> {
    // Aquí iría la implementación real para obtener notas médicas desde OSCAR
    // Por ahora usamos datos simulados pero con formato específico de OSCAR
    logger.debug('Obteniendo notas médicas desde OSCAR:', { patientId });

    // Simulamos un retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Notas en formato OSCAR
    const notes: EMRUnstructuredNote[] = [
      {
        id: 'O-N3001',
        patientId,
        date: '2023-05-10',
        provider: 'Dr. García',
        content:
          '[OSCAR] Paciente masculino de 45 años acude por dolor en región lumbar de 2 semanas de evolución. Refiere que empeora con el movimiento y mejora parcialmente con antiinflamatorios. No refiere traumatismo previo. Examen físico: dolor a la palpación de musculatura paravertebral lumbar, sin signos radiculares. Diagnóstico presuntivo: lumbalgia mecánica. Plan: reposo relativo, ibuprofeno 400mg cada 8 horas por 5 días, control en 10 días.',
        type: 'consultation',
        createdAt: new Date(),
        consultationId: 'O-C1001',
        specialty: 'Medicina General',
      },
      {
        id: 'O-N3002',
        patientId,
        date: '2023-06-15',
        provider: 'Dr. García',
        content:
          '[OSCAR] Paciente en control por lumbalgia. Refiere mejoría significativa del dolor. Mantiene episodios ocasionales de molestia leve con esfuerzos. Examen físico: sin dolor a la palpación, movilidad conservada. Plan: mantener ejercicios de fortalecimiento lumbar, usar analgésicos solo si necesario, control en 1 mes.',
        type: 'consultation',
        createdAt: new Date(),
        consultationId: 'O-C1002',
        specialty: 'Medicina General',
      },
    ];

    return notes.slice(0, limit);
  }

  /**
   * Obtiene datos completos del EMR específicamente desde OSCAR
   * @param patientId ID del paciente
   */
  async getCompleteEMRData(patientId: string): Promise<CompleteEMRData> {
    // Para OSCAR, podríamos tener una implementación específica que combine
    // todos los datos necesarios de manera eficiente en una sola consulta
    logger.debug('Obteniendo datos completos desde OSCAR:', { patientId });

    // Simulamos un retraso de red para una consulta grande
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Para esta implementación simulada, usamos la implementación del padre
    // pero en un caso real haríamos una consulta específica de OSCAR
    return super.getCompleteEMRData(patientId);
  }
}
