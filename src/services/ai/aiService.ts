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
  AIContext
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
  private readonly logger: Logger;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private simulationMode = false;

  // Proveedores de IA disponibles
  private readonly providers: AIProvider[] = [
    {
      id: 'gpt-4-medical',
      name: 'GPT-4 Medical',
      costPerQuery: 0.03,
      capabilities: [
        'emr-analysis',
        'timeline-organization',
        'insight-detection',
      ]
    },
    {
      id: 'med-palm-2',
      name: 'Med-PaLM 2',
      costPerQuery: 0.05,
      capabilities: [
        'emr-analysis',
        'clinical-evidence',
        'treatment-patterns',
      ]
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
   * @param patientId - ID del paciente
   * @param notes - Array de notas médicas no estructuradas
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
      const cacheKey = JSON.stringify({ patientId, noteIds: notes.map(n => n.id) });
      const cachedResponse = await cacheService.get(cacheKey);

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
      };

      // Cronometrar el procesamiento
      const startTime = Date.now();

      // Realizar consulta a la IA
      const aiResponse = await this.query({
        query: 'Analiza y organiza las siguientes notas médicas, identifica puntos ciegos y genera recomendaciones',
        patientId,
        context,
        unstructuredNotes: notes,
      });

      const processingTime = Date.now() - startTime;
      this.logger.debug('AI query processed', { processingTime });

      // Extraer insights de las notas
      const insights = this.extractInsights(notes, emrData);

      // Generar recomendaciones
      const recommendations = this.generateRecommendations(notes, emrData, insights);

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
        ...aiResponse,
        insights,
        recommendations,
        processingTime
      };

      // Cachear la respuesta con metadata
      const metadata = {
        provider: this.config.defaultProvider ?? 'gpt-4-medical',
        cost: this.estimateCost(
          this.config.defaultProvider ?? 'gpt-4-medical',
          notes.length
        ),
        processingTime,
      };

      await cacheService.set(cacheKey, response, metadata);
      this.logger.info('Response cached successfully', { patientId });

      return response;
    } catch (error) {
      this.logger.error('Error analyzing unstructured notes', {
        error,
        patientId,
      });
      throw new AIServiceError(
        'Error al analizar las notas médicas',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Procesa una consulta general de IA
   * @param query - La consulta a procesar
   * @returns Respuesta de IA procesada
   */
  public async query(query: AIQuery): Promise<AIResponse> {
    // En modo simulación, generar una respuesta simulada
    if (this.simulationMode) {
      return this.generateSimulatedResponse(query);
    }

    try {
      // Verificar caché primero
      const cacheKey = JSON.stringify(query);
      const cachedResponse = await cacheService.get(cacheKey);

      if (cachedResponse) {
        this.logger.info('Retrieved response from cache', {
          query: query.query.substring(0, 50) + '...'
        });
        return cachedResponse;
      }

      // Aquí iría la llamada real a la API del proveedor de IA
      // Simplificado para la implementación
      const response = await this.simulateProviderCall(query);

      // Cachear respuesta
      await cacheService.set(cacheKey, response);

      return response;
    } catch (error) {
      this.logger.error('Error processing AI query', {
        error,
        query: query.query.substring(0, 50) + '...',
      });
      throw new AIServiceError(
        'Error al procesar la consulta de IA',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Estima el costo de una consulta
   * @param providerId - ID del proveedor
   * @param complexity - Complejidad de la consulta (1-10)
   * @returns Costo estimado
   */
  private estimateCost(providerId: string, complexity: number): number {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      return 0;
    }

    // Base cost per query
    let cost = provider.costPerQuery;

    // Adjust based on complexity
    cost *= (0.5 + (complexity * 0.05));

    return parseFloat(cost.toFixed(4));
  }

  /**
   * Obtiene datos del historial médico electrónico
   * @param patientId - ID del paciente
   * @returns Datos del EMR
   */
  private async getEMRData(patientId: string): Promise<EMRData> {
    try {
      this.logger.debug('Fetching EMR data', { patientId });

      // Simulación de llamada a API externa
      const emrData: EMRData = {
        patientId,
        demographics: {
          name: 'Juan Ejemplo',
          age: 45,
          sex: 'male',
          dob: '1978-05-15',
        },
        medicalHistory: {
          conditions: [
            'Hipertensión',
            'Diabetes tipo 2',
            'Obesidad'
          ],
          allergies: [
            'Penicilina',
            'Sulfamidas'
          ],
          medications: [
            {
              name: 'Metformina',
              dosage: '850mg',
              frequency: 'BID',
              startDate: '2019-03-10',
              active: true
            },
            {
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'QD',
              startDate: '2018-10-05',
              active: true
            }
          ],
          procedures: [
            {
              name: 'Colonoscopía',
              date: '2020-11-15',
              provider: 'Dr. García'
            }
          ]
        }
      };

      return emrData;
    } catch (error) {
      this.logger.error('Error fetching EMR data', { error, patientId });
      throw new AIServiceError(
        'Error al obtener datos del historial médico',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Simula una llamada al proveedor de IA
   * @param query - Consulta de IA
   * @returns Respuesta simulada
   */
  private async simulateProviderCall(query: AIQuery): Promise<AIResponse> {
    // Simulamos un tiempo de procesamiento
    const processingTime = Math.random() * 1500 + 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    return this.generateSimulatedResponse(query);
  }

  /**
   * Genera una respuesta simulada para desarrollo
   * @param query - Consulta original
   * @returns Respuesta simulada
   */
  private generateSimulatedResponse(query: AIQuery): AIResponse {
    // Crear respuesta simulada basada en el tipo de consulta
    const response: AIResponse = {
      responseId: uuidv4(),
      summary: `Análisis simulado para paciente ${query.patientId || 'sin ID'}. Esta es una respuesta generada automáticamente para simular el comportamiento del servicio de IA.`,
      processingTime: Math.random() * 1500 + 500,
      followUpQuestions: [
        '¿Cuándo fue la última vez que el paciente tuvo una revisión completa?',
        '¿Ha habido cambios recientes en su medicación?',
        '¿Qué otros factores de riesgo presenta el paciente?'
      ]
    };

    // Agregar timeline simulado
    response.timeline = this.generateSimulatedTimeline();

    return response;
  }

  /**
   * Genera una línea de tiempo simulada para las respuestas de desarrollo
   * @returns Timeline simulado
   */
  private generateSimulatedTimeline(): TimelineEvent[] {
    const currentYear = new Date().getFullYear();

    return [
      {
        date: `${currentYear-3}-06-15`,
        title: 'Diagnóstico inicial',
        description: 'Diagnóstico de hipertensión y diabetes tipo 2',
        category: 'condition'
      },
      {
        date: `${currentYear-3}-06-22`,
        title: 'Inicio tratamiento',
        description: 'Prescripción de Metformina y Lisinopril',
        category: 'medication'
      },
      {
        date: `${currentYear-2}-11-15`,
        title: 'Procedimiento preventivo',
        description: 'Colonoscopía normal, sin hallazgos significativos',
        category: 'procedure'
      },
      {
        date: `${currentYear-1}-04-10`,
        title: 'Visita de seguimiento',
        description: 'Control semestral, ajuste de medicación',
        category: 'visit'
      },
      {
        date: `${currentYear}-01-20`,
        title: 'Visita de urgencia',
        description: 'Episodio de mareo y presión arterial elevada',
        category: 'visit'
      }
    ];
  }

  /**
   * Extrae insights de las notas médicas
   * @param notes - Notas médicas
   * @param emrData - Datos del EMR
   * @returns Insights extraídos
   */
  private extractInsights(
    notes: UnstructuredNote[],
    emrData: EMRData
  ): Insight[] {
    // Simulación de extracción de insights
    const insights: Insight[] = [
      {
        type: 'missing-information' as InsightType,
        title: 'Falta información sobre nivel de actividad física',
        description: 'No hay datos recientes sobre los hábitos de ejercicio del paciente, lo que es crucial para el manejo de diabetes e hipertensión.',
        severity: 'medium',
        sourcesReferences: [
          {
            noteId: notes[0]?.id,
            date: notes[0]?.date,
            excerpt: 'Paciente reporta fatiga ocasional'
          }
        ]
      },
      {
        type: 'clinical-pattern' as InsightType,
        title: 'Patrón de aumento gradual en valores de presión arterial',
        description: 'Se observa un incremento progresivo en los valores de presión arterial en los últimos 6 meses.',
        severity: 'medium'
      }
    ];

    return insights;
  }

  /**
   * Genera recomendaciones basadas en notas e insights
   * @param notes - Notas médicas
   * @param emrData - Datos del EMR
   * @param insights - Insights identificados
   * @returns Recomendaciones generadas
   */
  private generateRecommendations(
    notes: UnstructuredNote[],
    emrData: EMRData,
    insights: Insight[]
  ): Recommendation[] {
    // Simulación de generación de recomendaciones
    const recommendations: Recommendation[] = [
      {
        type: 'test' as RecommendationType,
        title: 'Realizar prueba de HbA1c',
        description: 'Programar prueba de hemoglobina glicosilada para evaluar control glucémico en los últimos 3 meses',
        priority: 'high',
        timeframe: '2 semanas',
        evidenceLevel: 'high'
      },
      {
        type: 'follow-up' as RecommendationType,
        title: 'Evaluación nutricional',
        description: 'Derivar a nutricionista para plan alimentario adaptado a diabetes e hipertensión',
        priority: 'medium',
        timeframe: '1 mes',
        evidenceLevel: 'moderate'
      },
      {
        type: 'lifestyle' as RecommendationType,
        title: 'Plan de actividad física',
        description: 'Recomendar programa de ejercicio moderado adaptado a condición actual',
        priority: 'medium',
        rationale: 'La actividad física regular mejora el control glucémico y la presión arterial',
        evidenceLevel: 'high'
      }
    ];

    return recommendations;
  }

  /**
   * Detecta contradicciones en las notas médicas
   * @param notes - Notas médicas
   * @param emrData - Datos del EMR
   * @returns Insights de contradicciones detectadas
   */
  private detectContradictions(
    notes: UnstructuredNote[],
    emrData: EMRData
  ): Insight[] {
    // Simulación de detección de contradicciones
    if (notes.length < 2) {
      return [];
    }

    // Ejemplo simulado de contradicción
    const contradictions: Insight[] = [
      {
        type: 'contradiction' as InsightType,
        title: 'Contradicción en reportes de adherencia a medicación',
        description: 'Existen reportes contradictorios sobre la adherencia del paciente a Metformina',
        severity: 'high',
        sourcesReferences: [
          {
            noteId: notes[0]?.id,
            date: notes[0]?.date,
            excerpt: 'Paciente reporta tomar medicación regularmente'
          },
          {
            noteId: notes[notes.length-1]?.id,
            date: notes[notes.length-1]?.date,
            excerpt: 'Paciente admite omisión frecuente de dosis de Metformina'
          }
        ]
      }
    ];

    return contradictions;
  }

  /**
   * Ejecuta una función con reintentos automáticos en caso de error
   * @param fn - Función a ejecutar
   * @returns Resultado de la función
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Retry attempt ${attempt}/${this.MAX_RETRIES} failed`, { error });

        if (attempt < this.MAX_RETRIES) {
          // Espera exponencial entre reintentos
          await new Promise(resolve =>
            setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, attempt - 1))
          );
        }
      }
    }

    throw new AIServiceError(
      `Failed after ${this.MAX_RETRIES} retry attempts`,
      lastError
    );
  }

  /**
   * Actualiza la configuración del servicio
   * @param config - Nueva configuración
   */
  public updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('AIService configuration updated', { config });
  }

  /**
   * Obtiene estadísticas de uso del servicio
   */
  public getStats(): Record<string, unknown> {
    return {
      simulationMode: this.simulationMode,
      providers: this.providers.map(p => p.id),
      defaultProvider: this.config.defaultProvider,
      cacheStats: cacheService.getStats()
    };
  }

  /**
   * Expone los proveedores disponibles
   */
  public getProviders(): AIProvider[] {
    return [...this.providers];
  }
}

// Exportar el servicio e instancia única
export const aiService = AIService.getInstance();
