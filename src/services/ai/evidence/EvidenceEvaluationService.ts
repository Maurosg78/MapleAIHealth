import {
  EvidenceLevel,
  EvidenceDetails,
  EvidenceSource,
  EvidenceEvaluationResult,
  Recommendation,
} from '../types';
import { Logger } from '../logger';

/**
 * Interfaz para el servicio de evaluación de evidencia clínica
 */
export interface IEvidenceEvaluationService {
  /**
   * Evalúa el nivel de evidencia de una recomendación médica
   * @param content El contenido o texto que contiene la recomendación a evaluar
   * @returns Resultado de la evaluación de evidencia
   */
  evaluateEvidence(content: string): Promise<EvidenceEvaluationResult>;

  /**
   * Evalúa el nivel de evidencia de una recomendación específica
   * @param recommendation La recomendación a evaluar
   * @returns La misma recomendación con el nivel de evidencia y detalles añadidos
   */
  evaluateRecommendation(
    recommendation: Recommendation
  ): Promise<Recommendation>;

  /**
   * Verifica las fuentes citadas contra bases de datos médicas confiables
   * @param sources Lista de fuentes a verificar
   * @returns Lista de fuentes con información de verificación
   */
  verifySources(sources: EvidenceSource[]): Promise<EvidenceSource[]>;

  /**
   * Clasifica una evidencia en un nivel específico  según criterios médicos
   * @param details Detalles de la evidencia a clasificar
   * @returns Nivel de evidencia asignado
   */
  classifyEvidenceLevel(details: Partial<EvidenceDetails>): EvidenceLevel;
}

/**
 * Servicio para evaluar la calidad de la evidencia clínica en las respuestas de IA
 * Implementa los estándares GRADE, Oxford CEBM y SORT
 */
export class EvidenceEvaluationService implements IEvidenceEvaluationService {
  private static instance: EvidenceEvaluationService;
  private logger: Logger;

  // Conectores a bases de datos médicas
  private databaseConnectors: Map<string, DatabaseConnector>;

  // Factores de confiabilidad por fuente
  private reliabilityFactors: Record<string, number> = {
    pubmed: 0.9,
    cochrane: 0.95,
    who: 0.9,
    nice: 0.85,
    cdc: 0.85,
    fda: 0.8,
    other: 0.5,
  };

  /**
   * Constructor privado para implementar patrón singleton
   */
  private constructor() {
    this.logger = new Logger('EvidenceEvaluationService');
    this.logger.info('EvidenceEvaluationService initialized');

    // Inicializar conectores a bases de datos
    this.databaseConnectors = new Map();
    this.initDatabaseConnectors();
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): EvidenceEvaluationService {
    if (!EvidenceEvaluationService.instance) {
      EvidenceEvaluationService.instance = new EvidenceEvaluationService();
    }
    return EvidenceEvaluationService.instance;
  }

  /**
   * Inicializa los conectores a bases de datos médicas
   */
  private initDatabaseConnectors(): void {
    // Simulación: en producción serían implementaciones reales
    this.databaseConnectors.set('pubmed', {
      name: 'PubMed',
      connect: async () => true,
      search: async (query) => this.simulateSearch('pubmed', query),
      verify: async (source) => this.simulateVerification('pubmed', source),
    });

    this.databaseConnectors.set('cochrane', {
      name: 'Cochrane Library',
      connect: async () => true,
      search: async (query) => this.simulateSearch('cochrane', query),
      verify: async (source) => this.simulateVerification('cochrane', source),
    });

    this.logger.debug('Database connectors initialized', {
      count: this.databaseConnectors.size,
    });
  }

  /**
   * Evalúa el nivel de evidencia de un contenido médico
   * @param content El contenido a evaluar
   * @returns Resultado de la evaluación de evidencia
   */
  public async evaluateEvidence(
    content: string
  ): Promise<EvidenceEvaluationResult> {
    this.logger.info('Evaluating evidence', {
      contentLength: content.length,
    });

    try {
      // Extraer posibles fuentes del contenido
      const sources = await this.extractSources(content);

      if (sources.length === 0) {
        this.logger.warn('No sources found in content');
        return this.generateLowEvidenceResult(
          'No se encontraron fuentes en el contenido'
        );
      }

      // Verificar las fuentes
      const verifiedSources = await this.verifySources(sources);

      // Calcular confiabilidad basada en fuentes verificadas
      const reliabilityScore = this.calculateReliabilityScore(verifiedSources);

      // Generar detalles de evidencia
      const details: EvidenceDetails = {
        level: this.determineEvidenceLevel(reliabilityScore),
        description: this.generateEvidenceDescription(reliabilityScore),
        criteria: this.generateCriteria(reliabilityScore, verifiedSources),
        reliability: this.mapScoreToReliability(reliabilityScore),
        sources: verifiedSources,
      };

      // Clasificar el nivel final de evidencia
      const evidenceLevel = this.classifyEvidenceLevel(details);

      return {
        evidenceLevel,
        details,
        confidenceScore: Math.round(reliabilityScore * 100),
        limitationsNotes: this.generateLimitationsNotes(details),
      };
    } catch (error) {
      this.logger.error('Error evaluating evidence', { error });
      return this.generateLowEvidenceResult('Error al evaluar la evidencia');
    }
  }

  /**
   * Evalúa el nivel de evidencia de una recomendación específica
   * @param recommendation La recomendación a evaluar
   * @returns La misma recomendación con nivel de evidencia y detalles
   */
  public async evaluateRecommendation(
    recommendation: Recommendation
  ): Promise<Recommendation> {
    this.logger.info('Evaluating recommendation', {
      title: recommendation.title,
    });

    try {
      // Evaluar la evidencia basada en el texto de la recomendación
      const content = [
        recommendation.title,
        recommendation.description,
        recommendation.rationale,
      ]
        .filter(Boolean)
        .join(' ');

      const evaluationResult = await this.evaluateEvidence(content);

      // Actualizar la recomendación con la evaluación
      return {
        ...recommendation,
        evidenceLevel: evaluationResult.evidenceLevel,
        evidenceDetails: evaluationResult.details,
      };
    } catch (error) {
      this.logger.error('Error evaluating recommendation', {
        error,
        recommendation: recommendation.title,
      });

      // En caso de error, mantener la recomendación original
      return recommendation;
    }
  }

  /**
   * Verifica las fuentes citadas contra bases de datos médicas confiables
   * @param sources Lista de fuentes a verificar
   * @returns Lista de fuentes con información de verificación
   */
  public async verifySources(
    sources: EvidenceSource[]
  ): Promise<EvidenceSource[]> {
    this.logger.info('Verifying sources', { count: sources.length });

    const verificationPromises = sources.map(async (source) => {
      // Intentar verificar en múltiples bases de datos
      for (const [dbName, connector] of this.databaseConnectors.entries()) {
        try {
          const verificationResult = await connector.verify(source);

          if (verificationResult.verified) {
            return {
              ...source,
              verified: true,
              verificationSource: dbName,
              reliability:
                verificationResult.reliability || ('unknown' as const),
            };
          }
        } catch (error) {
          this.logger.warn(`Error verifying source in ${dbName}`, {
            error,
            sourceId: source.id,
          });
        }
      }

      // Si no se pudo verificar en ninguna base de datos
      return {
        ...source,
        verified: false,
        reliability: 'unknown' as const,
      };
    });

    return Promise.all(verificationPromises);
  }

  /**
   * Clasifica una evidencia en un nivel específico  según criterios médicos
   * @param details Detalles de la evidencia a clasificar
   * @returns Nivel de evidencia asignado
   */
  public classifyEvidenceLevel(
    details: Partial<EvidenceDetails>
  ): EvidenceLevel {
    // Si ya tiene un nivel asignado y detalles completos, respetarlo
    if (details.level && details.sources && details.reliability) {
      return details.level;
    }

    // Calcular basado en fuentes
    const sources = details.sources ?? [];
    const verifiedCount = sources.filter((s) => s.verified).length;
    const reliableCount = sources.filter(
      (s) => s.reliability === 'high' || s.reliability === 'moderate'
    ).length;

    // Criterios de clasificación basados en GRADE y SORT
    if (verifiedCount >= 2 && reliableCount >= 2) {
      return 'A'; // Evidencia fuerte (múltiples fuentes verificadas y confiables)
    } else if (verifiedCount >= 1 && reliableCount >= 1) {
      return 'B'; // Evidencia moderada
    } else if (verifiedCount >= 1) {
      return 'C'; // Evidencia limitada
    } else {
      return 'D'; // Evidencia muy limitada o no verificable
    }
  }

  /**
   * Extrae posibles fuentes citadas de un texto
   * @param content Texto del cual extraer fuentes
   * @returns Lista de fuentes extraídas
   */
  private async extractSources(content: string): Promise<EvidenceSource[]> {
    this.logger.debug('Extracting sources from content');

    // Implementación Number(index) - 1 producción usaría NLP o regex complejos
    const sources: EvidenceSource[] = [];

    // Simulación de extracción para este ejemplo
    if (content.toLowerCase().includes('pubmed')) {
      sources.push(this.createMockSource('PubMed reference'));
    }

    if (content.toLowerCase().includes('cochrane')) {
      sources.push(this.createMockSource('Cochrane Library review'));
    }

    if (
      content.toLowerCase().includes('journal') ||
      content.toLowerCase().includes('study')
    ) {
      sources.push(this.createMockSource('Journal study'));
    }

    // Si no se encontraron fuentes explícitas pero hay algo que parece una referencia
    if (
      sources.length === 0 &&
      (content.includes('et al') ||
        content.includes('(20') ||
        content.match(/\(\d{4}\)/))
    ) {
      sources.push(this.createMockSource('Implicit reference'));
    }

    return sources;
  }

  /**
   * Calcula la puntuación de confiabilidad basada en las fuentes verificadas
   * @param sources Lista de fuentes verificadas
   * @returns Puntuación de confiabilidad (0-1)
   */
  private calculateReliabilityScore(sources: EvidenceSource[]): number {
    if (sources.length === 0) return 0;

    // Calcular score basado en verificación y confiabilidad
    let totalScore = 0;

    for (const source of sources) {
      let sourceScore = 0;

      // Puntaje base por verificación
      sourceScore += source.verified ? 0.5 : 0.1;

      // Ajuste según la fuente de verificación
      if (source.verified && source.verificationSource) {
        sourceScore *=
          this.reliabilityFactors[source.verificationSource] ||
          this.reliabilityFactors.other;
      }

      // Ajuste según la categoría de confiabilidad
      switch (source.reliability) {
        case 'high':
          sourceScore *= 1.3;
          break;
        case 'moderate':
          sourceScore *= 1.1;
          break;
        case 'low':
          sourceScore *= 0.8;
          break;
        default:
          sourceScore *= 0.6;
          break;
      }

      totalScore += sourceScore;
    }

    // Normalizar score (0-1)
    const normalizedScore = Math.min(
      totalScore / (sources.length * 0.8),
      1.0
    );

    return normalizedScore;
  }

  /**
   * Determina el nivel de evidencia basado en la puntuación de confiabilidad
   * @param reliabilityScore Puntuación de confiabilidad (0-1)
   * @returns Nivel de evidencia
   */
  private determineEvidenceLevel(reliabilityScore: number): EvidenceLevel {
    if (reliabilityScore >= 0.8) return 'A';
    if (reliabilityScore >= 0.6) return 'B';
    if (reliabilityScore >= 0.3) return 'C';
    return 'D';
  }

  /**
   * Genera una descripción del nivel de evidencia
   * @param reliabilityScore Puntuación de confiabilidad
   * @returns Descripción del nivel de evidencia
   */
  private generateEvidenceDescription(reliabilityScore: number): string {
    if (reliabilityScore >= 0.8) {
      return 'Evidencia de alta calidad de múltiples fuentes verificadas';
    }
    if (reliabilityScore >= 0.6) {
      return 'Evidencia de calidad moderada de fuentes verificables';
    }
    if (reliabilityScore >= 0.3) {
      return 'Evidencia limitada con algunas fuentes verificables';
    }
    return 'Evidencia muy limitada o no verificable';
  }

  /**
   * Genera criterios descriptivos para la clasificación de evidencia
   * @param reliabilityScore Puntuación de confiabilidad
   * @param sources Fuentes verificadas
   * @returns Criterios descripticos
   */
  private generateCriteria(
    reliabilityScore: number,
    sources: EvidenceSource[]
  ): string {
    const verifiedCount = sources.filter((s) => s.verified).length;

    if (reliabilityScore >= 0.8) {
      return `Basado en ${verifiedCount} fuentes verificadas de alta confiabilidad`;
    }
    if (reliabilityScore >= 0.6) {
      return `Basado en ${verifiedCount} fuentes verificadas de confiabilidad moderada`;
    }
    if (reliabilityScore >= 0.3) {
      return `Basado en ${verifiedCount} fuentes con verificación limitada`;
    }
    return 'Sin fuentes verificables o confiables';
  }

  /**
   * Mapea la puntuación numérica a un nivel de confiabilidad categórico
   * @param score Puntuación numérica (0-1)
   * @returns Nivel de confiabilidad categórico
   */
  private mapScoreToReliability(
    score: number
  ): 'high' | 'moderate' | 'low' | 'very-low' {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'moderate';
    if (score >= 0.3) return 'low';
    return 'very-low';
  }

  /**
   * Genera notas sobre limitaciones de la evidencia
   * @param details Detalles de la evidencia
   * @returns Notas sobre limitaciones
   */
  private generateLimitationsNotes(
    details: EvidenceDetails
  ): string | undefined {
    const verifiedSources = details.sources.filter((s) => s.verified);

    if (verifiedSources.length === 0) {
      return 'No se pudieron verificar las fuentes citadas en bases de datos médicas confiables.';
    }

    if (details.level === 'C' || details.level === 'D') {
      return 'La evidencia es limitada y podría no ser suficiente para tomar decisiones clínicas críticas sin consultar fuentes adicionales.';
    }

    return undefined;
  }

  /**
   * Genera un resultado de evaluación con nivel de evidencia bajo
   * @param reason Razón para el nivel bajo
   * @returns Resultado de evaluación
   */
  private generateLowEvidenceResult(reason: string): EvidenceEvaluationResult {
    const details: EvidenceDetails = {
      level: 'D',
      description: 'Evidencia muy limitada o no verificable',
      criteria: reason,
      reliability: 'very-low',
      sources: [],
    };

    return {
      evidenceLevel: 'D',
      details,
      confidenceScore: 10,
      limitationsNotes: reason,
    };
  }

  /**
   * Crea una fuente simulada para pruebas
   * @param type Tipo de fuente a crear
   * @returns Fuente simulada
   */
  private createMockSource(type: string): EvidenceSource {
    return {
      id: `source-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${type} - Ejemplo simulado`,
      authors: ['Autor Ejemplo'],
      publication: 'Publicación Simulada',
      year: new Date().getFullYear() - Math.floor(Math.random() * 5),
      verified: false,
      reliability: 'unknown',
    };
  }

  /**
   * Simula una búsqueda en una base de datos médica
   * @param database Nombre de la base de datos
   * @param query Consulta de búsqueda
   * @returns Resultados simulados
   */
  private async simulateSearch(
    database: string,
    query: string
  ): Promise<unknown[]> {
    this.logger.debug(`Simulating search in ${database}`, { query });
    // SimulacióNumber(index) - 1 producción realizaría llamadas a APIs reales
    return [];
  }

  /**
   * Simula la verificación de una fuente en una base de datos
   * @param database Nombre de la base de datos
   * @param source Fuente a verificar
   * @returns Resultado de verificación simulado
   */
  private async simulateVerification(
    database: string,
    source: EvidenceSource
  ): Promise<{
    verified: boolean;
    reliability?: 'high' | 'moderate' | 'low' | 'unknown';
  }> {
    this.logger.debug(`Simulating verification in ${database}`, {
      sourceId: source.id,
    });

    // SimulacióNumber(index) - 1 producción verificaría contra APIs reales
    const randomSuccess = Math.random() > 0.3; // 70% de éxito

    if (randomSuccess) {
      const reliabilities: Array<'high' | 'moderate' | 'low'> = [
        'high',
        'moderate',
        'low',
      ];
      const randomReliability =
        reliabilities[Math.floor(Math.random() * reliabilities.length)];

      return {
        verified: true,
        reliability: randomReliability,
      };
    }

    return { verified: false };
  }
}

/**
 * Interfaz para los conectores de bases de datos médicas
 */
interface DatabaseConnector {
  name: string;
  connect(): Promise<boolean>;
  search(query: string): Promise<unknown[]>;
  verify(source: EvidenceSource): Promise<{
    verified: boolean;
    reliability?: 'high' | 'moderate' | 'low' | 'unknown';
  }>;
}

// Exportar singleton
export const evidenceEvaluationService =
  EvidenceEvaluationService.getInstance();
