import { Logger } from '../logger';
import { AIQuery } from '../types';

/**
 * Tipo de consulta para determinar TTL y estrategia de invalidación
 */
export type QueryCategory =
  | 'clinical-analysis'  // Análisis clínicos (menor TTL)
  | 'evidence-check'     // Verificación de evidencia (mayor TTL)
  | 'patient-history'    // Historia del paciente (TTL medio)
  | 'general'            // Consultas generales (TTL por defecto)
  | 'development'        // Consultas temporales (muy bajo TTL)
  | 'urgent';            // Consultas urgentes (no cachear)

/**
 * Etiquetas para agrupar consultas relacionadas
 */
export type CacheTag = string;

/**
 * Metadatos asociados a una entrada en caché
 */
export interface CacheMetadata {
  queryCategory: QueryCategory;
  tags: CacheTag[];
  patientId?: string;
  expiresAt: number;
  priority: number; // 0-100, mayor valor = mayor prioridad para mantener en caché
}

/**
 * Interfaz para la estrategia de invalidación inteligente de caché
 */
export interface ISmartCacheInvalidationStrategy {
  /**
   * Calcula el TTL para una consulta específica
   * @param query Consulta a evaluar
   * @returns TTL en milisegundos
   */
  calculateTTL(query: AIQuery): number;

  /**
   * Categoriza una consulta para determinar su estrategia de caché
   * @param query Consulta a categorizar
   * @returns Categoría de la consulta
   */
  categorizeQuery(query: AIQuery): QueryCategory;

  /**
   * Genera etiquetas para agrupar consultas relacionadas
   * @param query Consulta a etiquetar
   * @returns Lista de etiquetas
   */
  generateTags(query: AIQuery): CacheTag[];

  /**
   * Calcula la prioridad de una consulta para mantenerse en caché
   * @param query Consulta a evaluar
   * @returns Puntuación de prioridad (0-100)
   */
  calculatePriority(query: AIQuery): number;

  /**
   * Genera metadatos completos para una entrada de caché
   * @param query Consulta asociada a la entrada
   * @returns Metadatos de caché
   */
  generateMetadata(query: AIQuery): CacheMetadata;

  /**
   * Invalida todas las entradas relacionadas con etiquetas específicas
   * @param tags Etiquetas de las entradas a invalidar
   * @returns Promise con el número de entradas invalidadas
   */
  invalidateByTags(tags: CacheTag[]): Promise<number>;

  /**
   * Invalida todas las entradas relacionadas con un paciente
   * @param patientId ID del paciente
   * @returns Promise con el número de entradas invalidadas
   */
  invalidateByPatientId(patientId: string): Promise<number>;
}

/**
 * Implementación de la estrategia de invalidación inteligente de caché
 */
export class SmartCacheInvalidationStrategy implements ISmartCacheInvalidationStrategy {
  private static instance: SmartCacheInvalidationStrategy;
  private readonly logger: Logger;

  // TTL base para cada categoría (en milisegundos)
  private readonly baseTTL: Record<QueryCategory, number> = {
    'clinical-analysis': 2 * 60 * 60 * 1000, // 2 horas
    'evidence-check': 7 * 24 * 60 * 60 * 1000, // 7 días
    'patient-history': 12 * 60 * 60 * 1000, // 12 horas
    'general': 6 * 60 * 60 * 1000, // 6 horas
    'development': 5 * 60 * 1000, // 5 minutos
    'urgent': 0 // No cachear
  };

  // Palabras clave para categorización
  private readonly categoryKeywords: Record<QueryCategory, string[]> = {
    'clinical-analysis': ['analizar', 'análisis', 'diagnóstico', 'diagnóstica', 'evaluación'],
    'evidence-check': ['evidencia', 'estudio', 'investigación', 'bibliografía', 'paper'],
    'patient-history': ['historia', 'historial', 'antecedentes', 'evolución', 'paciente'],
    'urgent': ['urgente', 'inmediato', 'emergencia', 'crítico', 'grave'],
    'development': ['prueba', 'test', 'debug', 'desarrollo'],
    'general': []
  };

  /**
   * Constructor privado para implementar patrón singleton
   */
  private constructor() {
    this.logger = new Logger('SmartCacheInvalidationStrategy');
    this.logger.info('SmartCacheInvalidationStrategy initialized');
  }

  /**
   * Obtiene la instancia única
   */
  public static getInstance(): SmartCacheInvalidationStrategy {
    if (!SmartCacheInvalidationStrategy.instance) {
      SmartCacheInvalidationStrategy.instance = new SmartCacheInvalidationStrategy();
    }
    return SmartCacheInvalidationStrategy.instance;
  }

  /**
   * Calcula el TTL para una consulta específica
   * @param query Consulta a evaluar
   * @returns TTL en milisegundos
   */
  public calculateTTL(query: AIQuery): number {
    const category = this.categorizeQuery(query);
    let ttl = this.baseTTL[category];

    // Ajustar TTL según características específicas
    if (query.options?.maxTokens && query.options.maxTokens > 1000) {
      // Consultas complejas tienen mayor TTL para evitar recálculos costosos
      ttl *= 1.5;
    }

    // Consultas con contexto EMR tienen menor TTL porque los datos médicos cambian
    if (query.context?.type === 'emr') {
      ttl *= 0.8;
    }

    // Consultas sin paciente específico tienen mayor TTL
    if (!query.patientId) {
      ttl *= 1.3;
    }

    this.logger.debug('TTL calculated', {
      category,
      baseTTL: this.baseTTL[category],
      adjustedTTL: ttl
    });

    return Math.round(ttl);
  }

  /**
   * Categoriza una consulta para determinar su estrategia de caché
   * @param query Consulta a categorizar
   * @returns Categoría de la consulta
   */
  public categorizeQuery(query: AIQuery): QueryCategory {
    // Verificar opciones explícitas
    if (query.options?.provider === 'development') {
      return 'development';
    }

    const queryText = query.query.toLowerCase();

    // Revisar palabras clave en el texto de la consulta
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      // Saltear 'general' ya que es el fallback
      if (category === 'general') continue;

      // Si encuentra alguna palabra clave, asignar esa categoría
      if (keywords.some(keyword => queryText.includes(keyword))) {
        return category as QueryCategory;
      }
    }

    // Si incluye notas no estructuradas, es probable que sea análisis clínico
    if (query.unstructuredNotes && query.unstructuredNotes.length > 0) {
      return 'clinical-analysis';
    }

    // Si incluye contexto EMR, es probable que sea historial del paciente
    if (query.context?.type === 'emr') {
      return 'patient-history';
    }

    // Por defecto
    return 'general';
  }

  /**
   * Genera etiquetas para agrupar consultas relacionadas
   * @param query Consulta a etiquetar
   * @returns Lista de etiquetas
   */
  public generateTags(query: AIQuery): CacheTag[] {
    const tags: CacheTag[] = [];

    // Etiquetar por categoría
    const category = this.categorizeQuery(query);
    tags.push(`category:${category}`);

    // Etiquetar por paciente si existe
    if (query.patientId) {
      tags.push(`patient:${query.patientId}`);
    }

    // Etiquetar por proveedor si se especifica
    if (query.options?.provider) {
      tags.push(`provider:${query.options.provider}`);
    }

    // Etiquetar por idioma si se especifica
    if (query.options?.language) {
      tags.push(`lang:${query.options.language}`);
    }

    // Extraer conceptos clave del texto de la consulta
    const keyTerms = this.extractKeyTerms(query.query);
    keyTerms.forEach(term => {
      tags.push(`term:${term}`);
    });

    return tags;
  }

  /**
   * Calcula la prioridad de una consulta para mantenerse en caché
   * @param query Consulta a evaluar
   * @returns Puntuación de prioridad (0-100)
   */
  public calculatePriority(query: AIQuery): number {
    let priority = 50; // Valor base

    // Las consultas de evidencia son más valiosas de mantener
    if (this.categorizeQuery(query) === 'evidence-check') {
      priority += 20;
    }

    // Las consultas de desarrollo tienen baja prioridad
    if (this.categorizeQuery(query) === 'development') {
      priority -= 30;
    }

    // Las consultas complejas tienen mayor prioridad para evitar recálculos costosos
    if (query.options?.maxTokens) {
      priority += Math.min(20, query.options.maxTokens / 100);
    }

    // Las consultas con contexto EMR tienen mayor prioridad
    if (query.context?.type === 'emr') {
      priority += 10;
    }

    // Las consultas con notas no estructuradas tienen mayor prioridad
    if (query.unstructuredNotes && query.unstructuredNotes.length > 0) {
      priority += Math.min(15, query.unstructuredNotes.length * 3);
    }

    // Asegurar que esté en el rango 0-100
    return Math.max(0, Math.min(100, Math.round(priority)));
  }

  /**
   * Genera metadatos completos para una entrada de caché
   * @param query Consulta asociada a la entrada
   * @returns Metadatos de caché
   */
  public generateMetadata(query: AIQuery): CacheMetadata {
    const category = this.categorizeQuery(query);
    const ttl = this.calculateTTL(query);
    const tags = this.generateTags(query);
    const priority = this.calculatePriority(query);

    return {
      queryCategory: category,
      tags,
      patientId: query.patientId,
      expiresAt: Date.now() + ttl,
      priority
    };
  }

  /**
   * Invalida todas las entradas relacionadas con etiquetas específicas
   * Esta es una implementación simulada, la real interactuaría con el CacheService
   * @param tags Etiquetas de las entradas a invalidar
   * @returns Promise con el número de entradas invalidadas
   */
  public async invalidateByTags(tags: CacheTag[]): Promise<number> {
    // Simulación - en producción haría una llamada al servicio de caché
    this.logger.info('Invalidating cache entries by tags', { tags });

    // Simular invalidación de 1-5 entradas
    const invalidatedCount = Math.floor(Math.random() * 5) + 1;
    return invalidatedCount;
  }

  /**
   * Invalida todas las entradas relacionadas con un paciente
   * Esta es una implementación simulada, la real interactuaría con el CacheService
   * @param patientId ID del paciente
   * @returns Promise con el número de entradas invalidadas
   */
  public async invalidateByPatientId(patientId: string): Promise<number> {
    // Simulación - en producción haría una llamada al servicio de caché
    this.logger.info('Invalidating cache entries by patientId', { patientId });

    return this.invalidateByTags([`patient:${patientId}`]);
  }

  /**
   * Extrae términos clave de una consulta para generar etiquetas
   * @param text Texto de la consulta
   * @returns Lista de términos clave
   */
  private extractKeyTerms(text: string): string[] {
    // Implementación simplificada - en producción usaría NLP
    const normalized = text.toLowerCase()
      .replace(/[.,;:?!]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Lista de palabras a ignorar (stopwords)
    const stopwords = new Set([
      'a', 'al', 'algo', 'algunas', 'algunos', 'ante', 'antes', 'como',
      'con', 'contra', 'cual', 'cuando', 'de', 'del', 'desde', 'donde',
      'durante', 'e', 'el', 'ella', 'ellas', 'ellos', 'en', 'entre',
      'era', 'erais', 'eran', 'eras', 'eres', 'es', 'esa', 'esas', 'ese',
      'eso', 'esos', 'esta', 'estaba', 'estabais', 'estaban', 'estabas',
      'estad', 'estada', 'estadas', 'estado', 'estados', 'estamos', 'estando',
      'estar', 'estaremos', 'estará', 'estarán', 'estarás', 'estaré', 'estaréis',
      'estaría', 'estaríais', 'estaríamos', 'estarían', 'estarías', 'estas',
      'este', 'estemos', 'esto', 'estos', 'estoy', 'estuve', 'estuviera',
      'estuvierais', 'estuvieran', 'estuvieras', 'estuvieron', 'estuviese',
      'estuvieseis', 'estuviesen', 'estuvieses', 'estuvimos', 'estuviste',
      'estuvisteis', 'estuviéramos', 'estuviésemos', 'estuvo', 'está', 'estábamos',
      'estáis', 'están', 'estás', 'esté', 'estéis', 'estén', 'estés', 'fue',
      'fuera', 'fuerais', 'fueran', 'fueras', 'fueron', 'fuese', 'fueseis',
      'fuesen', 'fueses', 'fui', 'fuimos', 'fuiste', 'fuisteis', 'fuéramos',
      'fuésemos', 'ha', 'habida', 'habidas', 'habido', 'habidos', 'habiendo',
      'habremos', 'habrá', 'habrán', 'habrás', 'habré', 'habréis', 'habría',
      'habríais', 'habríamos', 'habrían', 'habrías', 'habéis', 'había', 'habíais',
      'habíamos', 'habían', 'habías', 'han', 'has', 'hasta', 'hay', 'haya',
      'hayamos', 'hayan', 'hayas', 'hayáis', 'he', 'hemos', 'hube', 'hubiera',
      'hubierais', 'hubieran', 'hubieras', 'hubieron', 'hubiese', 'hubieseis',
      'hubiesen', 'hubieses', 'hubimos', 'hubiste', 'hubisteis', 'hubiéramos',
      'hubiésemos', 'hubo', 'la', 'las', 'le', 'les', 'lo', 'los', 'me', 'mi',
      'mis', 'mucho', 'muchos', 'muy', 'más', 'mí', 'mía', 'mías', 'mío', 'míos',
      'nada', 'ni', 'no', 'nos', 'nosotras', 'nosotros', 'nuestra', 'nuestras',
      'nuestro', 'nuestros', 'o', 'os', 'otra', 'otras', 'otro', 'otros', 'para',
      'pero', 'poco', 'por', 'porque', 'que', 'quien', 'quienes', 'qué', 'se',
      'sea', 'seamos', 'sean', 'seas', 'seremos', 'será', 'serán', 'serás',
      'seré', 'seréis', 'sería', 'seríais', 'seríamos', 'serían', 'serías',
      'seáis', 'si', 'siendo', 'sin', 'sobre', 'sois', 'somos', 'son', 'soy',
      'su', 'sus', 'suya', 'suyas', 'suyo', 'suyos', 'sí', 'también', 'tanto',
      'te', 'tendremos', 'tendrá', 'tendrán', 'tendrás', 'tendré', 'tendréis',
      'tendría', 'tendríais', 'tendríamos', 'tendrían', 'tendrías', 'tened',
      'tenemos', 'tenga', 'tengamos', 'tengan', 'tengas', 'tengo', 'tengáis',
      'tenida', 'tenidas', 'tenido', 'tenidos', 'teniendo', 'tenéis', 'tenía',
      'teníais', 'teníamos', 'tenían', 'tenías', 'ti', 'tiene', 'tienen', 'tienes',
      'todo', 'todos', 'tu', 'tus', 'tuve', 'tuviera', 'tuvierais', 'tuvieran',
      'tuvieras', 'tuvieron', 'tuviese', 'tuvieseis', 'tuviesen', 'tuvieses',
      'tuvimos', 'tuviste', 'tuvisteis', 'tuviéramos', 'tuviésemos', 'tuvo',
      'tuya', 'tuyas', 'tuyo', 'tuyos', 'tú', 'un', 'una', 'uno', 'unos', 'vosotras',
      'vosotros', 'vuestra', 'vuestras', 'vuestro', 'vuestros', 'y', 'ya', 'yo', 'él', 'éramos'
    ]);

    // Dividir en palabras y filtrar stopwords
    const words = normalized.split(' ')
      .filter(word => word.length > 3 && !stopwords.has(word));

    // Contar frecuencia de palabras
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // Ordenar por frecuencia y tomar las top N
    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}

// Exportar singleton
export const smartCacheInvalidationStrategy = SmartCacheInvalidationStrategy.getInstance();
