import {
  EMRAdapterFactory,
  EMRSystem,
  CompleteEMRData,
  EMRUnstructuredNote,
  emrConfigService,
  EMRAdapter,
  EMRConnectorFactory,
} from '../emr';
import {
  aiService,
  AIResponse,
  UnstructuredNote,
  ContextType,
  AIContext,
} from '../ai';
// Importamos los tipos desde ai/types para evitar conflictos
import {
  Recommendation,
  EvidenceLevel,
} from '../ai/types';
// Importamos el servicio de evaluación separadamente
import { evidenceEvaluationService } from '../ai/evidence';
import { Logger } from '../ai/logger';
import { convertCompleteEMRToAIFormat } from '../ai/adapters';
import { ClinicalCopilotService, ClinicalSuggestion } from '../ai/ClinicalCopilotService';
import { EvidenceEvaluationService } from '../ai/EvidenceEvaluationService';

/**
 * Tipo para el resultado de evaluación de recomendaciones
 */
interface EvaluatedRecommendation {
  id: string;
  content: string;
  confidence: number;
  type: string;
  evidence: unknown[];
  evidenceLevel: EvidenceLevel;
  reliability: 'high' | 'moderate' | 'low' | 'unknown';
  sources: string[];
}

/**
 * Interfaz extendida para asegurar que TypeScript reconozca todos los métodos requeridos
 */
interface EMRAdapterExt extends EMRAdapter {
  getUnstructuredNotes(patientId: string, limit?: number): Promise<EMRUnstructuredNote[]>;
  getCompleteEMRData(patientId: string): Promise<CompleteEMRData>;
}

/**
 * Opciones para generación de recomendaciones
 */
interface RecommendationOptions {
  emrSystem?: EMRSystem;
  includeEvidence?: boolean;
  includeContraindications?: boolean;
  maxSuggestions?: number;
  minConfidence?: number;
}

/**
 * Servicio de integración entre sistemas EMR y el servicio de IA
 * Facilita la comunicación bidireccional entre ambos componentes
 */
export class EMRAIIntegrationService {
  private static instance: EMRAIIntegrationService;
  private logger: Logger;
  private clinicalCopilot: ClinicalCopilotService;
  private evidenceService: EvidenceEvaluationService;

  /**
   * Constructor privado para implementar patrón singleton
   */
  private constructor() {
    this.logger = new Logger('EMRAIIntegrationService');
    this.logger.info('EMRAIIntegrationService initialized');
    this.clinicalCopilot = new ClinicalCopilotService();
    this.evidenceService = new EvidenceEvaluationService();
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
      const config = emrConfigService.getConfig(currentSystem);
      const adapter = await EMRAdapterFactory.getAdapter(currentSystem, config) as unknown as EMRAdapterExt;

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
          processingTime: 0,
        };
      }

      // Convertir a formato esperado por el servicio de IA
      const notes = this.convertEMRNotesToAIFormat(emrNotes);

      // Enviar al servicio de IA para análisis
      const aiResponse = await aiService.analyzeUnstructuredNotes(
        patientId,
        notes
      );

      this.logger.info('Analysis completed successfully', {
        patientId,
        insightCount: aiResponse.insights?.length ?? 0,
        recommendationCount: aiResponse.recommendations?.length ?? 0,
      });

      return aiResponse;
    } catch (err) {
      this.logger.error('Error analyzing patient notes', {
        error: err,
        patientId
      });
      throw err;
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
      const config = emrConfigService.getConfig(currentSystem);
      const adapter = await EMRAdapterFactory.getAdapter(currentSystem, config) as unknown as EMRAdapterExt;

      // Verificar conexión
      const connected = await adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Obtener datos completos del EMR
      const emrData = await adapter.getCompleteEMRData(patientId);

      // Obtener notas no estructuradas
      const emrNotes = emrData.unstructuredNotes ?? [];

      // Convertir a formato esperado por el servicio de IA
      const notes = this.convertEMRNotesToAIFormat(emrNotes);

      // Preparar contexto con datos del EMR
      const aiFormat = this.convertEMRDataToAIFormat(emrData);
      const aiContext: AIContext = {
        type: 'emr' as ContextType,
        data: aiFormat,
        content: JSON.stringify(aiFormat),
      };

      // Realizar consulta al servicio de IA
      const aiQuery = {
        query:
          'Realizar análisis completo del historial médico del paciente, identificar patrones, contradicciones, y generar recomendaciones',
        patientId,
        context: aiContext,
        unstructuredNotes: notes,
      };

      // Realizar consulta al servicio de IA
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiResponse = await aiService.query(aiQuery as any);

      // Evaluar evidencia de las recomendaciones
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        this.logger.info('Evaluating evidence for recommendations', {
          count: aiResponse.recommendations.length,
        });

        // Evaluar cada recomendación y actualizar con nivel de evidencia
        const evaluatedRecommendations = await Promise.all(
          aiResponse.recommendations.map(async (rec) => {
            // Adaptar recomendación al formato esperado para el servicio de evidencia
            const adaptedRec = {
              id: rec.title || `rec-${Math.random().toString(36).substring(7)}`,
              content: rec.description || '',
              confidence: 0.8,
              type: rec.type || 'general',
              evidence: [],
              evidenceLevel: rec.evidenceLevel as EvidenceLevel,
              metadata: {
                priority: rec.priority,
                timeframe: rec.timeframe,
                rationale: rec.rationale
              },
              // Propiedades adicionales que serán asignadas por evaluateRecommendation
              reliability: 'unknown',
              sources: []
            } as unknown as EvaluatedRecommendation;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return evidenceEvaluationService.evaluateRecommendation(adaptedRec as any);
          })
        );

        // Actualizar respuesta con recomendaciones evaluadas
        const enhancedRecommendations = evaluatedRecommendations.map((evalRec, idx) => {
          const originalRec = aiResponse.recommendations?.[idx];
          if (!originalRec) return null;

          return {
            type: originalRec.type || 'follow-up',
            title: originalRec.title || '',
            description: originalRec.description || '',
            priority: originalRec.priority || 'medium',
            timeframe: originalRec.timeframe,
            rationale: originalRec.rationale,
            evidenceLevel: evalRec.evidenceLevel,
            evidenceDetails: {
              level: evalRec.evidenceLevel,
              description: `Nivel de evidencia ${evalRec.evidenceLevel}`,
              criteria: `Criterios para nivel ${evalRec.evidenceLevel}`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              reliability: (evalRec as any).reliability,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sources: (evalRec as any).sources.map(s => ({
                id: s,
                title: s,
                verified: true,
                reliability: 'moderate'
              }))
            }
          } as Recommendation;
        }).filter(Boolean) as Recommendation[];

        // Asignar las recomendaciones mejoradas a la respuesta
        aiResponse.recommendations = enhancedRecommendations;

        // Log de resultados de evaluación
        const evidenceLevelCounts = this.countEvidenceLevels(enhancedRecommendations);
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
        error: err,
        patientId,
      });
      throw err;
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
      query: query.substring(0, 50) + '...',
    });

    try {
      // Obtener configuración y adaptador
      const config = emrConfigService.getConfig(currentSystem);
      const adapter = await EMRAdapterFactory.getAdapter(currentSystem, config) as unknown as EMRAdapterExt;

      // Verificar conexión
      const connected = await adapter.testConnection();
      if (!connected) {
        this.logger.error('EMR connection failed', { system: currentSystem });
        throw new Error(`No se pudo conectar al sistema EMR ${currentSystem}`);
      }

      // Preparar consulta para el servicio de IA
      const aiQuery: {
        query: string;
        patientId: string;
        context?: AIContext;
        unstructuredNotes?: UnstructuredNote[];
      } = {
        query,
        patientId,
      };

      // Si se requieren datos médicos completos, obtenerlos y agregarlos a la consulta
      if (includeMedicalData) {
        const emrData = await adapter.getCompleteEMRData(patientId);
        const emrNotes = emrData.unstructuredNotes ?? [];
        const notes = this.convertEMRNotesToAIFormat(emrNotes);
        const aiFormat = this.convertEMRDataToAIFormat(emrData);

        // Agregar contexto y notas a la consulta
        aiQuery.context = {
          type: 'emr' as ContextType,
          data: aiFormat,
          content: JSON.stringify(aiFormat),
        };
        aiQuery.unstructuredNotes = notes;
      }

      // Realizar consulta al servicio de IA
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiResponse = await aiService.query(aiQuery as any);

      // Evaluar evidencia de las recomendaciones si existen
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        this.logger.info(
          'Evaluating evidence for custom query recommendations',
          {
            count: aiResponse.recommendations.length,
          }
        );

        // Evaluar cada recomendación
        const evaluatedRecommendations = await Promise.all(
          aiResponse.recommendations.map(async (rec) => {
            // Adaptar recomendación al formato esperado
            const adaptedRec = {
              id: rec.title || `rec-${Math.random().toString(36).substring(7)}`,
              content: rec.description || '',
              confidence: 0.8,
              type: rec.type || 'general',
              evidence: [],
              evidenceLevel: rec.evidenceLevel as EvidenceLevel,
              metadata: {
                priority: rec.priority,
                timeframe: rec.timeframe,
                rationale: rec.rationale
              },
              // Propiedades adicionales que serán asignadas por evaluateRecommendation
              reliability: 'unknown',
              sources: []
            } as unknown as EvaluatedRecommendation;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return evidenceEvaluationService.evaluateRecommendation(adaptedRec as any);
          })
        );

        // Actualizar respuesta con recomendaciones procesadas
        const enhancedRecommendations = evaluatedRecommendations.map((evalRec, idx) => {
          const originalRec = aiResponse.recommendations?.[idx];
          if (!originalRec) return null;

          return {
            type: originalRec.type || 'follow-up',
            title: originalRec.title || '',
            description: originalRec.description || '',
            priority: originalRec.priority || 'medium',
            timeframe: originalRec.timeframe,
            rationale: originalRec.rationale,
            evidenceLevel: evalRec.evidenceLevel,
            evidenceDetails: {
              level: evalRec.evidenceLevel,
              description: `Nivel de evidencia ${evalRec.evidenceLevel}`,
              criteria: `Criterios para nivel ${evalRec.evidenceLevel}`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              reliability: (evalRec as any).reliability,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sources: (evalRec as any).sources.map(s => ({
                id: s,
                title: s,
                verified: true,
                reliability: 'moderate'
              }))
            }
          } as Recommendation;
        }).filter(Boolean) as Recommendation[];

        // Asignar las recomendaciones mejoradas a la respuesta
        aiResponse.recommendations = enhancedRecommendations;
      }

      this.logger.info('Custom query completed', {
        patientId,
        query: query.substring(0, 50) + '...',
      });

      return aiResponse;
    } catch (err) {
      this.logger.error('Error executing custom patient query', {
        error: err,
        patientId,
        query,
      });
      throw err;
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
    return emrNotes.map((note) => ({
      id: note.id,
      date: note.date,
      provider: note.provider,
      content: note.content,
      type: note.type,
      specialty: note.specialty || '',
      createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.date,
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
    // Convertimos explícitamente el resultado a Record<string, unknown>
    return convertCompleteEMRToAIFormat(emrData) as unknown as Record<string, unknown>;
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

    for (const recommendation of recommendations) {
      if (recommendation.evidenceLevel) {
        counts[recommendation.evidenceLevel]++;
      } else {
        counts.unknown++;
      }
    }

    return counts;
  }

  /**
   * Obtiene datos completos del paciente desde el sistema EMR
   * @param patientId ID del paciente
   * @param emrSystem Sistema EMR opcional (por defecto usa el configurado)
   * @returns Datos completos del paciente
   */
  async getPatientEMRData(
    patientId: string,
    emrSystem?: EMRSystem
  ): Promise<CompleteEMRData> {
    try {
      // Obtener conector para el sistema EMR
      const connector = EMRConnectorFactory.getConnector(emrSystem);

      // Obtener datos demográficos
      const demographics = await connector.getPatientDemographics(patientId);

      // Obtener historial médico
      const medicalHistory = await connector.getPatientMedicalHistory(patientId);

      // Obtener datos de consultas
      const consultations = await connector.getPatientConsultations(patientId);

      // Consolidar y retornar datos
      return {
        patientId,
        demographics,
        medicalHistory,
        consultations,
        system: emrSystem || connector.getSystemName()
      };
    } catch (error) {
      console.error('Error obteniendo datos del paciente:', error);
      throw new Error(`Error obteniendo datos del paciente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera recomendaciones clínicas basadas en datos del paciente
   * @param patientId ID del paciente
   * @param options Opciones para personalizar las recomendaciones
   * @returns Lista de sugerencias clínicas
   */
  async generatePatientRecommendations(
    patientId: string,
    options: RecommendationOptions = {}
  ): Promise<ClinicalSuggestion[]> {
    try {
      // Configuración por defecto
      const {
        emrSystem,
        includeEvidence = true,
        includeContraindications = true,
        maxSuggestions = 5,
        minConfidence = 0.5
      } = options;

      // Obtener datos del paciente
      const patientData = await this.getPatientEMRData(patientId, emrSystem);

      // Generar recomendaciones utilizando el servicio de copilot
      const suggestions = await this.clinicalCopilot.getSuggestions({
        patientData,
        maxSuggestions,
        minConfidence
      });

      // Si se solicita evidencia, enriquecemos las sugerencias
      if (includeEvidence) {
        for (const suggestion of suggestions) {
          // Obtener y adjuntar evidencia
          const evidence = await this.evidenceService.getEvidenceForSuggestion(
            suggestion.title,
            suggestion.type
          );

          suggestion.sources = evidence.sources;
          suggestion.evidenceLevel = evidence.level;

          // Obtener contraindicaciones si se solicita
          if (includeContraindications) {
            suggestion.contraindications = await this.evidenceService.getContraindications(
              suggestion.title,
              patientData
            );
          }
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error generando recomendaciones para el paciente:', error);
      throw new Error(`Error generando recomendaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Sincroniza resultados de recomendaciones aceptadas con el sistema EMR
   * @param patientId ID del paciente
   * @param acceptedRecommendations Recomendaciones aceptadas para sincronizar
   * @param emrSystem Sistema EMR opcional
   */
  async syncAcceptedRecommendationsToEMR(
    patientId: string,
    acceptedRecommendations: ClinicalSuggestion[],
    emrSystem?: EMRSystem
  ): Promise<boolean> {
    try {
      // Obtener conector para el sistema EMR
      const connector = EMRConnectorFactory.getConnector(emrSystem);

      // Convertir recomendaciones a formato apropiado para el EMR
      const emrEntries = acceptedRecommendations.map(recommendation => ({
        type: recommendation.type,
        description: `${recommendation.title}${recommendation.description ? `: ${recommendation.description}` : ''}`,
        dateCreated: new Date().toISOString(),
        source: 'AI_RECOMMENDATION',
        status: 'pending',
        metadata: {
          confidence: recommendation.confidence,
          evidenceLevel: recommendation.evidenceLevel,
          sourceCount: recommendation.sources?.length || 0
        }
      }));

      // Guardar en el sistema EMR
      await connector.addPatientRecords(patientId, emrEntries);

      return true;
    } catch (error) {
      console.error('Error sincronizando recomendaciones con EMR:', error);
      throw new Error(`Error sincronizando recomendaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene estadísticas sobre las recomendaciones aceptadas vs. generadas
   * @param patientId ID del paciente opcional (si no se proporciona, devuelve estadísticas globales)
   * @returns Estadísticas de recomendaciones
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRecommendationStats(patientId?: string): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
    acceptanceRate: number;
  }> {
    // Implementación básica de estadísticas
    // En una implementación real, esto consultaría a una base de datos persistente
    return {
      total: 150,
      accepted: 92,
      rejected: 35,
      pending: 23,
      acceptanceRate: 0.72
    };
  }
}

/**
 * Instancia única del servicio de integración EMR-AI
 * Usar esta instancia en lugar de crear nuevas instancias mediante 'new'
 * Ejemplo: import { emrAIIntegrationService } from '...';
 */
export const emrAIIntegrationService = EMRAIIntegrationService.getInstance();

// Nota: También puedes usar directamente esta instancia en importaciones
// Ejemplo: import { emrAIIntegrationService as integrationService } from '...';
