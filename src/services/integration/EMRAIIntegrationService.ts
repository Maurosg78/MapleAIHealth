import { EMRAdapterFactory, EMRSystem, CompleteEMRData, EMRUnstructuredNote } from '../emr';
import { emrConfigService } from '../emr';
import { aiService, AIResponse, UnstructuredNote, ContextType, AIContext } from '../ai';
import { Logger } from '../ai/logger';

/**
 * Servicio de integración entre sistemas EMR y el servicio de IA
 * Facilita la comunicación bidireccional entre ambos componentes
 */
export class EMRAIIntegrationService {
  private static instance: EMRAIIntegrationService;
  private logger: Logger;

  /**
   * Constructor privado para implementar patrón singleton
   */
  private constructor() {
    this.logger = new Logger('EMRAIIntegrationService');
    this.logger.info('EMRAIIntegrationService initialized');
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): EMRAIIntegrationService {
    if (!EMRAIIntegrationService.instance) {
      EMRAIIntegrationService.instance = new EMRAIIntegrationService();
    }
    return EMRAIIntegrationService.instance;
  }

  /**
   * Analiza notas médicas de un paciente usando el servicio de IA
   * @param patientId ID del paciente
   * @param system Sistema EMR a utilizar (opcional, usa el actual por defecto)
   * @returns Respuesta del análisis de IA
   */
  public async analyzePatientNotes(patientId: string, system?: EMRSystem): Promise<AIResponse> {
    const currentSystem = system || emrConfigService.getCurrentSystem();
    this.logger.info('Analyzing patient notes', { patientId, system: currentSystem });

    try {
      // Obtener configuración y adaptador
      const config = emrConfigService.getConfig(currentSystem);
      const adapter = EMRAdapterFactory.getAdapter(currentSystem, config);

      // Verificar conexión
      const connected = await adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Obtener notas del EMR
      const emrNotes = await adapter.getUnstructuredNotes(patientId);
      if (!emrNotes.length) {
        this.logger.warn('No notes found for patient', { patientId });
        return {
          responseId: 'no-notes',
          summary: 'No se encontraron notas médicas para el paciente.',
          processingTime: 0
        };
      }

      // Convertir a formato esperado por el servicio de IA
      const notes = this.convertEMRNotesToAIFormat(emrNotes);

      // Enviar al servicio de IA para análisis
      const aiResponse = await aiService.analyzeUnstructuredNotes(patientId, notes);

      this.logger.info('Analysis completed successfully', {
        patientId,
        insightCount: aiResponse.insights?.length || 0,
        recommendationCount: aiResponse.recommendations?.length || 0
      });

      return aiResponse;
    } catch (error) {
      this.logger.error('Error analyzing patient notes', { error, patientId });
      throw error;
    }
  }

  /**
   * Obtiene análisis completo del historial médico del paciente
   * @param patientId ID del paciente
   * @param system Sistema EMR a utilizar (opcional, usa el actual por defecto)
   * @returns Respuesta del análisis de IA
   */
  public async getPatientCompleteAnalysis(patientId: string, system?: EMRSystem): Promise<AIResponse> {
    const currentSystem = system || emrConfigService.getCurrentSystem();
    this.logger.info('Getting complete patient analysis', { patientId, system: currentSystem });

    try {
      // Obtener configuración y adaptador
      const config = emrConfigService.getConfig(currentSystem);
      const adapter = EMRAdapterFactory.getAdapter(currentSystem, config);

      // Verificar conexión
      const connected = await adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Obtener datos completos del EMR
      const emrData = await adapter.getCompleteEMRData(patientId);

      // Obtener notas no estructuradas
      const emrNotes = emrData.unstructuredNotes || [];

      // Convertir a formato esperado por el servicio de IA
      const notes = this.convertEMRNotesToAIFormat(emrNotes);

      // Preparar contexto con datos del EMR
      const aiContext: AIContext = {
        type: 'emr' as ContextType,
        data: this.convertEMRDataToAIFormat(emrData)
      };

      // Realizar consulta al servicio de IA
      const aiResponse = await aiService.query({
        query: 'Realizar análisis completo del historial médico del paciente, identificar patrones, contradicciones, y generar recomendaciones',
        patientId,
        context: aiContext,
        unstructuredNotes: notes
      });

      this.logger.info('Complete analysis finished', {
        patientId,
        insightCount: aiResponse.insights?.length || 0,
        recommendationCount: aiResponse.recommendations?.length || 0
      });

      return aiResponse;
    } catch (error) {
      this.logger.error('Error getting complete patient analysis', { error, patientId });
      throw error;
    }
  }

  /**
   * Procesa una consulta personalizada sobre datos del paciente
   * @param patientId ID del paciente
   * @param query Consulta específica
   * @param includeMedicalData Si debe incluir datos médicos completos
   * @param system Sistema EMR a utilizar (opcional, usa el actual por defecto)
   * @returns Respuesta de la consulta
   */
  public async executeCustomPatientQuery(
    patientId: string,
    query: string,
    includeMedicalData = true,
    system?: EMRSystem
  ): Promise<AIResponse> {
    const currentSystem = system || emrConfigService.getCurrentSystem();
    this.logger.info('Executing custom patient query', {
      patientId,
      system: currentSystem,
      query: query.substring(0, 50) + '...'
    });

    try {
      // Obtener configuración y adaptador
      const config = emrConfigService.getConfig(currentSystem);
      const adapter = EMRAdapterFactory.getAdapter(currentSystem, config);

      // Verificar conexión
      const connected = await adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Preparar consulta para el servicio de IA
      const aiQuery = {
        query,
        patientId
      };

      // Si se requieren datos médicos completos, obtenerlos y agregarlos a la consulta
      if (includeMedicalData) {
        const emrData = await adapter.getCompleteEMRData(patientId);
        const emrNotes = emrData.unstructuredNotes || [];
        const notes = this.convertEMRNotesToAIFormat(emrNotes);

        // Agregar contexto y notas a la consulta
        Object.assign(aiQuery, {
          context: {
            type: 'emr' as ContextType,
            data: this.convertEMRDataToAIFormat(emrData)
          },
          unstructuredNotes: notes
        });
      }

      // Realizar consulta al servicio de IA
      const aiResponse = await aiService.query(aiQuery);

      this.logger.info('Custom query completed', {
        patientId,
        insightCount: aiResponse.insights?.length || 0,
        recommendationCount: aiResponse.recommendations?.length || 0
      });

      return aiResponse;
    } catch (error) {
      this.logger.error('Error executing custom patient query', { error, patientId, query });
      throw error;
    }
  }

  /**
   * Convierte notas del formato EMR al formato esperado por el servicio de IA
   * @param emrNotes Notas en formato EMR
   * @returns Notas en formato para IA
   */
  private convertEMRNotesToAIFormat(emrNotes: EMRUnstructuredNote[]): UnstructuredNote[] {
    return emrNotes.map(note => ({
      id: note.id,
      date: note.date,
      provider: note.provider,
      content: note.content,
      type: note.type,
      specialty: note.specialty
    }));
  }

  /**
   * Convierte datos completos del EMR al formato esperado por el servicio de IA
   * @param emrData Datos en formato EMR
   * @returns Datos en formato para IA
   */
  private convertEMRDataToAIFormat(emrData: CompleteEMRData): Record<string, unknown> {
    // Los datos ya están en un formato compatible, pero podríamos hacer transformaciones adicionales aquí
    return {
      patientId: emrData.patientId,
      demographics: emrData.demographics,
      medicalHistory: emrData.medicalHistory,
      vitalSigns: emrData.vitalSigns
    };
  }
}

// Exportar la instancia única
export const emrAIIntegrationService = EMRAIIntegrationService.getInstance();
