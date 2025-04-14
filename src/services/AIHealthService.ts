import { 
  SubjectiveData, 
  ObjectiveData, 
  SpecialtyType,
  SOAPData
} from '../types/clinical';
import { aiHealthConfig, AIHealthServiceConfig } from '../config/aiHealthConfig';
import { CacheManager } from './cache/CacheManager';
import { CacheStats } from './cache/types';

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
  metadata?: Record<string, unknown>; // Metadatos adicionales, útil para sugerencias específicas
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
    const { subjective, objective } = soapData;
    const { activeSection } = options;
    // specialty está disponible para uso futuro en reglas específicas por especialidad
    // const { specialty } = options;

    // Solo procesamos reglas para la sección activa si está especificada
    if (activeSection && activeSection !== 'subjective' && activeSection !== 'objective') {
      return suggestions;
    }

    // Reglas para sección subjetiva
    if ((!activeSection || activeSection === 'subjective') && subjective) {
      // Verificar si se menciona prótesis
      const hasProsthesisMention = this.checkForProsthesisMention(subjective);
      
      if (hasProsthesisMention) {
        // Verificar fecha de cirugía
        if (!subjective.onsetDate) {
          suggestions.push({
            id: 'missing_surgery_date',
            type: 'required',
            title: 'Fecha de cirugía faltante',
            description: 'Documenta la fecha exacta de la cirugía de prótesis para mejor seguimiento clínico.',
            section: 'subjective',
            field: 'onsetDate',
            priority: 'high',
            source: 'rule',
            confidence: 0.95
          });
        }
        
        // Verificar medicación actual
        if (!subjective.currentMedications) {
          suggestions.push({
            id: 'missing_medication',
            type: 'warning',
            title: 'Medicación actual no documentada',
            description: 'Verifica si el paciente toma anticoagulantes u otros medicamentos relevantes post-cirugía.',
            section: 'subjective',
            field: 'currentMedications',
            priority: 'high',
            source: 'rule',
            confidence: 0.9
          });
        }
      }
      
      // Verificar si falta información sobre el dolor
      if (subjective.chiefComplaint && !subjective.painDescription && !subjective.painIntensity) {
        suggestions.push({
          id: 'missing_pain_data',
          type: 'recommendation',
          title: 'Información sobre dolor incompleta',
          description: 'Considera documentar características e intensidad del dolor para una evaluación más completa.',
          section: 'subjective',
          field: 'painDescription',
          priority: 'medium',
          source: 'rule',
          confidence: 0.85
        });
      }
    }
    
    // Reglas para sección objetiva
    if ((!activeSection || activeSection === 'objective') && objective && subjective) {
      // Verificar evaluación bilateral si se menciona rodilla
      const hasKneeMention = this.checkForKneeMention(subjective);
      const hasKneeData = Boolean(objective.rangeOfMotion?.['knee_right'] || objective.rangeOfMotion?.['knee_left']);
      const hasBothKnees = Boolean(objective.rangeOfMotion?.['knee_right'] && objective.rangeOfMotion?.['knee_left']);
      
      if (hasKneeMention && hasKneeData && !hasBothKnees) {
        suggestions.push({
          id: 'missing_contralateral_knee',
          type: 'recommendation',
          title: 'Evaluación de rodilla contralateral',
          description: 'Considera evaluar el estado de la rodilla contralateral para comparación y detección de factores compensatorios.',
          section: 'objective',
          priority: 'medium',
          source: 'rule',
          confidence: 0.8
        });
      }
      
      // Verificar si se mencionan imágenes en caso de prótesis
      const hasProsthesisMention = this.checkForProsthesisMention(subjective);
      const hasImagesReference = this.checkForImagesReference(subjective, objective);
      
      if (hasProsthesisMention && !hasImagesReference) {
        suggestions.push({
          id: 'missing_images',
          type: 'recommendation',
          title: 'Solicitud de imágenes',
          description: 'Considera solicitar radiografías de control para verificar el estado y alineación de la prótesis.',
          section: 'objective',
          priority: 'medium',
          source: 'rule',
          confidence: 0.85
        });
      }
    }
    
    // Aplicar umbral de confianza mínima de la configuración
    const filteredSuggestions = suggestions.filter(
      suggestion => (suggestion.confidence || 0) >= this.config.localRules.minConfidence
    );
    
    // Limitar número de sugerencias según configuración o parámetros
    const maxSuggestions = options.maxSuggestions || 
      this.config.localRules.maxSuggestionsPerSection;
    
    if (maxSuggestions && filteredSuggestions.length > maxSuggestions) {
      // Ordenar por prioridad y luego por confianza
      return filteredSuggestions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          return (b.confidence || 0) - (a.confidence || 0);
        })
        .slice(0, maxSuggestions);
    }
    
    return filteredSuggestions;
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
} 