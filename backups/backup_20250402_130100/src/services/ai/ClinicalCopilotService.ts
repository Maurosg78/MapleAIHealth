import { AIService, AIServiceError } from './aiService';
import {
  ConsultationContext,
  ConsultationStage,
  EnhancedAIQuery,
  EnhancedAIResponse,
  EvidenceLevel,
  SuggestedQuestion,
  TreatmentSuggestion,
} from './types';
import { cacheService } from './cacheService';
import { Logger } from '../../lib/logger';

/**
 * Respuesta de sugerencias de consulta
 */
export interface ConsultationSuggestion {
  questions: SuggestedQuestion[];
  treatments: TreatmentSuggestion[];
  nextSteps: string[];
  educationalContent?: {
    forPatient?: string;
    forProvider?: string;
    resources?: Array<{ title: string; url: string }>;
  };
  followUpRecommendation?: string;
}

/**
 * ClinicalCopilotService
 *
 * Servicio especializado que actúa como copiloto clínico para profesionales de la salud,
 * proporcionando asistencia contextual durante las consultas médicas.
 */
export class ClinicalCopilotService {
  private static instance: ClinicalCopilotService;
  private readonly aiService: AIService;
  private readonly logger: Logger;
  private readonly activeConsultations: Map<string, ConsultationContext>;

  private constructor() {
    this.aiService = AIService.getInstance();
    this.logger = new Logger('ClinicalCopilotService');
    this.activeConsultations = new Map();
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): ClinicalCopilotService {
    if (!ClinicalCopilotService.instance) {
      ClinicalCopilotService.instance = new ClinicalCopilotService();
    }
    return ClinicalCopilotService.instance;
  }

  /**
   * Inicia una nueva consulta
   */
  public startConsultation(
    patientId: string,
    providerId: string,
    specialtyArea: string,
    reasonForVisit: string,
    isFirstVisit: boolean
  ): string {
    const consultationId = `${patientId}-${providerId}-${Date.now()}`;

    const context: ConsultationContext = {
      patientId,
      providerId,
      specialtyArea,
      reasonForVisit,
      isFirstVisit,
      stage: 'anamnesis',
      timeElapsed: 0,
    };

    this.activeConsultations.set(consultationId, context);
    this.logger.info('Consulta iniciada', { consultationId, patientId });

    return consultationId;
  }

  /**
   * Obtiene sugerencias basadas en el input del médico y el contexto actual
   */
  public async getSuggestions(
    consultationId: string,
    currentInput: string,
    evidenceLevel: EvidenceLevel = 'alto'
  ): Promise<ConsultationSuggestion> {
    const context = this.activeConsultations.get(consultationId);

    if (!context) {
      throw new Error(`Consulta no encontrada: ${consultationId}`);
    }

    try {
      // Construir query para el servicio AI
      const query: EnhancedAIQuery = {
        query: currentInput,
        patientId: context.patientId,
        consultationContext: {
          patientId: context.patientId,
          providerId: context.providerId,
          specialtyArea: context.specialtyArea,
          reasonForVisit: context.reasonForVisit,
          isFirstVisit: context.isFirstVisit,
          stage: context.stage,
          timeElapsed: context.timeElapsed,
        },
        requiresQuestionSuggestions: true,
        requiresTreatmentSuggestions: context.stage === 'plan-tratamiento',
        requiresEducationalContent:
          context.stage === 'educacion-paciente' ||
          context.stage === 'plan-tratamiento',
        evidenceLevelThreshold: evidenceLevel,
      };

      // Obtener cache primero
      const cacheKey = `copilot-${consultationId}-${context.stage}-${currentInput.substring(0, 50)}`;
      const cachedResponse = await cacheService.get(cacheKey);

      if (cachedResponse) {
        this.logger.debug('Respuesta encontrada en caché', { consultationId });
        return this.formatResponse(cachedResponse as EnhancedAIResponse);
      }

      // Obtener respuesta de IA
      const response = (await this.aiService.query(
        query
      )) as EnhancedAIResponse;

      // Guardar en caché
      await cacheService.set(cacheKey, response, {
        provider: 'clinical-copilot',
        cost: this.aiService.estimateCost('gpt-4-medical', 1),
        processingTime: 0,
      });

      return this.formatResponse(response);
    } catch (error) {
      this.logger.error('Error obteniendo sugerencias', {
        error,
        consultationId,
      });
      throw new AIServiceError(
        'Error al generar sugerencias para la consulta',
        error as Error
      );
    }
  }

  /**
   * Actualiza la etapa actual de la consulta
   */
  public updateConsultationStage(
    consultationId: string,
    newStage: ConsultationStage
  ): boolean {
    const context = this.activeConsultations.get(consultationId);

    if (!context) {
      throw new Error(`Consulta no encontrada: ${consultationId}`);
    }

    context.stage = newStage;
    this.activeConsultations.set(consultationId, context);

    this.logger.info('Etapa de consulta actualizada', {
      consultationId,
      previousStage: context.stage,
      newStage,
    });

    return true;
  }

  /**
   * Finaliza la consulta actual
   */
  public endConsultation(consultationId: string, summary?: string): boolean {
    const context = this.activeConsultations.get(consultationId);

    if (!context) {
      return false;
    }

    this.activeConsultations.delete(consultationId);

    this.logger.info('Consulta finalizada', {
      consultationId,
      patientId: context.patientId,
      duration: context.timeElapsed,
      summary: summary ?? 'No summary provided',
    });

    return true;
  }

  /**
   * Formatea la respuesta de la IA en formato de sugerencias
   */
  private formatResponse(response: EnhancedAIResponse): ConsultationSuggestion {
    return {
      questions: response.suggestedQuestions || [],
      treatments: response.treatmentSuggestions || [],
      nextSteps: response.nextSteps || [],
      educationalContent: response.educationalContent,
      followUpRecommendation: response.insights?.find(
        (i) => i.type === 'missing-follow-up'
      )?.recommendation,
    };
  }
}
