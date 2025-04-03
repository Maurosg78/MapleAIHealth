import { EvidenceSource } from '../types';
import { Logger } from '../logger';

/**
 * Interfaz para verificación de fuentes médicas
 */
export interface IMedicalSourceVerifier {
  /**
   * Verifica una fuente médica en múltiples bases de datos
   * @param source Fuente a verificar
   * @returns La fuente con información de verificación
   */
  verifySource(source: EvidenceSource): Promise<EvidenceSource>;

  /**
   * Verifica múltiples fuentes médicas
   * @param sources Lista de fuentes a verificar
   * @returns Lista de fuentes con información de verificación
   */
  verifySources(sources: EvidenceSource[]): Promise<EvidenceSource[]>;

  /**
   * Busca fuentes relacionadas con un término médico
   * @param term Término a buscar
   * @param limit Límite de resultados a devolver
   * @returns Lista de fuentes encontradas
   */
  findRelatedSources(term: string, limit?: number): Promise<EvidenceSource[]>;

  /**
   * Calcula un índice de confiabilidad para una fuente
   * @param source Fuente a evaluar
   * @returns Puntuación de confiabilidad (0-100)
   */
  calculateReliabilityScore(source: EvidenceSource): number;
}

/**
 * Tipo para representar una base de datos médica
 */
interface MedicalDatabase {
  id: string;
  name: string;
  baseUrl: string;
  reliability: number; // 0-1, factor de confiabilidad de la base de datos
  requiresAuthentication: boolean;
  apiKey?: string;
}

/**
 * Servicio para verificar fuentes médicas contra bases de datos confiables
 */
export class MedicalSourceVerifier implements IMedicalSourceVerifier {
  private static instance: MedicalSourceVerifier;
  private readonly logger: Logger;
  private readonly databases: MedicalDatabase[];

  /**
   * Constructor privado para implementar patrón singleton
   */
  private constructor() {
    this.logger = new Logger('MedicalSourceVerifier');
    this.logger.info('MedicalSourceVerifier initialized');

    // Configuración de bases de datos médicas
    this.databases = [
      {
        id: 'pubmed',
        name: 'PubMed',
        baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/api/',
        reliability: 0.95,
        requiresAuthentication: true
      },
      {
        id: 'cochrane',
        name: 'Cochrane Library',
        baseUrl: 'https://www.cochranelibrary.com/api/',
        reliability: 0.97,
        requiresAuthentication: true
      },
      {
        id: 'who',
        name: 'World Health Organization',
        baseUrl: 'https://apps.who.int/iris/api/',
        reliability: 0.93,
        requiresAuthentication: false
      },
      {
        id: 'medlineplus',
        name: 'MedlinePlus',
        baseUrl: 'https://medlineplus.gov/api/',
        reliability: 0.90,
        requiresAuthentication: false
      }
    ];
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): MedicalSourceVerifier {
    if (!MedicalSourceVerifier.instance) {
      MedicalSourceVerifier.instance = new MedicalSourceVerifier();
    }
    return MedicalSourceVerifier.instance;
  }

  /**
   * Verifica una fuente médica en múltiples bases de datos
   * @param source Fuente a verificar
   * @returns La fuente con información de verificación
   */
  public async verifySource(source: EvidenceSource): Promise<EvidenceSource> {
    this.logger.info('Verifying medical source', { sourceId: source.id });

    // Verificar en cada base de datos
    for (const database of this.databases) {
      try {
        const isVerified = await this.verifyInDatabase(source, database);

        if (isVerified) {
          this.logger.debug('Source verified in database', {
            sourceId: source.id,
            databaseName: database.name
          });

          // Actualizar información de la fuente
          return {
            ...source,
            verified: true,
            verificationSource: database.id,
            reliability: this.mapDbReliabilityToSourceReliability(database.reliability)
          };
        }
      } catch (error) {
        this.logger.warn(`Error verifying source in ${database.name}`, {
          error,
          sourceId: source.id
        });
      }
    }

    // Si no se verificó en ninguna base de datos
    return {
      ...source,
      verified: false,
      reliability: 'unknown'
    };
  }

  /**
   * Verifica múltiples fuentes médicas
   * @param sources Lista de fuentes a verificar
   * @returns Lista de fuentes con información de verificación
   */
  public async verifySources(sources: EvidenceSource[]): Promise<EvidenceSource[]> {
    this.logger.info('Verifying multiple sources', { count: sources.length });

    const verificationPromises = sources.map(source => this.verifySource(source));
    const verifiedSources = await Promise.all(verificationPromises);

    // Resumen de verificación
    const verifiedCount = verifiedSources.filter(s => s.verified).length;
    this.logger.info('Sources verification completed', {
      total: sources.length,
      verified: verifiedCount
    });

    return verifiedSources;
  }

  /**
   * Busca fuentes relacionadas con un término médico
   * @param term Término a buscar
   * @param limit Límite de resultados a devolver
   * @returns Lista de fuentes encontradas
   */
  public async findRelatedSources(term: string, limit = 5): Promise<EvidenceSource[]> {
    this.logger.info('Finding related sources', { term, limit });

    // Simula la búsqueda en diferentes bases de datos
    const searchPromises = this.databases.map(database =>
      this.searchInDatabase(term, database)
    );

    // Obtener resultados de todas las bases de datos
    const searchResults = await Promise.all(searchPromises);

    // Aplanar y filtrar los resultados
    const allSources = searchResults
      .flat()
      .filter(source => source !== null);

    // Ordenar por confiabilidad y limitar resultados
    const sortedSources = allSources.sort((a, b) => {
      const reliabilityA = this.reliabilityToNumber(a.reliability);
      const reliabilityB = this.reliabilityToNumber(b.reliability);
      return reliabilityB - reliabilityA;
    });

    return sortedSources.slice(0, limit);
  }

  /**
   * Calcula un índice de confiabilidad para una fuente
   * @param source Fuente a evaluar
   * @returns Puntuación de confiabilidad (0-100)
   */
  public calculateReliabilityScore(source: EvidenceSource): number {
    // Si no está verificada, la confiabilidad es baja
    if (!source.verified) {
      return 10;
    }

    // Puntuación base por verificación
    let score = 50;

    // Ajustar según la fuente de verificación
    if (source.verificationSource) {
      const database = this.databases.find(db => db.id === source.verificationSource);
      if (database) {
        score += Math.round(database.reliability * 30);
      }
    }

    // Ajustar según la categoría de confiabilidad
    switch (source.reliability) {
      case 'high':
        score += 20;
        break;
      case 'moderate':
        score += 10;
        break;
      case 'low':
        score -= 10;
        break;
      default:
        break;
    }

    // Ajustar según otros factores
    if (source.doi) score += 5;
    if (source.authors && source.authors.length > 0) score += 5;
    if (source.publication) score += 5;

    // Asegurar que el rango sea 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Verifica una fuente en una base de datos específica
   * @param source Fuente a verificar
   * @param database Base de datos donde verificar
   * @returns Si la fuente fue verificada
   */
  private async verifyInDatabase(
    source: EvidenceSource,
    database: MedicalDatabase
  ): Promise<boolean> {
    // En producción, aquí iría una llamada real a la API de la base de datos
    // Para la implementación de simulación, usamos un resultado aleatorio
    await this.simulateApiDelay();

    // Simulación: mayor probabilidad de verificación para fuentes con DOI o autores
    const baseChance = 0.7;
    let verificationChance = baseChance;

    // Aumentar probabilidad basado en la confiabilidad de la base de datos
    verificationChance += database.reliability * 0.1;

    if (source.doi) verificationChance += 0.2;
    if (source.authors && source.authors.length > 0) verificationChance += 0.05;

    return Math.random() < verificationChance;
  }

  /**
   * Busca fuentes en una base de datos específica
   * @param term Término a buscar
   * @param database Base de datos donde buscar
   * @returns Lista de fuentes encontradas
   */
  private async searchInDatabase(
    term: string,
    database: MedicalDatabase
  ): Promise<EvidenceSource[]> {
    // En producción, aquí iría una llamada real a la API de la base de datos
    await this.simulateApiDelay();

    // Simular resultados
    const resultCount = Math.floor(Math.random() * 3) + 1; // 1-3 resultados
    const results: EvidenceSource[] = [];

    for (let i = 0; i < resultCount; i++) {
      results.push(this.createSimulatedSource(term, database));
    }

    return results;
  }

  /**
   * Crea una fuente simulada para un término y base de datos
   * @param term Término de búsqueda
   * @param database Base de datos
   * @returns Fuente simulada
   */
  private createSimulatedSource(term: string, database: MedicalDatabase): EvidenceSource {
    const currentYear = new Date().getFullYear();
    const recentYear = currentYear - Math.floor(Math.random() * 5); // 0-5 años atrás

    const hasDoi = Math.random() > 0.3;
    const doi = hasDoi ? `10.${1000 + Math.floor(Math.random() * 9000)}/${Date.now().toString(36)}` : undefined;

    return {
      id: `${database.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: `Estudio sobre ${term} - ${database.name}`,
      authors: ['Autor Principal', 'Coautor Secundario'],
      publication: `Revista ${database.name} de Medicina`,
      year: recentYear,
      doi,
      url: doi ? `https://doi.org/${doi}` : `${database.baseUrl}search?q=${encodeURIComponent(term)}`,
      verified: true,
      verificationSource: database.id,
      reliability: this.mapDbReliabilityToSourceReliability(database.reliability)
    };
  }

  /**
   * Mapea el factor de confiabilidad numérico a categorías
   * @param reliability Factor de confiabilidad (0-1)
   * @returns Categoría de confiabilidad
   */
  private mapDbReliabilityToSourceReliability(
    reliability: number
  ): 'high' | 'moderate' | 'low' | 'unknown' {
    if (reliability >= 0.9) return 'high';
    if (reliability >= 0.7) return 'moderate';
    if (reliability >= 0.5) return 'low';
    return 'unknown';
  }

  /**
   * Convierte la categoría de confiabilidad a un valor numérico
   * @param reliability Categoría de confiabilidad
   * @returns Valor numérico (0-1)
   */
  private reliabilityToNumber(reliability: 'high' | 'moderate' | 'low' | 'unknown'): number {
    switch (reliability) {
      case 'high': return 0.9;
      case 'moderate': return 0.7;
      case 'low': return 0.5;
      default: return 0.1;
    }
  }

  /**
   * Simula un retraso de API para las pruebas
   */
  private async simulateApiDelay(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, Math.random() * 100 + 50); // 50-150ms
    });
  }
}

// Exportar singleton
export const medicalSourceVerifier = MedicalSourceVerifier.getInstance();
