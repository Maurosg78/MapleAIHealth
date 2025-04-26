import { ClinicalAIService } from './ai/ClinicalAIService';
import { AssistantSuggestion, ClinicalContext, SuggestionStats } from '../types/clinical';
import { v4 as uuidv4 } from 'uuid';

export class ClinicalAssistant {
  private static instance: ClinicalAssistant;
  private aiService: ClinicalAIService;
  private context: ClinicalContext | null = null;
  private suggestionStats: SuggestionStats = {
    total: 0,
    accepted: 0,
    rejected: 0,
    byType: {
      documentation: 0,
      warning: 0,
      blindspot: 0,
      interaction: 0,
      followup: 0,
      reference: 0
    },
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    }
  };

  private constructor() {
    this.aiService = ClinicalAIService.getInstance();
  }

  static getInstance(): ClinicalAssistant {
    if (!ClinicalAssistant.instance) {
      ClinicalAssistant.instance = new ClinicalAssistant();
    }
    return ClinicalAssistant.instance;
  }

  setContext(context: ClinicalContext) {
    this.context = context;
    this.aiService.setContext({
      specialty: context.specialty,
      currentSection: context.activeSection,
      patientContext: {
        patientId: context.patientId,
        patientData: {
          conditions: context.patientHistory?.conditions || [],
          medications: context.patientHistory?.medications || [],
          allergies: context.patientHistory?.allergies || []
        }
      }
    });
  }

  async analyzeDocumentation(text: string): Promise<AssistantSuggestion[]> {
    if (!this.context) {
      throw new Error('Contexto no inicializado');
    }

    try {
      const response = await this.aiService.processQuery(
        `Analiza la siguiente documentación clínica y genera sugerencias relevantes:
        ${text}
        
        Contexto:
        - Sección: ${this.context.activeSection}
        - Especialidad: ${this.context.specialty}
        - Historial del paciente: ${JSON.stringify(this.context.patientHistory)}`
      );

      // Parsear la respuesta y convertirla en sugerencias
      const suggestions: AssistantSuggestion[] = [];
      
      // Aquí iría la lógica para parsear la respuesta y crear sugerencias
      // Por ahora, creamos una sugerencia de ejemplo
      suggestions.push({
        id: uuidv4(),
        type: 'documentation',
        content: 'Considerar agregar más detalles sobre la evolución del dolor',
        confidence: 0.85,
        priority: 'medium',
        metadata: {
          section: this.context.activeSection,
          context: 'Evolución del dolor'
        }
      });

      this.suggestionStats.total += suggestions.length;
      suggestions.forEach(suggestion => {
        this.suggestionStats.byType[suggestion.type]++;
        if (suggestion.priority) {
          this.suggestionStats.byPriority[suggestion.priority]++;
        }
      });

      return suggestions;
    } catch (error) {
      console.error('Error al analizar documentación:', error);
      throw new Error('Error al analizar la documentación clínica');
    }
  }

  async validateClinicalData(data: unknown): Promise<{
    isValid: boolean;
    suggestions: AssistantSuggestion[];
  }> {
    try {
      const response = await this.aiService.validateClinicalData(data);
      
      // Convertir las sugerencias al formato AssistantSuggestion
      const suggestions: AssistantSuggestion[] = response.suggestions.map(suggestion => ({
        id: uuidv4(),
        type: 'warning',
        content: suggestion,
        confidence: 0.9,
        priority: 'high'
      }));

      return {
        isValid: response.isValid,
        suggestions
      };
    } catch (error) {
      console.error('Error al validar datos clínicos:', error);
      throw new Error('Error al validar datos clínicos');
    }
  }

  trackSuggestionUsage(suggestionId: string, accepted: boolean) {
    if (accepted) {
      this.suggestionStats.accepted++;
    } else {
      this.suggestionStats.rejected++;
    }
  }

  getSuggestionStats(): SuggestionStats {
    return this.suggestionStats;
  }
} 