import { Logger } from '../utils/logger';
import { 
  SoapData, 
  SpecialtyType, 
  SOAPSection,
  EvidenceLevel,
  ClinicalRelevance,
  AISuggestion
} from '../types/clinical.types';
import { aiHealthConfig, AIHealthServiceConfig } from '../config/aiHealthConfig';
import { CacheManager } from './cache/CacheManager';
import { CacheStats } from './cache/types';
import { clinicalRules, ClinicalRule } from './clinicalRules';
import { PerformanceMonitor } from './performance/PerformanceMonitor';

/**
 * Tipos de sugerencias que puede generar la IA
 */
export type AISuggestionType = 'info' | 'warning' | 'required' | 'recommendation';

/**
 * Niveles de prioridad para las sugerencias
 */
export type AIPriorityLevel = 'high' | 'medium' | 'low';

/**
 * Interfaz para la respuesta del servicio de IA
 */
export interface AIHealthResponse {
  suggestions: AISuggestion[];
  processingTime?: number; // Tiempo de procesamiento en ms
  modelVersion?: string; // Versión del modelo utilizado
  requestId?: string; // ID único de la solicitud para seguimiento
  metadata?: Record<string, unknown>;
}

/**
 * Opciones para la solicitud de análisis
 */
export interface AIAnalysisOptions {
  specialty?: SpecialtyType;
  activeSection?: SOAPSection;
  patientContext?: {
    age?: number;
    gender?: string;
    knownConditions?: string[];
    medications?: string[];
    lastVisit?: Date;
    visitCount?: number;
  };
  includeGuidelines?: boolean;
  maxSuggestions?: number;
  minConfidence?: number;
  language?: 'es' | 'en';
}

/**
 * Servicio que proporciona funcionalidades de IA para salud
 * Actúa como capa de abstracción para diferentes implementaciones (reglas locales, APIs externas, etc.)
 */
export class AIHealthService {
  private static instance: AIHealthService;
  private readonly suggestionCache: CacheManager<AIHealthResponse>;
  private readonly pendingRequests: Map<string, Promise<AIHealthResponse>> = new Map();
  private config: AIHealthServiceConfig;
  private readonly performanceMonitor: PerformanceMonitor;
  private logger: Logger;

  private constructor(config: AIHealthServiceConfig = aiHealthConfig) {
    this.config = config;
    this.suggestionCache = new CacheManager<AIHealthResponse>({
      ttlMs: config.cache.ttlMs,
      maxSize: config.cache.maxEntries,
      cleanupInterval: 60000, // Limpiar cada minuto
      patientBased: true
    });
    
    // Inicializar el monitor de rendimiento
    this.performanceMonitor = PerformanceMonitor.getInstance();

    // Configuración inicial de logging
    if (config.logging.level === 'debug') {
      console.debug('[AIHealthService] Inicializado con modo:', config.mode);
    }

    this.logger = new Logger('AIHealthService');
  }

  public static getInstance(config?: AIHealthServiceConfig): AIHealthService {
    if (!AIHealthService.instance) {
      AIHealthService.instance = new AIHealthService(config);
    } else if (config) {
      // Si ya existe una instancia pero se proporciona una nueva configuración, actualizarla
      AIHealthService.instance.updateConfig(config);
    }
    return AIHealthService.instance;
  }

  /**
   * Actualiza la configuración del servicio
   */
  public updateConfig(config: AIHealthServiceConfig): void {
    this.config = config;
    this.suggestionCache.updateConfig({
      ttlMs: config.cache.ttlMs,
      maxSize: config.cache.maxEntries,
      cleanupInterval: 60000, // Limpiar cada minuto
      patientBased: true
    });
    
    // Limpiar caché si se deshabilita
    if (!config.cache.enabled) {
      this.clearCache();
    }
    
    if (config.logging.level === 'debug') {
      console.debug('[AIHealthService] Configuración actualizada:', config.mode);
    }
  }

  /**
   * Analiza los datos SOAP y genera sugerencias clínicas
   * 
   * @param soapData Datos SOAP del paciente
   * @param options Opciones adicionales para el análisis
   * @returns Respuesta con sugerencias clínicas
   */
  public async analyzeClinicalData(
    soapData: SoapData, 
    options: AIAnalysisOptions = {}
  ): Promise<AIHealthResponse> {
    // Iniciar medición de rendimiento
    const perfMetricId = this.performanceMonitor.startMeasure(
      'analyzeClinicalData',
      'api',
      { patientId: soapData.patientId, section: options.activeSection }
    );
    
    const cacheKey = this.generateRequestKey(soapData, options);
    
    // Verificar caché
    const cachedResponse = this.suggestionCache.get(cacheKey);
    if (cachedResponse) {
      if (this.config.logging.level === 'debug') {
        console.debug('[AIHealthService] Respuesta obtenida de caché');
      }
      
      // Finalizar medición (caché hit)
      this.performanceMonitor.endMeasure(perfMetricId);
      return cachedResponse;
    }

    // Verificar solicitudes pendientes
    if (this.pendingRequests.has(cacheKey)) {
      // Iniciar nueva medición para solicitud pendiente
      const pendingMetricId = this.performanceMonitor.startMeasure(
        'pendingRequest',
        'api',
        { patientId: soapData.patientId, section: options.activeSection }
      );
      
      try {
        const result = await this.pendingRequests.get(cacheKey)!;
        return result;
      } finally {
        // Finalizar medición de solicitud pendiente
        this.performanceMonitor.endMeasure(pendingMetricId);
      }
    }

    const analysisPromise = this.performAnalysis(soapData, options);
    this.pendingRequests.set(cacheKey, analysisPromise);

    try {
      const result = await analysisPromise;
      
      // Almacenar en caché con metadatos del paciente
      this.suggestionCache.set(cacheKey, result, {
        patientId: soapData.patientId,
        section: options.activeSection,
        lastAccess: Date.now(),
        accessCount: 1,
        size: JSON.stringify(result).length
      });
      
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
      // Finalizar medición de rendimiento
      this.performanceMonitor.endMeasure(perfMetricId);
    }
  }

  /**
   * Realiza el análisis de los datos según el modo configurado
   */
  private async performAnalysis(
    soapData: SoapData,
    options: AIAnalysisOptions
  ): Promise<AIHealthResponse> {
    // Medir rendimiento específico de cada tipo de análisis
    const analysisMetricId = this.performanceMonitor.startMeasure(
      `analysis_${this.config.mode}`,
      'calculation',
      { patientId: soapData.patientId, section: options.activeSection }
    );
    
    try {
      switch (this.config.mode) {
        case 'local': {
          const localSuggestions = await this.getLocalRuleSuggestions(soapData, options);
          return {
            suggestions: localSuggestions,
            processingTime: 0,
            modelVersion: 'rules-v1.0',
            requestId: `local-${Date.now()}`
          };
        }
        case 'remote':
          return await this.getAPISuggestions(soapData, options);
        case 'hybrid':
          return await this.getHybridSuggestions(soapData, options);
        default:
          throw new Error(`Modo no soportado: ${this.config.mode}`);
      }
    } finally {
      // Finalizar medición de rendimiento del análisis
      this.performanceMonitor.endMeasure(analysisMetricId);
    }
  }

  /**
   * Obtiene sugerencias mediante un enfoque híbrido (reglas + API)
   */
  private async getHybridSuggestions(
    soapData: SoapData,
    options: AIAnalysisOptions
  ): Promise<AIHealthResponse> {
    // Primero obtenemos sugerencias de reglas locales
    const ruleSuggestions = await this.getLocalRuleSuggestions(soapData, options);
    
    try {
      // Luego intentamos obtener sugerencias de la API
      const apiResponse = await this.getAPISuggestions(soapData, options);
      
      // Combinar ambas fuentes de sugerencias
      const allSuggestions = [...ruleSuggestions, ...apiResponse.suggestions];
      
      // Eliminar duplicados y ordenar por prioridad
      const uniqueSuggestions = this.removeDuplicateSuggestions(allSuggestions);
      
      return {
        suggestions: uniqueSuggestions,
        processingTime: apiResponse.processingTime,
        modelVersion: apiResponse.modelVersion,
        requestId: apiResponse.requestId,
        metadata: {
          ...apiResponse.metadata,
          hybridSource: 'rules+api'
        }
      };
    } catch (error) {
      // Si la API falla, devolvemos solo las sugerencias de reglas
      console.error('[AIHealthService] Error al obtener sugerencias de API:', error);
      return {
        suggestions: ruleSuggestions,
        processingTime: 0,
        modelVersion: 'hybrid-fallback-1.0',
        requestId: `hybrid-fallback-${Date.now()}`,
        metadata: {
          hybridSource: 'rules-only',
          fallbackReason: 'api-error'
        }
      };
    }
  }

  /**
   * Obtiene sugerencias basadas en reglas locales
   */
  private async getRuleBasedSuggestions(
    soapData: SoapData, 
    options: AIAnalysisOptions
  ): Promise<AIHealthResponse> {
    const startTime = Date.now();
    // Obtenemos las sugerencias desde el motor de reglas
    const ruleSuggestions = await this.getLocalRuleSuggestions(soapData, options);
    
    // Creamos la respuesta con el formato AIHealthResponse
    return {
      suggestions: ruleSuggestions,
      processingTime: Date.now() - startTime,
      modelVersion: 'rules-v1.0',
      requestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
  }

  /**
   * Filtra las reglas clínicas relevantes según la especialidad y sección activa
   */
  private getRelevantRules(specialty: SpecialtyType, activeSection?: SOAPSection): ClinicalRule[] {
    // Obtener las reglas para la especialidad
    const specialtyRules = clinicalRules[specialty] ?? [];
    const generalRules = specialty !== 'general' ? clinicalRules['general'] ?? [] : [];
    
    // Combinar reglas específicas de la especialidad y reglas generales
    let combinedRules = [...specialtyRules, ...generalRules];
    
    // Filtrar por sección activa si se especifica
    if (activeSection) {
      combinedRules = combinedRules.filter(rule => 
        rule.suggestion.section === activeSection
      );
    }
    
    return combinedRules;
  }

  /**
   * Motor de reglas local para generar sugerencias
   */
  private async getLocalRuleSuggestions(
    soapData: SoapData, 
    options: AIAnalysisOptions
  ): Promise<AISuggestion[]> {
    const specialty = options.specialty ?? soapData.specialty ?? 'general';
    const activeSection = options.activeSection;
    
    const relevantRules = this.getRelevantRules(specialty, activeSection);
    
    const suggestions: AISuggestion[] = [];
    
    // Aplicar cada regla al conjunto de datos
    for (const rule of relevantRules) {
      try {
        if (rule.condition(soapData)) {
          // Si la condición de la regla se cumple, crear una sugerencia
          const suggestion: AISuggestion = {
            id: `rule-${rule.id}-${Date.now()}`,
            type: rule.suggestion.type,
            title: rule.suggestion.title,
            description: rule.suggestion.description,
            section: rule.suggestion.section,
            field: rule.suggestion.field,
            priority: rule.suggestion.priority,
            confidence: rule.suggestion.confidence,
            source: 'rule',
            metadata: {
              evidenceLevel: rule.suggestion.evidenceLevel,
              clinicalRelevance: rule.suggestion.clinicalRelevance,
              specialtySpecific: rule.suggestion.specialtySpecific,
              ruleId: rule.id
            },
            contextFactors: rule.suggestion.contextFactors
          };
          
          // Calcular puntaje basado en diversos factores
          const score = this.calculateSuggestionScore(
            suggestion,
            options.patientContext,
            rule.suggestion.evidenceLevel,
            rule.suggestion.clinicalRelevance
          );
          
          // Añadir puntaje como confianza normalizada
          suggestion.confidence = Math.min(1, Math.max(0, score));
          
          // Aplicar filtro de confianza mínima
          if (!options.minConfidence || suggestion.confidence >= options.minConfidence) {
            suggestions.push(suggestion);
          }
        }
      } catch (error) {
        // Si una regla falla, registrar el error pero continuar con las demás
        console.error(`Error al procesar regla ${rule.id}:`, error);
      }
    }
    
    // Ordenar por prioridad y confianza
    return this.removeDuplicateSuggestions(suggestions)
      .sort((a, b) => {
        // Primero por prioridad
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Luego por confianza
        return (b.confidence ?? 0) - (a.confidence ?? 0);
      })
      .slice(0, options.maxSuggestions ?? this.config.localRules.maxSuggestionsPerSection);
  }

  /**
   * Calcula una puntuación para una sugerencia basada en factores clínicos y contexto del paciente
   */
  private calculateSuggestionScore(
    suggestion: AISuggestion,
    patientContext: AIAnalysisOptions['patientContext'] = {},
    evidenceLevel: EvidenceLevel,
    clinicalRelevance: ClinicalRelevance = ClinicalRelevance.IMPORTANT
  ): number {
    let score = evidenceLevel * clinicalRelevance; // Base score

    // Ajustar por tipo de prioridad
    const priorityWeight = this.determineScoreByPriority(suggestion);
    
    score *= priorityWeight;

    // Ajustar por edad si aplica
    if (patientContext.age && suggestion.contextFactors?.age) {
      score *= this.calculateAgeFactor(patientContext.age, suggestion.contextFactors.age);
    }

    // Ajustar por condiciones conocidas
    if (patientContext.knownConditions?.length && suggestion.contextFactors?.conditions?.length) {
      score *= this.calculateConditionFactor(
        patientContext.knownConditions,
        suggestion.contextFactors.conditions
      );
    }

    return score;
  }

  private determineScoreByPriority(suggestion: AISuggestion): number {
    if (suggestion.priority === 'high') {
      return 1.5;
    } else if (suggestion.priority === 'medium') {
      return 1.0;
    } else {
      return 0.7;
    }
  }

  private calculateAgeFactor(patientAge: number, ageRange?: number[]): number {
    if (!ageRange) return 1.0;
    const [minAge, maxAge] = ageRange;
    if (patientAge >= minAge && patientAge <= maxAge) return 1.0;
    return 0.7; // Penalización por edad fuera del rango recomendado
  }

  private calculateConditionFactor(
    patientConditions: string[],
    relevantConditions: string[]
  ): number {
    const matches = patientConditions.filter(condition =>
      relevantConditions.some(relevant => 
        condition.toLowerCase().includes(relevant.toLowerCase())
      )
    ).length;
    
    return 0.5 + (matches / relevantConditions.length) * 0.5;
  }

  /**
   * Elimina sugerencias duplicadas y las ordena por prioridad
   */
  private removeDuplicateSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
    const uniqueMap = new Map<string, AISuggestion>();
    
    for (const suggestion of suggestions) {
      const key = `${suggestion.section}-${suggestion.field || ''}-${suggestion.title}`;
      
      if (!uniqueMap.has(key) || this.getSuggestionWeight(suggestion) > this.getSuggestionWeight(uniqueMap.get(key)!)) {
        uniqueMap.set(key, suggestion);
      }
    }
    
    return Array.from(uniqueMap.values())
      .sort((a, b) => this.getSuggestionWeight(b) - this.getSuggestionWeight(a));
  }

  /**
   * Asigna un peso a una sugerencia basado en su prioridad y confianza
   */
  private getSuggestionWeight(suggestion: AISuggestion): number {
    const priorityWeight = { high: 3, medium: 2, low: 1 }[suggestion.priority] || 0;
    const confidenceWeight = suggestion.confidence || 0.5;
    const sourceWeight = { rule: 0.8, model: 1.0, guideline: 0.9, patient_history: 0.7 }[suggestion.source || 'rule'] || 0.5;
    
    return priorityWeight * confidenceWeight * sourceWeight;
  }

  /**
   * Validación básica del formato SOAP
   */
  private validateSOAPFormat(soapData: SoapData): void {
    if (!soapData.patientId) {
      throw new Error('SOAP data must include patientId');
    }
    
    // Podríamos agregar más validaciones aquí si es necesario
  }

  /**
   * Simulación de llamada a API remota (se reemplazaría por la llamada real)
   */
  private async simulateRemoteApiCall(
    soapData: SoapData, 
    options: AIAnalysisOptions
  ): Promise<AISuggestion[]> {
    // Esta función es una simulación y en el futuro se reemplazaría
    // por una llamada a una API externa como OpenAI
    
    // Simulamos latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Por ahora, solo devolvemos las mismas sugerencias que generaríamos localmente
    // pero marcadas como provenientes del modelo
    const suggestions = await this.getLocalRuleSuggestions(soapData, options);
    
    return suggestions.map(suggestion => ({
      ...suggestion,
      source: 'model',
      confidence: (suggestion.confidence || 0.8) + 0.1 // Simulamos mayor confianza
    }));
  }

  /**
   * Calcula el API request para obtener las sugerencias
   */
  private async getAPISuggestions(
    soapData: SoapData,
    options: AIAnalysisOptions
  ): Promise<AIHealthResponse> {
    const startTime = Date.now();
    
    // Verificar que la configuración remota exista
    if (!this.config.remoteApi) {
      if (this.config.logging.level === 'warn' || this.config.logging.level === 'error') {
        console.warn('[AIHealthService] Configuración remota no definida, usando reglas locales');
      }
      return this.getRuleBasedSuggestions(soapData, options);
    }
    
    // Medir rendimiento específico de la llamada a la API
    const apiMetricId = this.performanceMonitor.startMeasure(
      'api_request',
      'api',
      { patientId: soapData.patientId }
    );
    
    try {
      // En un entorno real, aquí se haría la llamada a la API
      const apiSuggestions = await this.simulateRemoteApiCall(soapData, options);
      
      // Preparar la respuesta
      const response: AIHealthResponse = {
        suggestions: apiSuggestions,
        processingTime: Date.now() - startTime,
        modelVersion: 'api-v1.0',
        requestId: `api-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        metadata: {
          endpoint: this.config.remoteApi.baseUrl,
          responseTime: Date.now() - startTime
        }
      };
      
      return response;
    } catch (err) {
      // Log del error
      console.error('[AIHealthService] Error en la llamada a la API:', err);
      
      // Usar reglas locales como fallback si está habilitado
      if (this.config.localRules.enabled) {
        if (this.config.logging.level === 'warn' || this.config.logging.level === 'error') {
          console.warn('[AIHealthService] Fallback a reglas locales debido a error en API');
        }
        return this.getRuleBasedSuggestions(soapData, options);
      }
      
      // Si no hay fallback, devolver una respuesta vacía
      return {
        suggestions: [],
        processingTime: Date.now() - startTime,
        requestId: `api-error-${Date.now()}`,
        metadata: { error: 'API call failed' }
      };
    } finally {
      // Finalizar medición de rendimiento de la API
      this.performanceMonitor.endMeasure(apiMetricId);
    }
  }

  // Obtener recomendaciones de rendimiento
  public getPerformanceInsights(): {
    slowestOperations: Array<{ id: string, avgDuration: number, count: number, type: string }>;
    recommendations: string[];
  } {
    return this.performanceMonitor.analyzePerformance();
  }

  /**
   * Genera una clave única para identificar solicitudes similares
   */
  private generateRequestKey(soapData: SoapData, options: AIAnalysisOptions): string {
    // Creamos una firma simplificada de los datos SOAP
    const dataSignature = {
      subjective: soapData.subjective ? {
        chiefComplaint: soapData.subjective.chiefComplaint,
        medicalHistory: soapData.subjective.medicalHistory,
        currentMedications: soapData.subjective.currentMedications,
        painDescription: soapData.subjective.painDescription,
        onsetDate: soapData.subjective.onsetDate
      } : null,
      objective: soapData.objective ? {
        observation: soapData.objective.observation,
        romKeys: soapData.objective.rangeOfMotion ? Object.keys(soapData.objective.rangeOfMotion) : [],
        specialTests: soapData.objective.specialTests ? Object.keys(soapData.objective.specialTests) : []
      } : null,
      activeSection: options.activeSection,
      specialty: options.specialty
    };
    
    return JSON.stringify(dataSignature);
  }

  /**
   * Limpia el caché completamente
   */
  public clearCache(): void {
    this.suggestionCache.clear();
    
    if (this.config.logging.level === 'debug') {
      console.debug('[AIHealthService] Caché limpiado');
    }
  }

  public invalidatePatientCache(patientId: string): void {
    this.suggestionCache.invalidateByPatient(patientId);
    
    if (this.config.logging.level === 'debug') {
      console.debug(`[AIHealthService] Caché invalidado para paciente ${patientId}`);
    }
  }

  public invalidateSectionCache(section: string): void {
    this.suggestionCache.invalidateBySection(section);
    
    if (this.config.logging.level === 'debug') {
      console.debug(`[AIHealthService] Caché invalidado para sección ${section}`);
    }
  }

  public getCacheStats(): CacheStats {
    return this.suggestionCache.getStats();
  }

  /**
   * Proporciona feedback sobre una sugerencia específica
   * Útil para futura implementación de aprendizaje
   */
  public provideFeedback(suggestionId: string, isHelpful: boolean): void {
    // En el futuro, esta información podría enviarse a un sistema
    // de aprendizaje para mejorar las sugerencias
    if (this.config.logging.level === 'debug' || this.config.logging.level === 'info') {
      console.log(`[AIHealthService] Feedback para sugerencia ${suggestionId}: ${isHelpful ? 'útil' : 'no útil'}`);
    }
  }
} 