import { Logger } from './logger';
import { aiService } from './aiService';
import { AIResponse, Insight, Recommendation, UnstructuredNote } from './types';
import { evidenceEvaluationService } from './evidence';
import { aiHistoryService } from './aiHistoryService';
import { monitorService } from './monitorService';

/**
 * Tipo de sugerencia clínica
 */
export type ClinicalSuggestionType =
  | 'diagnostic'
  | 'treatment'
  | 'test'
  | 'medication'
  | 'followUp'
  | 'referral'
  | 'warning';

/**
 * Nivel de urgencia de sugerencia
 */
export type UrgencyLevel =
  | 'routine'
  | 'soon'
  | 'urgent'
  | 'emergency';

/**
 * Estructura de una sugerencia clínica
 */
export interface ClinicalSuggestion {
  id: string;
  type: ClinicalSuggestionType;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  confidence: number;
  evidenceLevel?: string;
  recommendation?: string;
  contraindications?: string[];
  alternatives?: string[];
  sources?: string[];
  relatedInsights?: string[];
}

/**
 * Contexto del paciente para generar sugerencias
 */
export interface PatientContext {
  patientId: string;
  age?: number;
  gender?: string;
  mainCondition?: string;
  allergies?: string[];
  currentMedications?: string[];
  recentTests?: string[];
  vitalSigns?: Record<string, number>;
  riskFactors?: string[];
}

/**
 * Opciones de configuración para el copiloto
 */
export interface ClinicalCopilotOptions {
  maxSuggestions?: number;
  minConfidence?: number;
  includeEvidenceDetails?: boolean;
  includeContraindications?: boolean;
  includeAlternatives?: boolean;
  checkDrugInteractions?: boolean;
  patientContext?: PatientContext;
}

/**
 * Servicio de copiloto clínico que proporciona sugerencias médicas
 * basadas en notas clínicas y contexto del paciente
 */
export class ClinicalCopilotService {
  private static instance: ClinicalCopilotService;
  private logger: Logger;
  private defaultOptions: ClinicalCopilotOptions = {
    maxSuggestions: 5,
    minConfidence: 0.65,
    includeEvidenceDetails: true,
    includeContraindications: true,
    includeAlternatives: true,
    checkDrugInteractions: true
  };

  private constructor() {
    this.logger = new Logger('ClinicalCopilotService');
    this.logger.info('ClinicalCopilotService initialized');
  }

  /**
   * Obtiene la instancia única del servicio de copiloto clínico
   */
  public static getInstance(): ClinicalCopilotService {
    if (!ClinicalCopilotService.instance) {
      ClinicalCopilotService.instance = new ClinicalCopilotService();
    }
    return ClinicalCopilotService.instance;
  }

  /**
   * Genera sugerencias clínicas basadas en notas y contexto del paciente
   * @param notes Notas clínicas no estructuradas
   * @param options Opciones de configuración
   * @returns Lista de sugerencias clínicas
   */
  public async generateSuggestions(
    notes: UnstructuredNote[],
    options?: ClinicalCopilotOptions
  ): Promise<ClinicalSuggestion[]> {
    const startTime = Date.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      this.logger.info('Generating clinical suggestions', {
        notesCount: notes.length,
        patientId: mergedOptions.patientContext?.patientId
      });

      // Paso 1: Analizar las notas usando el servicio de IA
      const aiResponse = await this.analyzeNotes(notes, mergedOptions);

      // Paso 2: Generar sugerencias basadas en el análisis
      const suggestions = await this.processSuggestions(aiResponse, mergedOptions);

      // Paso 3: Evaluar la evidencia de las sugerencias
      const enrichedSuggestions = await this.evaluateEvidence(suggestions, mergedOptions);

      // Paso 4: Verificar contraindicaciones si es requerido
      const finalSuggestions = mergedOptions.includeContraindications
        ? await this.checkContraindications(enrichedSuggestions, mergedOptions)
        : enrichedSuggestions;

      // Registrar en el historial
      this.recordSuggestions(notes, finalSuggestions, mergedOptions);

      // Registrar tiempo de respuesta para monitoreo
      const processingTime = Date.now() - startTime;
      monitorService.trackQuery(processingTime, false);

      this.logger.info('Generated clinical suggestions', {
        count: finalSuggestions.length,
        processingTime,
        patientId: mergedOptions.patientContext?.patientId
      });

      return finalSuggestions;
    } catch (error) {
      this.logger.error('Error generating clinical suggestions', { error });
      monitorService.trackError(error as Error);
      return [];
    }
  }

  /**
   * Analiza notas clínicas para generar insights y recomendaciones
   */
  private async analyzeNotes(
    notes: UnstructuredNote[],
    options: ClinicalCopilotOptions
  ): Promise<AIResponse> {
    const queryText = this.buildQueryFromNotes(notes, options);

    // Consultar al servicio de IA
    const emrData = options.patientContext ? {
      patientId: options.patientContext.patientId,
      demographics: {
        age: options.patientContext.age,
        sex: options.patientContext.gender
      },
      medicalHistory: {
        conditions: options.patientContext.mainCondition ? [{ name: options.patientContext.mainCondition }] : [],
        allergies: options.patientContext.allergies || [],
        medications: options.patientContext.currentMedications?.map(med => ({ name: med })) || []
      }
    } : undefined;

    // Consultar al servicio de IA
    return await aiService.analyzeUnstructuredNotes(
      options.patientContext?.patientId || 'unknown',
      notes
    );
  }

  /**
   * Construye una consulta basada en notas y contexto
   */
  private buildQueryFromNotes(
    notes: UnstructuredNote[],
    options: ClinicalCopilotOptions
  ): string {
    // Extraer contenido de notas recientes (últimas 3)
    const recentNotes = notes.slice(0, 3).map(note => note.content).join(' ');

    // Limitar longitud
    const limitedNotes = recentNotes.substring(0, 1500);

    // Construcción de contexto
    let contextStr = '';

    if (options.patientContext) {
      const ctx = options.patientContext;
      contextStr = `Paciente ID:${ctx.patientId}`;

      if (ctx.age) contextStr += `, ${ctx.age} años`;
      if (ctx.gender) contextStr += `, ${ctx.gender}`;
      if (ctx.mainCondition) contextStr += `, con diagnóstico principal de ${ctx.mainCondition}`;
      if (ctx.allergies && ctx.allergies.length > 0) contextStr += `, alergias: ${ctx.allergies.join(', ')}`;
      if (ctx.currentMedications && ctx.currentMedications.length > 0) {
        contextStr += `, medicación actual: ${ctx.currentMedications.join(', ')}`;
      }
    }

    return `Análisis clínico. ${contextStr ? 'Contexto: ' + contextStr : ''} Notas: ${limitedNotes}`;
  }

  /**
   * Procesa la respuesta de IA para convertirla en sugerencias clínicas
   */
  private async processSuggestions(
    aiResponse: AIResponse,
    options: ClinicalCopilotOptions
  ): Promise<ClinicalSuggestion[]> {
    const suggestions: ClinicalSuggestion[] = [];
    const maxSuggestions = options.maxSuggestions || 5;
    const minConfidence = options.minConfidence || 0.65;

    // Procesar insights
    if (aiResponse.insights && aiResponse.insights.length > 0) {
      suggestions.push(...this.convertInsightsToSuggestions(aiResponse.insights, minConfidence));
    }

    // Procesar recomendaciones
    if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
      suggestions.push(...this.convertRecommendationsToSuggestions(aiResponse.recommendations, minConfidence));
    }

    // Ordenar por urgencia y confianza
    const sortedSuggestions = this.sortSuggestionsByPriority(suggestions);

    // Limitar cantidad
    return sortedSuggestions.slice(0, maxSuggestions);
  }

  /**
   * Convierte insights de IA en sugerencias clínicas
   */
  private convertInsightsToSuggestions(
    insights: Insight[],
    minConfidence: number
  ): ClinicalSuggestion[] {
    return insights
      .filter(insight => insight.confidence ? insight.confidence >= minConfidence : true)
      .map(insight => {
        // Determinar tipo de sugerencia basado en el tipo de insight
        let type: ClinicalSuggestionType = 'diagnostic';
        let urgency: UrgencyLevel = 'routine';

        if (insight.type === 'contradiction') {
          type = 'warning';
          urgency = 'soon';
        } else if (insight.type === 'missing-information') {
          type = 'test';
          urgency = 'soon';
        } else if (insight.type === 'risk-factor') {
          type = 'warning';
          urgency = insight.severity === 'high' ? 'urgent' : 'soon';
        }

        // Convertir severidad a urgencia
        if (insight.severity === 'high') {
          urgency = 'urgent';
        } else if (insight.severity === 'critical') {
          urgency = 'emergency';
        }

        return {
          id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type,
          title: insight.title || 'Hallazgo clínico',
          description: insight.description || '',
          urgency,
          confidence: insight.confidence || 0.7,
        };
      });
  }

  /**
   * Convierte recomendaciones de IA en sugerencias clínicas
   */
  private convertRecommendationsToSuggestions(
    recommendations: Recommendation[],
    minConfidence: number
  ): ClinicalSuggestion[] {
    return recommendations
      .filter(rec => rec.confidence >= minConfidence)
      .map(rec => {
        // Determinar tipo de sugerencia basado en el tipo de recomendación
        let type: ClinicalSuggestionType = 'treatment';

        if (rec.type?.includes('medication')) {
          type = 'medication';
        } else if (rec.type?.includes('test')) {
          type = 'test';
        } else if (rec.type?.includes('followup')) {
          type = 'followUp';
        } else if (rec.type?.includes('referral')) {
          type = 'referral';
        }

        // Determinar urgencia basada en prioridad
        let urgency: UrgencyLevel = 'routine';
        if (rec.priority === 'high') {
          urgency = 'soon';
        } else if (rec.priority === 'urgent') {
          urgency = 'urgent';
        } else if (rec.priority === 'emergency') {
          urgency = 'emergency';
        }

        return {
          id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type,
          title: rec.title || rec.content.substring(0, 50),
          description: rec.description || rec.content,
          urgency,
          confidence: rec.confidence,
          recommendation: rec.content,
          alternatives: rec.alternatives,
          evidenceLevel: rec.evidenceLevel
        };
      });
  }

  /**
   * Enriquece las sugerencias con información de evidencia
   */
  private async evaluateEvidence(
    suggestions: ClinicalSuggestion[],
    options: ClinicalCopilotOptions
  ): Promise<ClinicalSuggestion[]> {
    if (!options.includeEvidenceDetails) {
      return suggestions;
    }

    const enrichedSuggestions: ClinicalSuggestion[] = [];

    for (const suggestion of suggestions) {
      try {
        // Crear una recomendación para evaluar
        const recommendation: Recommendation = {
          id: suggestion.id,
          content: suggestion.description,
          confidence: suggestion.confidence,
          title: suggestion.title,
          type: suggestion.type
        };

        // Evaluar la evidencia
        const evaluatedRecommendation = await evidenceEvaluationService.evaluateRecommendation(recommendation as any);

        // Enriquecer la sugerencia con información de evidencia
        enrichedSuggestions.push({
          ...suggestion,
          evidenceLevel: evaluatedRecommendation.evidenceLevel || suggestion.evidenceLevel,
          sources: evaluatedRecommendation.sources || suggestion.sources,
          confidence: Math.max(suggestion.confidence, (evaluatedRecommendation.confidenceScore || 0) / 100)
        });
      } catch (error) {
        this.logger.warn('Error evaluating evidence for suggestion', {
          id: suggestion.id,
          error
        });
        enrichedSuggestions.push(suggestion);
      }
    }

    return enrichedSuggestions;
  }

  /**
   * Verifica contraindicaciones basadas en el contexto del paciente
   */
  private async checkContraindications(
    suggestions: ClinicalSuggestion[],
    options: ClinicalCopilotOptions
  ): Promise<ClinicalSuggestion[]> {
    if (!options.includeContraindications || !options.patientContext) {
      return suggestions;
    }

    return suggestions.map(suggestion => {
      const contraindications: string[] = [];
      const ctx = options.patientContext;

      // Verificar alergias para medicamentos
      if (suggestion.type === 'medication' && ctx?.allergies?.length) {
        const allergies = ctx.allergies;
        // Buscar alergias relacionadas con la medicación
        for (const allergy of allergies) {
          if (suggestion.description.toLowerCase().includes(allergy.toLowerCase())) {
            contraindications.push(`Alergia a ${allergy}`);
          }
        }
      }

      // Verificar interacciones medicamentosas
      if (suggestion.type === 'medication' && ctx?.currentMedications?.length && options.checkDrugInteractions) {
        const currentMeds = ctx.currentMedications;
        // Simulación simple de interacciones
        // En un sistema real, esto consultaría una base de datos de interacciones
        for (const med of currentMeds) {
          if (this.checkSimpleInteraction(suggestion.title, med)) {
            contraindications.push(`Posible interacción con ${med}`);
          }
        }
      }

      // Verificar condiciones específicas
      if (ctx?.mainCondition) {
        const condition = ctx.mainCondition.toLowerCase();
        const suggestionText = (suggestion.title + ' ' + suggestion.description).toLowerCase();

        // Ejemplo simple de contraindicaciones por condición
        if (condition.includes('renal') && suggestionText.includes('aine')) {
          contraindications.push('Precaución en insuficiencia renal');
        }

        if (condition.includes('hepát') && suggestionText.includes('paracetamol')) {
          contraindications.push('Ajustar dosis en enfermedad hepática');
        }
      }

      return {
        ...suggestion,
        contraindications: contraindications.length > 0 ? contraindications : undefined
      };
    });
  }

  /**
   * Verifica interacciones simples entre medicamentos (simulación)
   */
  private checkSimpleInteraction(med1: string, med2: string): boolean {
    const knownInteractions: [string, string][] = [
      ['warfarina', 'aspirina'],
      ['enalapril', 'espironolactona'],
      ['simvastatina', 'eritromicina'],
      ['fluoxetina', 'tramadol'],
      ['omeprazol', 'clopidogrel']
    ];

    const normalizedMed1 = med1.toLowerCase();
    const normalizedMed2 = med2.toLowerCase();

    return knownInteractions.some(([a, b]) =>
      (normalizedMed1.includes(a) && normalizedMed2.includes(b)) ||
      (normalizedMed1.includes(b) && normalizedMed2.includes(a))
    );
  }

  /**
   * Ordena sugerencias por prioridad (urgencia, confianza)
   */
  private sortSuggestionsByPriority(suggestions: ClinicalSuggestion[]): ClinicalSuggestion[] {
    const urgencyWeight: Record<UrgencyLevel, number> = {
      'emergency': 4,
      'urgent': 3,
      'soon': 2,
      'routine': 1
    };

    return [...suggestions].sort((a, b) => {
      // Primero por urgencia
      const urgencyDiff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;

      // Luego por confianza
      return b.confidence - a.confidence;
    });
  }

  /**
   * Registra las sugerencias generadas en el historial
   */
  private recordSuggestions(
    notes: UnstructuredNote[],
    suggestions: ClinicalSuggestion[],
    options: ClinicalCopilotOptions
  ): void {
    try {
      const patientId = options.patientContext?.patientId;

      // Crear una entrada combinada para el historial
      const aiResponse: AIResponse = {
        summary: `Análisis clínico: ${suggestions.length} sugerencias generadas`,
        insights: suggestions.map(s => ({
          type: s.type as any,
          title: s.title,
          description: s.description,
          severity: this.mapUrgencyToSeverity(s.urgency),
          confidence: s.confidence
        })),
        recommendations: suggestions.map(s => ({
          id: s.id,
          content: s.description,
          confidence: s.confidence,
          title: s.title,
          type: s.type,
          evidenceLevel: s.evidenceLevel,
          priority: this.mapUrgencyToPriority(s.urgency)
        }))
      };

      // Almacenar en el historial
      aiHistoryService.addToHistory(
        {
          query: 'Análisis clínico automático',
          patientId
        },
        aiResponse,
        undefined, // userId
        patientId,
        {
          notesCount: notes.length,
          notesIds: notes.map(n => n.id),
          suggestionsCount: suggestions.length
        }
      );
    } catch (error) {
      this.logger.error('Error recording suggestions in history', { error });
    }
  }

  /**
   * Mapea nivel de urgencia a severidad
   */
  private mapUrgencyToSeverity(urgency: UrgencyLevel): string {
    switch (urgency) {
      case 'emergency': return 'critical';
      case 'urgent': return 'high';
      case 'soon': return 'medium';
      case 'routine': return 'low';
    }
  }

  /**
   * Mapea nivel de urgencia a prioridad
   */
  private mapUrgencyToPriority(urgency: UrgencyLevel): string {
    switch (urgency) {
      case 'emergency':
      case 'urgent': return 'high';
      case 'soon': return 'medium';
      case 'routine': return 'low';
    }
  }
}

// Exportar instancia única del servicio
export const clinicalCopilotService = ClinicalCopilotService.getInstance();
