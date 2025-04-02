import {
  AIProvider,
import {
   HttpService 
} from "../../../lib/api";  EMRData,
  UnstructuredNote,
  AIQuery,
  AIResponse,
  Insight,
  Recommendation,
  RecommendationType,
  TimelineEvent,
  InsightType,
} from './types';

/**
 * Interfaz para el servicio de caché
 */
export interface ICacheService {
  get: (query: string) => Promise<AIResponse | null>;
  set: (
    query: string,
    response: AIResponse,
    metadata?: { provider: string; cost: number; processingTime: number }
  ) => Promise<void>;
}

/**
 * Configuración del servicio de IA
 */
export interface AIServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  defaultProvider?: string;
  googleProjectId?: string;
  [key: string]: unknown;
}

// Definir alias de tipos para uniones
type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type ContextType = 'emr' | 'appointment' | 'general';
type CapabilityType =
  | 'emr-analysis'
  | 'timeline-organization'
  | 'insight-detection'
  | 'clinical-evidence'
  | 'treatment-patterns';

// Logger para un seguimiento detallado de las operaciones
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, unknown>;
}

export type { UnstructuredNote, AIResponse };
export class AIService {
  private static instance: AIService;
  private readonly providers: AIProvider[] = [
    {
      id: 'gpt-4-medical',
      name: 'GPT-4 Medical',
      costPerQuery: 0.03,
      capabilities: [
        'emr-analysis',
        'timeline-organization',
        'insight-detection',
      ] as CapabilityType[],
    },
    {
      id: 'med-palm-2',
      name: 'Med-PaLM 2',
      costPerQuery: 0.05,
      capabilities: [
        'emr-analysis',
        'clinical-evidence',
        'treatment-patterns',
      ] as CapabilityType[],
    },
  ];

  private readonly logger = new Logger('AIService');
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly cacheService: ICacheService;
  private readonly config: AIServiceConfig;
  private readonly aiProviders: AIProviderClient[] = [];
  private simulationMode = false;

  private constructor() {
    this.logger.info('AIService initialized');
    this.cacheService = cacheService;
    this.config = {
      defaultProvider: 'gpt-4-medical',
      timeout: 30000,
    };

    this.setupProviders();
  }

  private setupProviders(): void {
    // Verificar si tenemos claves de API configuradas



    // Limpiar proveedores anteriores
    this.aiProviders.length = 0;

    // Si no hay claves, usar modo simulación
    if (!openaiApiKey && !googleProjectId) {
      this.logger.warn('No API keys configured, using simulation mode');
      this.simulationMode = true;
      return;
    }

    // Configurar el proveedor de OpenAI si hay clave
    if (openaiApiKey) {
      try {
        const openaiProvider = new OpenAIProvider({
          apiKey: openaiApiKey,
          baseUrl: this.config.baseUrl as string,
          modelName: 'gpt-4-turbo',
        });
        this.aiProviders.push(openaiProvider);
        this.logger.info('OpenAI provider configured');
      } catch (error) {
        this.logger.error('Failed to configure OpenAI provider', { error });
      }
    }

    // Configurar el proveedor de Google MedPaLM si hay clave
    if (googleProjectId) {
      try {
        const medpalmProvider = new MedPaLMProvider({
          apiKey: this.config.apiKey as string,
          projectId: googleProjectId,
        });
        this.aiProviders.push(medpalmProvider);
        this.logger.info('Google MedPaLM provider configured');
      } catch (error) {
        this.logger.error('Failed to configure Google MedPaLM provider', {
          error,
        });
      }
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeUnstructuredNotes(
    patientId: string,
    notes: UnstructuredNote[]
  ): Promise<AIResponse> {
    this.logger.info('Analyzing unstructured notes', {
      patientId,
      noteCount: notes.length,
    });

    try {
      // Obtener datos del EMR existente

      this.logger.debug('Retrieved EMR data', { patientId });

      // Preparar contexto para la IA
      const context = {
        type: 'emr' as ContextType,
        data: emrData,
      };

      // Realizar consulta a la IA

      const aiResponse = await this.query({
        query:
          'Analiza y organiza las siguientes notas médicas, identifica puntos ciegos y genera recomendaciones',
        patientId,
        context,
        unstructuredNotes: notes,
      });

      this.logger.debug('AI query processed', { processingTime });

      // Analizar la respuesta para generar insights y recomendaciones



      // Detectar contradicciones

      if (contradictions.length > 0) {
        this.logger.warn('Contradictions detected', {
          count: contradictions.length,
        });
        insights.push(...contradictions);
      }

      const response = {
        ...aiResponse,
        insights,
        recommendations,
      };

      // Cachear la respuesta con metadata
      const metadata = {
        provider: this.config.defaultProvider ?? 'gpt-4-medical',
        cost: this.estimateCost(
          this.config.defaultProvider ?? 'gpt-4-medical',
          1
        ),
        processingTime,
      };
      await this.cacheService.set(
        JSON.stringify({ patientId, notes }),
        response,
        metadata
      );
      this.logger.info('Response cached successfully', { patientId });

      return response;
    } catch (error) {
      this.logger.error('Error analyzing unstructured notes', {
        error,
        patientId,
      });
      throw new AIServiceError(
        'Error al analizar las notas médicas',
        error as Error
      );
    }
  }

  private async getEMRData(patientId: string): Promise<EMRData> {
    try {
      this.logger.debug('Fetching EMR data', { patientId });
      const emrResponse = await this.executeWithRetry(() =>
        api.get<EMRData>(`/emr/${patientId}`)
      );
      return emrResponse.data;
    } catch (error) {
      this.logger.error('Error fetching EMR data', { error, patientId });
      throw new AIServiceError(
        'Error al obtener datos del historial médico',
        error as Error
      );
    }
  }

  /**
   * Ejecuta una operación con reintentos automáticos en caso de fallo
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(
          `Operation failed, retrying... (${this.MAX_RETRIES - retries + 1}/${this.MAX_RETRIES})`,
          { error }
        );
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Detecta contradicciones entre diferentes fuentes de información médica
   */
  private detectContradictions(
    emrData: EMRData,
    notes: UnstructuredNote[]
  ): Insight[] {
    this.logger.debug('Detecting contradictions', {
      emrDataAvailable: !!emrData,
      notesCount: notes.length,
    });


    // Contradicciones en medicamentos
    const emrMedications = new Set(
      emrData.medications.map((med) => med.name.toLowerCase())
    );

    // Medicamentos mencionados en las notas

    notes.forEach((note) => {
      note.medications?.forEach((med) =>
        noteMedications.add(med.toLowerCase())
      );
    });

    // Contradicciones en medicamentos
    if (noteMedications.size > 0) {
      const noteMedsNotInEMR = Array.from(noteMedications).filter(
        (med) => !emrMedications.has(med)
      );

      if (noteMedsNotInEMR.length > 0) {
        contradictions.push({
          type: 'contradiction' as InsightType,
          description:
            'Medicamentos mencionados en notas que no aparecen en el historial médico',
          severity: 'medium',
          evidence: noteMedsNotInEMR.map((med) => `Medicamento: ${med}`),
        });
        this.logger.debug('Medication contradiction detected', {
          medications: noteMedsNotInEMR,
        });
      }
    }

    // Contradicciones en diagnósticos



    notes.forEach((note) => {
      if (note.diagnosis) {

        if (diagnosisSet.has(diagnosis)) {
          contradictoryDiagnosis.add(diagnosis);
        } else {
          diagnosisSet.add(diagnosis);
        }
      }
    });

    if (contradictoryDiagnosis.size > 0) {
      contradictions.push({
        type: 'contradiction' as InsightType,
        description:
          'Posibles diagnósticos contradictorios encontrados en diferentes notas',
        severity: 'high',
        evidence: Array.from(contradictoryDiagnosis).map(
          (d) => `Diagnóstico: ${d}`
        ),
      });
      this.logger.debug('Diagnosis contradiction detected', {
        diagnoses: Array.from(contradictoryDiagnosis),
      });
    }

    return contradictions;
  }

  private generateInsights(response: AIResponse, emrData: EMRData): Insight[] {
    this.logger.debug('Generating insights');


    // Analizar gaps en la línea de tiempo
    if (response.timeline) {

      if (timelineGaps.length > 0) {
        insights.push(...timelineGaps);
        this.logger.debug('Timeline gaps detected', {
          count: timelineGaps.length,
        });
      }
    }

    // Analizar factores de riesgo

    if (riskFactors.length > 0) {
      insights.push(...riskFactors);
      this.logger.debug('Risk factors detected', { count: riskFactors.length });
    }

    return insights;
  }

  private analyzeTimelineGaps(
    timeline: { date: string; events: TimelineEvent[] }[]
  ): Insight[] {

    const sortedTimeline = [...timeline].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 1; i < sortedTimeline.length; i++) {
      const gap =
        new Date(sortedTimeline[i].date).getTime() -
        new Date(sortedTimeline[i - 1].date).getTime();

      if (gap > 30 * 24 * 60 * 60 * 1000) {
        // Más de 30 días
        insights.push({
          type: 'timeline-gap' as InsightType,
          description: `Se detectó una brecha significativa en el seguimiento del paciente`,
          severity: 'medium',
          evidence: [
            `Última consulta: ${new Date(sortedTimeline[i - 1].date).toLocaleDateString()}`,
            `Siguiente consulta: ${new Date(sortedTimeline[i].date).toLocaleDateString()}`,
          ],
        });
      }
    }

    return insights;
  }

  private analyzeRiskFactors(emrData: EMRData): Insight[] {


    // Analizar factores de riesgo en notas y EMR
    const riskKeywords = [
      'riesgo',
      'complicación',
      'adverso',
      'efecto secundario',
      'contraindicación',
    ];
    const riskNotes = emrData.medicalHistory
      .filter((record) => record.type === 'note')
      .filter((note) =>
        riskKeywords.some((keyword) =>
          note.description.toLowerCase().includes(keyword)
        )
      );

    // Analizar medicamentos en EMR para contraindicaciones
    const medicationsWithRisks = emrData.medications.filter((med) =>
      riskKeywords.some((keyword) => med.name.toLowerCase().includes(keyword))
    );

    if (riskNotes.length > 0 || medicationsWithRisks.length > 0) {
      insights.push({
        type: 'risk-factor' as InsightType,
        description:
          'Se detectaron factores de riesgo en las notas médicas y medicamentos',
        severity: 'high',
        evidence: [
          ...riskNotes.map((note) => note.description),
          ...medicationsWithRisks.map(
            (med) => `Medicamento con riesgo: ${med.name}`
          ),
        ],
      });
    }

    return insights;
  }

  private generateRecommendations(response: AIResponse): Recommendation[] {
    this.logger.debug('Generating recommendations');


    if (response.insights) {
      for (const insight of response.insights) {
        if (insight.recommendation) {
          recommendations.push({
            type: this.determineRecommendationType(insight),
            description: insight.recommendation,
            priority: insight.severity,
            evidence: insight.evidence,
          });
        }
      }
    }

    return recommendations;
  }

  private determineRecommendationType(insight: Insight): RecommendationType {
    switch (insight.type) {
      case 'missing-follow-up':
        return 'follow-up' as RecommendationType;
      case 'risk-factor':
        return 'alert' as RecommendationType;
      case 'vital-signs-trend':
        return 'test' as RecommendationType;
      case 'contradiction':
        return 'alert' as RecommendationType;
      default:
        return 'follow-up' as RecommendationType;
    }
  }

  async query(query: AIQuery): Promise<AIResponse> {
    this.logger.info('Processing AI query', {
      queryType: query.context?.type,
      patientId: query.patientId,
      notesCount: query.unstructuredNotes?.length,
    });

    try {
      // Intentar obtener del caché



      if (cachedResponse) {
        this.logger.info('Cache hit', { cacheKey });
        return cachedResponse;
      }
      this.logger.debug('Cache miss', { cacheKey });

      // Determinar el proveedor a usar
      const providerId =
        query.providerId ?? this.config.defaultProvider ?? 'gpt-4-medical';


      // Procesar la consulta con el proveedor adecuado
      const response = await this.executeWithRetry(() =>
        this.processWithProvider(providerId, query)
      );


      this.logger.debug('AI processing complete', {
        processingTime,
        providerId,
      });

      // Guardar en caché
      const metadata = {
        provider: providerId,
        cost: this.estimateCost(providerId, 1),
        processingTime,
      };
      await this.cacheService.set(cacheKey, response, metadata);
      this.logger.debug('Response cached');

      return response;
    } catch (error) {
      this.logger.error('Error in AI query', { error, query: query.query });
      throw new AIServiceError(
        'Error al procesar la consulta de IA',
        error as Error
      );
    }
  }

  private async processWithProvider(
    providerId: string,
    query: AIQuery
  ): Promise<AIResponse> {
    // Verificar si estamos en modo simulación
    if (this.simulationMode) {
      return this.generateSimulatedResponse(query);
    }

    // Obtener el proveedor solicitado


    // Si no se encuentra, intentar con el proveedor por defecto
    if (!provider) {
      this.logger.warn(
        `Provider ${providerId} not found, trying default provider`,
        {
          requestedProvider: providerId,
          availableProviders: this.aiProviders.map((p) => p.id),
        }
      );

      // Intentar con otro proveedor disponible
      const firstAvailableProvider = this.aiProviders.find(
        (provider: AIProviderClient) => provider.isReady()
      );

      if (firstAvailableProvider) {
        return firstAvailableProvider.processQuery(query);
      } else {
        // Caer en simulación si no hay proveedores disponibles
        this.logger.warn('No AI providers available, using simulation mode');
        return this.generateSimulatedResponse(query);
      }
    }

    // Usar el proveedor encontrado
    return provider.processQuery(query);
  }

  private generateCacheKey(query: AIQuery): string {
    return JSON.stringify(query);
  }

  getAvailableProviders(): AIProvider[] {
    return this.providers;
  }

  estimateCost(providerId: string, queryCount: number): number {
    // Si tenemos un proveedor real, usar su estimación

    if (provider) {
      // Crear una consulta de ejemplo para estimar
      const exampleQuery: AIQuery = {
        query: 'Consulta de ejemplo para estimación de costo',
      };
      return provider.estimateQueryCost(exampleQuery) * queryCount;
    }

    // Si no hay proveedor real, usar la estimación básica

    return providerInfo ? providerInfo.costPerQuery * queryCount : 0;
  }

  async analyzeEMRData(emrData: EMRData): Promise<AIResponse> {
    this.logger.info('Analyzing EMR data', { patientId: emrData.patientId });
    try {
      const context = {
        type: 'emr' as ContextType,
        data: emrData,
      };

      return await this.query({
        query: 'Analiza el historial médico y genera insights relevantes',
        patientId: emrData.patientId,
        context,
      });
    } catch (error) {
      this.logger.error('Error analyzing EMR data', {
        error,
        patientId: emrData.patientId,
      });
      throw new AIServiceError(
        'Error al analizar los datos del EMR',
        error as Error
      );
    }
  }

  async analyzeUnstructuredNote(note: UnstructuredNote): Promise<AIResponse> {
    this.logger.info('Analyzing single unstructured note', {
      type: note.type,
      timestamp: note.timestamp,
    });
    try {
      return await this.query({
        query:
          'Analiza la siguiente nota médica y extrae información relevante',
        unstructuredNotes: [note],
      });
    } catch (error) {
      this.logger.error('Error analyzing unstructured note', {
        error,
        noteType: note.type,
      });
      throw new AIServiceError(
        'Error al analizar la nota médica',
        error as Error
      );
    }
  }

  /**
   * Genera una respuesta simulada para propósitos de desarrollo
   */
  private generateSimulatedResponse(query: AIQuery): Promise<AIResponse> {
    this.logger.debug('Generating simulated response for query');

    // Simular un pequeño retraso para emular el procesamiento
    return new Promise<AIResponse>((resolve) => {
      setTimeout(() => {
        if (query.context?.type === 'emr' && query.unstructuredNotes) {
          resolve({
            answer: `Basado en el análisis de ${query.unstructuredNotes.length} notas médicas,
                        he organizado la información y detectado varios puntos importantes...`,
            confidence: 0.89,
            timeline: [
              {
                date: '2023-01-15',
                events: [
                  {
                    type: 'consultation',
                    description: 'Consulta inicial por dolor de rodilla',
                    source: 'Nota clínica',
                    confidence: 0.95,
                  },
                ],
              },
              {
                date: '2023-03-10',
                events: [
                  {
                    type: 'lab-result',
                    description:
                      'Resultados de resonancia magnética: desgarro de menisco',
                    source: 'Informe de radiología',
                    confidence: 0.98,
                  },
                ],
              },
            ],
            insights: [
              {
                type: 'missing-follow-up' as InsightType,
                description:
                  'El paciente no ha tenido seguimiento después del diagnóstico de desgarro de menisco',
                severity: 'medium',
                evidence: [
                  'Última visita: 10/03/2023',
                  'No hay registros de seguimiento para el plan de tratamiento',
                ],
                recommendation:
                  'Programar consulta de seguimiento con ortopedia',
              },
            ],
          });
        } else {
          resolve({
            answer:
              'He analizado la consulta pero necesito más contexto para proporcionar insights detallados.',
            confidence: 0.75,
          });
        }
      }, 500); // Simular 500ms de procesamiento
    });
  }

  /**
   * Configura el servicio con nuevas opciones
   */
  configure(config: Partial<AIServiceConfig>): void {
    Object.assign(this.config, config);
    this.setupProviders();
    this.logger.info('AIService reconfigured', {
      defaultProvider: this.config.defaultProvider,
      providersConfigured: this.aiProviders.map((p) => p.id),
    });
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return this.aiProviders.length > 0 || this.simulationMode;
  }

  /**
   * Verifica si el servicio está en modo simulación
   */
  isInSimulationMode(): boolean {
    return this.simulationMode;
  }

  /**
   * Activa o desactiva el modo simulación
   */
  setSimulationMode(enabled: boolean): void {
    this.simulationMode = enabled;
    this.logger.info(`Simulation mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Obtiene los registros de log del servicio
   */
  getLogs(): LogEntry[] {
    return this.logger.getLogs();
  }

  /**
   * Limpia los registros de log (útil para pruebas)
   */
  clearLogs(): void {
    this.logger.clearLogs();
  }
}

/**
 * Clase personalizada de error para el servicio de IA
 */
export class AIServiceError extends Error {
  originalError?: Error;
  timestamp: string;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'AIServiceError';
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

// Exportar una instancia por defecto
export
