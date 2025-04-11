import { EMRAdapter } from '../EMRAdapter';
import { PatientData, EMRUnstructuredNote, CompleteEMRData } from '../types';
import { EMRAdapterConfig } from '../EMRAdapterFactory';
import { GenericEMRAdapter } from './GenericEMRAdapter';

/**
 * Adaptador para el sistema EMR EPIC
 * Extiende el adaptador genérico pero implementa métodos específicos
 */

import logger from '../../../services/logger';
export class EPICAdapter extends GenericEMRAdapter implements EMRAdapter {
  constructor(config: EMRAdapterConfig) {
    super(config);
    // Configuración específica para EPIC
    this.validateEPICConfig(config);
  }

  /**
   * Valida que la configuración tenga los parámetros necesarios para EPIC
   * @param config Configuración del adaptador
   */
  private validateEPICConfig(config: EMRAdapterConfig): void {
    if (!config.apiKey) {
      console.warn(
        'EPIC Adapter: apiKey no especificada, algunas funciones podrían no estar disponibles'
      );
    }
    if (!config.baseUrl) {
      console.warn(
        'EPIC Adapter: baseUrl no especificada, usando valor por defecto'
      );
    }
  }

  /**
   * Verifica si la conexión con EPIC está activa
   * Implementación específica para EPIC
   */
  async testConnection(): Promise<boolean> {
    // Aquí iría la implementación real para verificar la conexión con EPIC
    // Por ahora simulamos que la conexión es exitosa
    logger.debug('Verificando conexión con EPIC en:', { url: this.config.baseUrl });

    return true;
  }

  /**
   * Obtiene datos del paciente desde EPIC
   * Implementación específica para EPIC
   * @param patientId ID del paciente en EPIC
   */
  async getPatientData(patientId: string): Promise<PatientData> {
    // Aquí iría la implementación real para obtener datos del paciente desde EPIC
    // Por ahora usamos datos simulados pero con formato específico de EPIC
    logger.debug('Obteniendo datos del paciente desde EPIC:', { patientId });

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
   * Obtiene notas médicas no estructuradas desde EPIC
   * Implementación específica para EPIC
   * @param patientId ID del paciente
   * @param limit Límite de resultados
   */
  async getUnstructuredNotes(
    patientId: string,
    limit = 10
  ): Promise<EMRUnstructuredNote[]> {
    // Aquí iría la implementación real para obtener notas médicas desde EPIC
    // Por ahora usamos datos simulados pero con formato específico de EPIC
    logger.debug('Obteniendo notas médicas desde EPIC:', { patientId });

    // Simulamos un retraso de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Notas en formato EPIC
    const notes: EMRUnstructuredNote[] = [
      {
        id: 'E-N3001',
        patientId,
        date: '2023-05-10',
        provider: 'Dr. García',
        content:
          '[EPIC] Paciente masculino de 45 años acude por dolor en región lumbar de 2 semanas de evolución. Refiere que empeora con el movimiento y mejora parcialmente con antiinflamatorios. No refiere traumatismo previo. Examen físico: dolor a la palpación de musculatura paravertebral lumbar, sin signos radiculares. Diagnóstico presuntivo: lumbalgia mecánica. Plan: reposo relativo, ibuprofeno 400mg cada 8 horas por 5 días, control en 10 días.',
        type: 'consultation',
        createdAt: new Date(),
        consultationId: 'E-C1001',
        specialty: 'Medicina General',
      },
      {
        id: 'E-N3002',
        patientId,
        date: '2023-06-15',
        provider: 'Dr. García',
        content:
          '[EPIC] Paciente en control por lumbalgia. Refiere mejoría significativa del dolor. Mantiene episodios ocasionales de molestia leve con esfuerzos. Examen físico: sin dolor a la palpación, movilidad conservada. Plan: mantener ejercicios de fortalecimiento lumbar, usar analgésicos solo si necesario, control en 1 mes.',
        type: 'consultation',
        createdAt: new Date(),
        consultationId: 'E-C1002',
        specialty: 'Medicina General',
      },
      {
        id: 'E-N3003',
        patientId,
        date: '2023-07-20',
        provider: 'Dr. Ramírez',
        content:
          '[EPIC] Paciente acude a evaluación por especialista traumatólogo. Refiere dolor ocasional en región lumbar. Se solicita resonancia magnética para descartar patología discal.',
        type: 'consultation',
        consultationId: 'E-C1003',
        createdAt: new Date(),
        specialty: 'Traumatología',
      },
    ];

    return notes.slice(0, limit);
  }

  /**
   * Obtiene datos completos del EMR específicamente desde EPIC
   * @param patientId ID del paciente
   */
  async getCompleteEMRData(patientId: string): Promise<CompleteEMRData> {
    // Para EPIC, podríamos tener una implementación específica que combine
    // todos los datos necesarios de manera eficiente en una sola consulta
    logger.debug('Obteniendo datos completos desde EPIC:', { patientId });

    // Simulamos un retraso de red para una consulta grande
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulamos una respuesta específica de EPIC con algunos datos particulares
    const baseData = await super.getCompleteEMRData(patientId);

    // Agregar información específica que solo está disponible en EPIC
    // En este caso simulado agregamos un resultado de laboratorio adicional
    if (baseData.medicalHistory.labResults) {
      baseData.medicalHistory.labResults.push({
        name: 'Resonancia Magnética Lumbar',
        date: '2023-07-25',
        value: 'Protrusión discal L4-L5 sin compresión radicular',
        unit: '',
        isAbnormal: true,
      });
    }

    return baseData;
  }
}
