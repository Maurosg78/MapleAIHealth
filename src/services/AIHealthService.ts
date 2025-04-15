import { 
  SubjectiveData, 
  ObjectiveData, 
  SpecialtyType,
  SOAPData
} from '../types/clinical';
import { aiHealthConfig, AIHealthServiceConfig } from '../config/aiHealthConfig';
import { CacheManager } from './cache/CacheManager';
import { CacheStats } from './cache/types';
import { clinicalRules, EvidenceLevel, ClinicalRelevance } from './clinicalRules';

/**
 * Tipos de sugerencias que puede generar la IA
 */
export type AISuggestionType = 'info' | 'warning' | 'required' | 'recommendation';

/**
 * Niveles de prioridad para las sugerencias
 */
export type AIPriorityLevel = 'high' | 'medium' | 'low';

/**
 * Secciones SOAP donde se puede aplicar una sugerencia
 */
export type SOAPSection = 'subjective' | 'objective' | 'assessment' | 'plan';

/**
 * Interfaz para una sugerencia individual generada por IA
 */
export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  title: string;
  description: string;
  section: SOAPSection;
  field?: string;
  priority: AIPriorityLevel;
  confidence?: number; // Nivel de confianza de 0 a 1
  source?: 'rule' | 'model' | 'guideline'; // Origen de la sugerencia
  metadata?: {
    evidenceLevel?: EvidenceLevel;
    clinicalRelevance?: ClinicalRelevance;
    specialtySpecific?: boolean;
  };
  contextFactors?: {
    age?: number[];
    gender?: string[];
    conditions?: string[];
  };
}

/**
 * Interfaz para la respuesta del servicio de IA
 */
export interface AIHealthResponse {
  suggestions: AISuggestion[];
  processingTime?: number; // Tiempo de procesamiento en ms
  modelVersion?: string; // Versión del modelo utilizado
  requestId?: string; // ID único de la solicitud para seguimiento
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
  };
  includeGuidelines?: boolean; // Si se deben incluir guías clínicas en las sugerencias
  maxSuggestions?: number; // Número máximo de sugerencias a retornar
  minConfidence?: number; // Nivel mínimo de confianza para incluir sugerencias
}

/**
 * Servicio que proporciona funcionalidades de IA para salud
 * Actúa como capa de abstracción para diferentes implementaciones (reglas locales, APIs externas, etc.)
 */
export class AIHealthService {
  private static instance: AIHealthService;
  private suggestionCache: CacheManager<AIHealthResponse>;
  private pendingRequests: Map<string, Promise<AIHealthResponse>> = new Map();
  private config: AIHealthServiceConfig;

  private constructor(config: AIHealthServiceConfig = aiHealthConfig) {
    this.config = config;
    this.suggestionCache = new CacheManager<AIHealthResponse>({
      ttlMs: config.cache.ttlMs,
      maxSize: config.cache.maxEntries,
      cleanupInterval: 60000, // Limpiar cada minuto
      patientBased: true
    });

    // Configuración inicial de logging
    if (config.logging.level === 'debug') {
      console.debug('[AIHealthService] Inicializado con modo:', config.mode);
    }
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
    soapData: SOAPData, 
    options: AIAnalysisOptions = {}
  ): Promise<AIHealthResponse> {
    const cacheKey = this.generateRequestKey(soapData, options);
    
    // Verificar caché
    const cachedResponse = this.suggestionCache.get(cacheKey);
    if (cachedResponse) {
      if (this.config.logging.level === 'debug') {
        console.debug('[AIHealthService] Respuesta obtenida de caché');
      }
      return cachedResponse;
    }

    // Verificar solicitudes pendientes
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const analysisPromise = this.performAnalysis(soapData, options);
    this.pendingRequests.set(cacheKey, analysisPromise);

    try {
      const result = await analysisPromise;
      
      // Almacenar en caché con metadatos del paciente
      this.suggestionCache.set(cacheKey, result, {
        patientId: soapData.patientId,
        section: options.activeSection
      });
      
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Realizar el análisis real de los datos
   * Esta es la función que se reemplazaría con llamadas a APIs externas
   */
  private async performAnalysis(
    soapData: SOAPData, 
    options: AIAnalysisOptions
  ): Promise<AIHealthResponse> {
    try {
      // Simulamos un tiempo de procesamiento para emular una llamada a API
      const startTime = Date.now();
      
      let suggestions: AISuggestion[] = [];
      
      // Variables para promesas y resultados
      let localSuggestions: AISuggestion[] = [];
      let remoteSuggestions: AISuggestion[] = [];
      let localPromise: Promise<AISuggestion[]>;
      let remotePromise: Promise<AISuggestion[]>;
      const combinedMap = new Map<string, AISuggestion>();
      
      // Decidir qué tipo de análisis realizar en función del modo configurado
      switch (this.config.mode) {
        case 'local':
          // Usar solo reglas locales
          if (this.config.localRules.enabled) {
            suggestions = await this.getLocalRuleSuggestions(soapData, options);
          }
          break;
          
        case 'remote':
          // Usar solo API remota (simulado por ahora)
          if (this.config.remoteApi) {
            suggestions = await this.simulateRemoteApiCall(soapData, options);
          }
          break;
          
        case 'hybrid':
        default:
          // Combinar resultados de reglas locales y API remota
          localPromise = this.config.localRules.enabled 
            ? this.getLocalRuleSuggestions(soapData, options)
            : Promise.resolve([]);
            
          remotePromise = this.config.remoteApi
            ? this.simulateRemoteApiCall(soapData, options)
            : Promise.resolve([]);
            
          [localSuggestions, remoteSuggestions] = await Promise.all([
            localPromise,
            remotePromise
          ]);
          
          // Combinar y deduplicar por ID
          
          // Priorizar sugerencias remotas (modelo) sobre locales (reglas)
          localSuggestions.forEach(suggestion => {
            combinedMap.set(suggestion.id, suggestion);
          });
          
          remoteSuggestions.forEach(suggestion => {
            combinedMap.set(suggestion.id, suggestion);
          });
          
          suggestions = Array.from(combinedMap.values());
          break;
      }
      
      const processingTime = Date.now() - startTime;
      
      if (this.config.logging.level === 'debug' || this.config.logging.level === 'info') {
        console.log(`[AIHealthService] Análisis completado en ${processingTime}ms. ${suggestions.length} sugerencias generadas.`);
      }
      
      return {
        suggestions,
        processingTime,
        modelVersion: this.config.mode === 'local' ? "local-rules-v1.0" : "api-model-v1.0",
        requestId: `req_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
      };
    } catch (error) {
      console.error("[AIHealthService] Error analyzing clinical data:", error);
      // Retornar respuesta vacía en caso de error
      return { suggestions: [] };
    }
  }

  /**
   * Simulación de llamada a API remota (se reemplazaría por la llamada real)
   */
  private async simulateRemoteApiCall(
    soapData: SOAPData, 
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
   * Motor de reglas local para generar sugerencias
   * En el futuro, este método podría complementarse o reemplazarse
   * con llamadas a modelos de IA externos
   */
  private async getLocalRuleSuggestions(
    soapData: SOAPData, 
    options: AIAnalysisOptions
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    const { specialty = 'physiotherapy', patientContext } = options;

    // Obtener reglas específicas de la especialidad
    const specialtyRules = clinicalRules[specialty] || [];
    const generalRules = clinicalRules.general || [];

    // Aplicar reglas de la especialidad
    for (const rule of specialtyRules) {
      if (rule.condition(soapData)) {
        const score = this.calculateSuggestionScore(
          {
            id: rule.id,
            type: rule.suggestion.type,
            title: rule.suggestion.title,
            description: rule.suggestion.description,
            section: rule.suggestion.section,
            field: rule.suggestion.field,
            priority: rule.suggestion.priority,
            source: 'rule',
            confidence: rule.suggestion.confidence
          },
          patientContext,
          rule.suggestion.evidenceLevel,
          rule.suggestion.clinicalRelevance
        );

        if (score >= this.config.localRules.minConfidence) {
          suggestions.push({
            id: rule.id,
            type: rule.suggestion.type,
            title: rule.suggestion.title,
            description: rule.suggestion.description,
            section: rule.suggestion.section,
            field: rule.suggestion.field,
            priority: rule.suggestion.priority,
            source: 'rule',
            confidence: score,
            metadata: {
              evidenceLevel: rule.suggestion.evidenceLevel,
              clinicalRelevance: rule.suggestion.clinicalRelevance,
              specialtySpecific: rule.suggestion.specialtySpecific
            }
          });
        }
      }
    }

    // Aplicar reglas generales
    for (const rule of generalRules) {
      if (rule.condition(soapData)) {
        const score = this.calculateSuggestionScore(
          {
            id: rule.id,
            type: rule.suggestion.type,
            title: rule.suggestion.title,
            description: rule.suggestion.description,
            section: rule.suggestion.section,
            field: rule.suggestion.field,
            priority: rule.suggestion.priority,
            source: 'rule',
            confidence: rule.suggestion.confidence
          },
          patientContext,
          rule.suggestion.evidenceLevel,
          rule.suggestion.clinicalRelevance
        );

        if (score >= this.config.localRules.minConfidence) {
          suggestions.push({
            id: rule.id,
            type: rule.suggestion.type,
            title: rule.suggestion.title,
            description: rule.suggestion.description,
            section: rule.suggestion.section,
            field: rule.suggestion.field,
            priority: rule.suggestion.priority,
            source: 'rule',
            confidence: score,
            metadata: {
              evidenceLevel: rule.suggestion.evidenceLevel,
              clinicalRelevance: rule.suggestion.clinicalRelevance,
              specialtySpecific: rule.suggestion.specialtySpecific
            }
          });
        }
      }
    }

    // Ordenar sugerencias por score
    return suggestions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }
  
  // Helpers para las reglas
  
  private checkForProsthesisMention(subjective: SubjectiveData): boolean {
    const textToCheck = [
      subjective.chiefComplaint || '',
      subjective.medicalHistory || '',
      subjective.painDescription || ''
    ].join(' ').toLowerCase();
    
    return textToCheck.includes('prótesis') || 
           textToCheck.includes('protesis') || 
           textToCheck.includes('ptr') ||
           textToCheck.includes('implante') ||
           textToCheck.includes('reemplazo articular');
  }
  
  private checkForKneeMention(subjective: SubjectiveData): boolean {
    const textToCheck = [
      subjective.chiefComplaint || '',
      subjective.medicalHistory || '',
      subjective.painDescription || ''
    ].join(' ').toLowerCase();
    
    return textToCheck.includes('rodilla') || 
           textToCheck.includes('knee') || 
           textToCheck.includes('rotulian');
  }
  
  private checkForImagesReference(subjective: SubjectiveData, objective: ObjectiveData): boolean {
    const subjectiveText = [
      subjective.medicalHistory || ''
    ].join(' ').toLowerCase();
    
    const objectiveText = [
      objective.observation || ''
    ].join(' ').toLowerCase();
    
    return subjectiveText.includes('radiograf') || 
           subjectiveText.includes('imagen') ||
           subjectiveText.includes('rayos x') ||
           subjectiveText.includes('tomograf') ||
           subjectiveText.includes('resonancia') ||
           objectiveText.includes('radiograf') ||
           objectiveText.includes('imagen') ||
           objectiveText.includes('rayos x') ||
           objectiveText.includes('tomograf') ||
           objectiveText.includes('resonancia');
  }

  /**
   * Genera una clave única para identificar solicitudes similares
   */
  private generateRequestKey(soapData: SOAPData, options: AIAnalysisOptions): string {
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

  private calculateSuggestionScore(
    suggestion: AISuggestion,
    patientContext: AIAnalysisOptions['patientContext'] = {},
    evidenceLevel: EvidenceLevel,
    clinicalRelevance: ClinicalRelevance
  ): number {
    let score = 1.0;

    // Factor de evidencia
    score *= evidenceLevel;

    // Factor de relevancia clínica
    score *= clinicalRelevance;

    // Factor de edad
    if (patientContext.age) {
      const ageFactor = this.calculateAgeFactor(patientContext.age, suggestion.contextFactors?.age);
      score *= ageFactor;
    }

    // Factor de género
    if (patientContext.gender && suggestion.contextFactors?.gender) {
      const genderFactor = suggestion.contextFactors.gender.includes(patientContext.gender) ? 1.0 : 0.5;
      score *= genderFactor;
    }

    // Factor de condiciones
    if (patientContext.knownConditions && suggestion.contextFactors?.conditions) {
      const conditionFactor = this.calculateConditionFactor(
        patientContext.knownConditions,
        suggestion.contextFactors.conditions
      );
      score *= conditionFactor;
    }

    return score;
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
} 