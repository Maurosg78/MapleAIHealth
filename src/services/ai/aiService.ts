import { v4 as uuidv4 } from 'uuid';
import {
  AIQuery,
  AIResponse,
  AIProvider,
  EMRData,
  UnstructuredNote,
  Insight,
  InsightType,
  Recommendation,
  RecommendationType,
  TimelineEvent,
  ContextType,
  AIContext,
} from './types';
import { cacheService } from './cacheService';
import { Logger } from './logger';

/**
 * Error personalizado para el servicio de IA
 */
export class AIServiceError extends Error {
  cause?: Error;
  code?: string;

  constructor(message: string, cause?: Error, code?: string) {
    super(message);
    this.name = 'AIServiceError';
    this.cause = cause;
    this.code = code;
  }
}

/**
 * Configuración del servicio de IA
 */
interface AIServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  defaultProvider?: string;
  googleProjectId?: string;
  [key: string]: unknown;
}

/**
 * Servicio principal para interactuar con modelos de IA
 * Implementa patrón singleton para asegurar una única instancia
 */
export class AIService {
  private static instance: AIService;
  private logger: Logger;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private simulationMode = false;

  // Proveedores de IA disponibles
  private providers: AIProvider[] = [
    {
      id: 'gpt-4-medical',
      name: 'GPT-4 Medical',
      costPerQuery: 0.03,
      capabilities: [
        'emr-analysis',
        'timeline-organization',
        'insight-detection',
      ],
    },
    {
      id: 'med-palm-2',
      name: 'Med-PaLM 2',
      costPerQuery: 0.05,
      capabilities: ['emr-analysis', 'clinical-evidence', 'treatment-patterns'],
    },
  ];

  private config: AIServiceConfig;

  /**
   * Constructor privado para implementar patrón singleton
   */
  private constructor() {
    this.logger = new Logger('AIService');
    this.logger.info('AIService initialized');

    this.config = {
      defaultProvider: 'gpt-4-medical',
      timeout: 30000,
    };

    // En un entorno real, verificaríamos las claves de API
    // Si no hay claves, activar modo simulación
    const hasApiKeys = false; // Simplificado para el ejemplo

    if (!hasApiKeys) {
      this.logger.warn('No API keys configured, using simulation mode');
      this.simulationMode = true;
    }
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Analiza notas médicas no estructuradas
   * @param patientId ID del paciente
   * @param notes Lista de notas médicas no estructuradas
   * @returns Respuesta del análisis de IA
   */
  public async analyzeUnstructuredNotes(
    patientId: string,
    notes: UnstructuredNote[]
  ): Promise<AIResponse> {
    this.logger.info('Analyzing unstructured notes', {
      patientId,
      noteCount: notes.length,
    });

    try {
      // Verificar caché primero
      const cachedResponse = await cacheService.get({
        query: `Analyze patient notes ${patientId}`,
        patientId,
        options: { maxTokens: notes.length * 100 },
      });

      if (cachedResponse) {
        this.logger.info('Retrieved response from cache', { patientId });
        return cachedResponse;
      }

      // Obtener datos del EMR existente
      const emrData = await this.getEMRData(patientId);
      this.logger.debug('Retrieved EMR data', { patientId });

      // Preparar contexto para la IA
      const context: AIContext = {
        type: 'emr' as ContextType,
        data: emrData,
        content: JSON.stringify(emrData),
      };

      // Cronometrar el procesamiento
      const startTime = Date.now();

      // Realizar consulta a la IA
      const aiResponse = await this.query({
        query:
          'Analiza y organiza las siguientes notas médicas, identifica puntos ciegos y genera recomendaciones',
        patientId,
        context,
        unstructuredNotes: notes,
      });

      const processingTime = Date.now() - startTime;
      this.logger.debug('AI query processed', { processingTime });

      // Extraer insights de las notas
      const insights = this.extractInsights(notes, emrData);

      // Generar recomendaciones
      const recommendations = this.generateRecommendations(
        notes,
        emrData,
        insights
      );

      // Detectar contradicciones
      const contradictions = this.detectContradictions(notes, emrData);

      if (contradictions.length > 0) {
        this.logger.warn('Contradictions detected', {
          count: contradictions.length,
        });
        insights.push(...contradictions);
      }

      // Construir respuesta final
      const response: AIResponse = {
        responseId: aiResponse.responseId,
        summary: aiResponse.summary,
        insights,
        recommendations,
        processingTime,
        timeline: aiResponse.timeline,
      };

      // Cachear la respuesta
      await cacheService.set(
        {
          query: `Analyze patient notes ${patientId}`,
          patientId,
          options: {
            maxTokens: notes.length * 100,
            provider: this.config.defaultProvider ?? 'gpt-4-medical',
          },
        },
        response
      );
      this.logger.info('Response cached successfully', { patientId });

      return response;
    } catch (err) {
      this.logger.error('Error analyzing unstructured notes', {
        error: err,
        patientId,
      });
      throw new AIServiceError(
        'Error al analizar las notas médicas',
        err instanceof Error ? err : undefined
      );
    }
  }

  /**
   * Procesa una consulta general de IA
   * @param query Consulta a procesar
   * @returns Respuesta de IA procesada
   */
  public async query(query: AIQuery): Promise<AIResponse> {
    // En modo simulación, generar una respuesta simulada
    if (this.simulationMode) {
      return this.generateSimulatedResponse(query);
    }

    try {
      // Verificar caché primero
      const cachedResponse = await cacheService.get(query);

      if (cachedResponse) {
        this.logger.info('Retrieved response from cache', {
          query: query.query.substring(0, 50) + '...',
        });
        return cachedResponse;
      }

      // Aquí iría la llamada real a la API del proveedor de IA
      // Simplificado para la implementación
      const response = await this.simulateProviderCall(query);

      // Cachear respuesta
      await cacheService.set(query, response);

      return response;
    } catch (err) {
      this.logger.error('Error processing AI query', {
        error: err,
        query: query.query.substring(0, 50) + '...',
      });
      throw new AIServiceError(
        'Error al procesar la consulta de IA',
        err instanceof Error ? err : undefined
      );
    }
  }

  /**
   * Obtiene datos EMR para un paciente
   * @param patientId ID del paciente
   * @returns Datos EMR formateados
   */
  private async getEMRData(patientId: string): Promise<EMRData> {
    // En un entorno real, obtendríamos estos datos de un servicio EMR
    // Implementación simplificada para el ejemplo
    return {
      patientId,
      demographics: {
        name: "Paciente de ejemplo",
        age: 45,
        sex: "male",
        dob: "1979-05-15",
      },
      medicalHistory: {
        conditions: [],
        medications: [],
        allergies: [],
        procedures: [],
      },
    };
  }

  /**
   * Extrae insights de las notas médicas
   * @param _notes Notas médicas
   * @param _emrData Datos EMR
   * @returns Lista de insights
   */
  private extractInsights(_notes: UnstructuredNote[], _emrData: EMRData): Insight[] {
    // Implementación simplificada
    const insights: Insight[] = [];

    // Simular extracción de insights
    insights.push({
      type: 'pattern' as InsightType,
      title: "Patrones identificados",
      description: 'Patrones identificados en las notas médicas',
      severity: 'medium',
    });

    // Simulamos encontrar un patrón para ejemplificar
    insights.push({
      type: 'pattern' as InsightType,
      title: "Síntomas respiratorios",
      description: 'El paciente presenta síntomas consistentes con una infección respiratoria',
      severity: 'medium',
    });

    return insights;
  }

  /**
   * Genera recomendaciones basadas en insights extraídos
   * @param _notes Notas no estructuradas
   * @param _emrData Datos estructurados del EMR
   * @param _insights Insights extraídos
   * @returns Recomendaciones generadas
   */
  private generateRecommendations(
    _notes: UnstructuredNote[],
    _emrData: EMRData,
    _insights: Insight[]
  ): Recommendation[] {
    // Implementación simplificada
    const recommendations: Recommendation[] = [];

    // Simular generación de recomendaciones
    recommendations.push({
      type: 'test' as RecommendationType,
      title: "Recomendación de prueba",
      description: 'Recomendación basada en el análisis de notas',
      priority: 'medium',
      evidenceLevel: 'B',
    });

    return recommendations;
  }

  /**
   * Detecta contradicciones entre diferentes fuentes de datos
   * @param _notes Notas no estructuradas
   * @param _emrData Datos estructurados del EMR
   * @returns Contradicciones detectadas
   */
  private detectContradictions(_notes: UnstructuredNote[], _emrData: EMRData): Insight[] {
    // Implementación simplificada
    const contradictions: Insight[] = [];

    // Simulamos no haber encontrado contradicciones para simplificar
    return contradictions;
  }

  /**
   * Genera una respuesta simulada para pruebas
   * @param query Consulta original
   * @returns Respuesta simulada
   */
  private generateSimulatedResponse(query: AIQuery): AIResponse {
    const responseId = uuidv4();
    this.logger.info('Generating simulated response', { responseId });

    // Crear línea de tiempo simulada si hay notas
    const timeline: TimelineEvent[] = [];
    if (query.unstructuredNotes && query.unstructuredNotes.length > 0) {
      query.unstructuredNotes.forEach((note, index) => {
        timeline.push({
          date: note.date,
          title: `Evento ${index + 1}`,
          description: `Evento extraído de nota: ${note.type}`,
          category: 'visit',
          source: note.id,
        });
      });
    }

    // Generar insights simulados
    const insights: Insight[] = [
      {
        type: 'clinical-pattern' as InsightType,
        title: 'Patrón detectado',
        description: 'Simulación de insight: Patrón detectado en tratamiento',
        severity: 'medium',
      },
      {
        type: 'risk-factor' as InsightType,
        title: 'Factor de riesgo',
        description: 'Simulación de insight: Anomalía en resultados de laboratorio',
        severity: 'medium',
      },
    ];

    // Generar recomendaciones simuladas
    const recommendations: Recommendation[] = [
      {
        type: 'medication' as RecommendationType,
        title: 'Ajuste de medicación',
        description: 'Simulación: Considerar ajuste de medicación',
        priority: 'medium',
        evidenceLevel: 'B',
      },
      {
        type: 'test' as RecommendationType,
        title: 'Prueba adicional',
        description: 'Simulación: Sugerir prueba adicional',
        priority: 'low',
        evidenceLevel: 'C',
      },
    ];

    return {
      responseId,
      summary: 'Respuesta simulada generada por el servicio de IA',
      timeline,
      insights,
      recommendations,
    };
  }

  /**
   * Simula llamada a proveedor de IA
   * @param query Consulta a procesar
   * @returns Respuesta simulada
   */
  private async simulateProviderCall(query: AIQuery): Promise<AIResponse> {
    // Simulamos un procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Devolvemos la respuesta simulada estándar
    return this.generateSimulatedResponse(query);
  }

  /**
   * Devuelve las estadísticas del servicio AI
   * @returns Estadísticas del servicio
   */
  public getStats(): Record<string, unknown> {
    return {
      simulationMode: this.simulationMode,
      providersCount: this.providers.length,
      defaultProvider: this.config.defaultProvider,
      apiKeyConfigured: !!this.config.apiKey,
      timestamp: new Date().toISOString()
    };
  }
}

// Exportar la instancia única
export const aiService = AIService.getInstance();
