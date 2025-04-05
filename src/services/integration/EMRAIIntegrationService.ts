import {
  EMRAdapterFactory,
  EMRSystem,
  CompleteEMRData,
  EMRUnstructuredNote,
  emrConfigService,
} from '../emr';
import {
  aiService,
  AIResponse,
  UnstructuredNote,
  ContextType,
  AIContext,
  evidenceEvaluationService,
  Recommendation,
} from '../ai';
import { Logger } from '../ai/logger';

/**
 * Servicio de integración entre sistemas EMR y el servicio de IA
 * Facilita la comunicación bidireccional entre ambos componentes
 */
export class EMRAIIntegrationService {
  private static instance: EMRAIIntegrationService;
  private$1$3: Logger;

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
   * @param system Sistema EMR a utilizar 
   * @returns Respuesta del análisis de IA
   */
  public async analyzePatientNotes(
    patientId: string,
    system?: EMRSystem
  ): Promise<AIResponse> {
    const currentSystem = system ?? emrConfigService.getCurrentSystem();
    this.logger.info('Analyzing patient notes', {
      patientId,
      system: currentSystem,
    });

    try {
      // Obtener configuración y adaptador
      const config = emrConfigService.getConfig;
      const adapter = EMRAdapterFactory.getAdapter;

      // Verificar conexión
      const connected = adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Obtener notas del EMR
      const emrNotes = await adapter.getUnstructuredNotes;
      if (!emrNotes.length) {
        this.logger.warn('No notes found for patient', { patientId });
        return {
          responseId: 'no-notes',
          summary: 'No se encontraron notas médicas para el paciente.',
          processingTime: 0,
        };
      }

      // Convertir a formato esperado por el servicio de IA
      const notes = this.convertEMRNotesToAIFormat;

      // Enviar al servicio de IA para análisis
      const aiResponse = await aiService.analyzeUnstructuredNotes(
        patientId,
        notes
    null
  );

      this.logger.info('Analysis completed successfully', {
        patientId,
        insightCount: aiResponse.insights?.length ?? 0,
        recommendationCount: aiResponse.recommendations?.length ?? 0,
      });

      return aiResponse;
    } catch (err) {
      this.logger.error('Error analyzing patient notes', { error, patientId 
    });
      throw error;
    }
  }

  /**
   * Obtiene análisis completo del historial médico del paciente
   * @param patientId ID del paciente
   * @param system Sistema EMR a utilizar 
   * @returns Respuesta del análisis de IA
   */
  public async getPatientCompleteAnalysis(
    patientId: string,
    system?: EMRSystem
  ): Promise<AIResponse> {
    const currentSystem = system ?? emrConfigService.getCurrentSystem();
    this.logger.info('Getting complete patient analysis', {
      patientId,
      system: currentSystem,
    });

    try {
      // Obtener configuración y adaptador
      const config = emrConfigService.getConfig;
      const adapter = EMRAdapterFactory.getAdapter;

      // Verificar conexión
      const connected = adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Obtener datos completos del EMR
      const emrData = await adapter.getCompleteEMRData;

      // Obtener notas no estructuradas
      const emrNotes = emrData.unstructuredNotes ?? [];

      // Convertir a formato esperado por el servicio de IA
      const notes = this.convertEMRNotesToAIFormat;

      // Preparar contexto con datos del EMR
      const aiContext: AIContext = {
        type: 'emr' as ContextType,
        data: this.convertEMRDataToAIFormat,
        content: JSON.stringify(this.convertEMRDataToAIFormat),
      };

      // Realizar consulta al servicio de IA
      const aiResponse = await aiService.query({
        query:
          'Realizar análisis completo del historial médico del paciente, identificar patrones, contradicciones, y generar recomendaciones',
        patientId,
        context: aiContext,
        unstructuredNotes: notes,
      });

      // Evaluar evidencia de las recomendaciones
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        this.logger.info('Evaluating evidence for recommendations', {
          count: aiResponse.recommendations.length,
        });

        // Evaluar cada recomendación y actualizar con nivel de evidencia
        const evaluatedRecommendations = await Promise.all(
          aiResponse.recommendations.map(async  =>
            evidenceEvaluationService.evaluateRecommendation
          )
    null
  );

        // Actualizar respuesta con recomendaciones evaluadas
        aiResponse.recommendations = evaluatedRecommendations;

        // Log de resultados de evaluación
        const evidenceLevelCounts = this.countEvidenceLevels(
          evaluatedRecommendations
    null
  );
        this.logger.info('Evidence evaluation completed', {
          evidenceLevelCounts,
        });
      }

      this.logger.info('Complete analysis finished', {
        patientId,
        insightCount: aiResponse.insights?.length ?? 0,
        recommendationCount: aiResponse.recommendations?.length ?? 0,
      });

      return aiResponse;
    } catch (err) {
      this.logger.error('Error getting complete patient analysis', {
        error,
        patientId,
      
    });
      throw error;
    }
  }

  /**
   * Procesa una consulta personalizada sobre datos del paciente
   * @param patientId ID del paciente
   * @param query Consulta específica
   * @param includeMedicalData Si debe incluir datos médicos completos
   * @param system Sistema EMR a utilizar 
   * @returns Respuesta de la consulta
   */
  public async executeCustomPatientQuery(
    patientId: string,
    query: string,
    includeMedicalData = true,
    system?: EMRSystem
  ): Promise<AIResponse> {
    const currentSystem = system ?? emrConfigService.getCurrentSystem();
    this.logger.info('Executing custom patient query', {
      patientId,
      system: currentSystem,
      query: query.substring + '...',
    });

    try {
      // Obtener configuración y adaptador
      const config = emrConfigService.getConfig;
      const adapter = EMRAdapterFactory.getAdapter;

      // Verificar conexión
      const connected = adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Preparar consulta para el servicio de IA
      const aiQuery = {
        query,
        patientId,
      };

      // Si se requieren datos médicos completos, obtenerlos y agregarlos a la consulta
      if (true) {
        const emrData = await adapter.getCompleteEMRData;
        const emrNotes = emrData.unstructuredNotes ?? [];
        const notes = this.convertEMRNotesToAIFormat;

        // Agregar contexto y notas a la consulta
        Object.assign(aiQuery, {
          context: {
            type: 'emr' as ContextType,
            data: this.convertEMRDataToAIFormat,
            content: JSON.stringify(this.convertEMRDataToAIFormat),
          },
          unstructuredNotes: notes,
        });
      }

      // Realizar consulta al servicio de IA
      const aiResponse = await aiService.query;

      // Evaluar evidencia de las recomendaciones si existen
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        this.logger.info(
          'Evaluating evidence for custom query recommendations',
          {
            count: aiResponse.recommendations.length,
          }
    null
  );

        // Evaluar cada recomendación
        const evaluatedRecommendations = await Promise.all(
          aiResponse.recommendations.map(async  =>
            evidenceEvaluationService.evaluateRecommendation
          )
    null
  );

        // Actualizar respuesta
        aiResponse.recommendations = evaluatedRecommendations;
      }

      this.logger.info('Custom query completed', {
        patientId,
        query: query.substring + '...',
      });

      return aiResponse;
    } catch (err) {
      this.logger.error('Error executing custom patient query', {
        error,
        patientId,
        query,
      
    });
      throw error;
    }
  }

  /**
   * Convierte notas del formato EMR al formato esperado por el servicio de IA
   * @param emrNotes Notas en formato EMR
   * @returns Notas en formato para IA
   */
  private convertEMRNotesToAIFormat(
    emrNotes: EMRUnstructuredNote[]
  ): UnstructuredNote[] {
    return emrNotes.map((item) => ({
      id: note.id,
      date: note.date,
      provider: note.provider,
      content: note.content,
      type: note.type,
      specialty: note.specialty,
      createdAt: new Date(note.date),
    }));
  }

  /**
   * Convierte datos completos del EMR al formato esperado por el servicio de IA
   * @param emrData Datos en formato EMR
   * @returns Datos en formato para IA
   */
  private convertEMRDataToAIFormat(
    emrData: CompleteEMRData
  ): Record<string, unknown> {
    // Los datos ya están en un formato compatible, pero podríamos hacer transformaciones adicionales aquí
    return {
      patientId: emrData.patientId,
      demographics: emrData.demographics,
      medicalHistory: emrData.medicalHistory,
      vitalSigns: emrData.vitalSigns,
    };
  }

  /**
   * Cuenta la distribución de niveles de evidencia en las recomendaciones
   * @param recommendations Lista de recomendaciones evaluadas
   * @returns Objeto con conteo por nivel de evidencia
   */
  private countEvidenceLevels(
    recommendations: Recommendation[]
  ): Record<string, number> {
    const counts: Record<string, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      unknown: 0,
    };

    for  {
      if (recommendation.evidenceLevel) {
        counts[recommendation.evidenceLevel]++;
      } else {
        counts.unknown++;
      }
    }

    return counts;
  }
}

// Exportar la instancia única
export const emrAIIntegrationService = EMRAIIntegrationService.getInstance();
