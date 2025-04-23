import { ClinicalEvidence, ClinicalDashboardFilters } from '../types/clinicalDashboard';;;;;
;
;
import { CacheMetadata } from './cache/types';;;;;
import { MongoClient, Collection, ObjectId, Filter } from 'mongodb';;;;;
import { Client } from '@elastic/elasticsearch';;;;;
import { CacheManager } from './cache/CacheManager';;;;;
import { config } from '../config/config';;;;;
import { MedicalSourceVerifier } from './medical/MedicalSourceVerifier';;;;;

interface SearchResult {
  results: ClinicalEvidence[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  suggestions?: string[];
}

interface SearchConfig {
  mongoUri: string;
  elasticUri: string;
  databaseName: string;
  collectionName: string;
  indexName: string;
  cacheConfig: {
    ttl: number;
    maxSize: number;
  };
}

interface MongoQuery extends Filter<ClinicalEvidence> {
  categoryTags?: { $in: string[] };
  conditionTags?: { $in: string[] };
  treatmentTags?: { $in: string[] };
  reliability?: { $gte: number };
  lastUpdated?: {
    $gte: string;
    $lte: string;
  };
  _id?: { $in: ObjectId[] };
}

interface ElasticSearchHit {
  _id: string;
  _source: ClinicalEvidence;
  _score: number;
}

interface ElasticSearchResponse {
  hits: {
    hits: ElasticSearchHit[];
    total: number;
  };
  suggest?: {
    title_suggest?: Array<{
      options?: Array<{ text: string }>;
    }>;
  };
}

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Servicio para búsqueda y gestión de evidencia clínica
 */
export class EvidenceSearchService {
  private static instance: EvidenceSearchService;
  private cacheManager: CacheManager<SearchResult>;
  private readonly defaultPageSize = 10;
  private mongoClient: MongoClient;
  private elasticClient: Client;
  private evidenceCollection: Collection<ClinicalEvidence>;
  private config: SearchConfig;
  private medicalSourceVerifier: MedicalSourceVerifier;

  private constructor(searchConfig: SearchConfig) {
    this.config = searchConfig;
    this.cacheManager = new CacheManager({
      ttlMs: searchConfig.cacheConfig.ttl,
      maxSize: searchConfig.cacheConfig.maxSize
    });
    this.mongoClient = new MongoClient(searchConfig.mongoUri);
    this.elasticClient = new Client({ node: searchConfig.elasticUri });
    this.evidenceCollection = this.mongoClient.db(searchConfig.databaseName).collection(searchConfig.collectionName);
    this.medicalSourceVerifier = MedicalSourceVerifier.getInstance();

    this.initializeConnections();
  }

  public static getInstance(searchConfig: SearchConfig = {
    mongoUri: config.search.mongoUri,
    elasticUri: config.search.elasticUri,
    databaseName: config.search.databaseName,
    collectionName: config.search.collectionName,
    cacheConfig: {
      ttl: config.medical.cache.ttl,
      maxSize: config.medical.cache.maxSize
    }
  }): EvidenceSearchService {
    if (!EvidenceSearchService.instance) {
      EvidenceSearchService.instance = new EvidenceSearchService(searchConfig);
    }
    return EvidenceSearchService.instance;
  }

  private async initializeConnections(): Promise<void> {
    try {
      await this.mongoClient.connect();
      await this.elasticClient.ping();
      
    } catch (error) {
      console.error('Error al inicializar conexiones:', error);
      throw error;
    }
  }

  /**
   * Busca evidencia clínica basada en filtros
   */
  public async searchEvidence(
    filters: ClinicalDashboardFilters,
    page: number = 1,
    pageSize: number = this.defaultPageSize
  ): Promise<SearchResult> {
    const cacheKey = this.generateCacheKey(filters, page, pageSize);
    
    // Intentar obtener de caché
    const cachedResults = await this.cacheManager.get(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // Si no está en caché, realizar búsqueda
    const results = await this.performSearch(filters, page, pageSize);
    
    // Almacenar en caché
    const metadata: CacheMetadata = {
      lastAccess: Date.now(),
      accessCount: 1,
      size: JSON.stringify(results).length,
      patientId: filters.patientId,
      section: 'evidence-search'
    };
    
    await this.cacheManager.set(cacheKey, results, metadata);

    return results;
  }

  private async performSearch(
    filters: ClinicalDashboardFilters,
    page: number,
    pageSize: number
  ): Promise<SearchResult> {
    // Construir consulta de MongoDB
    const mongoQuery: MongoQuery = {};
    
    if (filters.categories?.length) {
      mongoQuery.categoryTags = { $in: filters.categories };
    }
    
    if (filters.conditions?.length) {
      mongoQuery.conditionTags = { $in: filters.conditions };
    }
    
    if (filters.treatments?.length) {
      mongoQuery.treatmentTags = { $in: filters.treatments };
    }
    
    if (filters.minReliability) {
      mongoQuery.reliability = { $gte: filters.minReliability };
    }
    
    if (filters.dateRange) {
      mongoQuery.lastUpdated = {
        $gte: filters.dateRange.from,
        $lte: filters.dateRange.to
      };
    }

    // Si hay término de búsqueda, usar Elasticsearch
    let searchResults: ClinicalEvidence[] = [];
    let total = 0;
    let suggestions: string[] = [];

    if (filters.searchTerm) {
      const elasticResponse = await this.elasticClient.search<ElasticSearchResponse>({
        index: this.config.indexName,
        query: {
          multi_match: {
            query: filters.searchTerm,
            fields: ['title^3', 'summary^2', 'content'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        },
        suggest: {
          text: filters.searchTerm,
          title_suggest: {
            term: {
              field: 'title'
            }
          }
        }
      });

      const hits = elasticResponse.hits.hits;
      const ids = hits.map(hit => new ObjectId(hit._id));
      
      // Obtener documentos completos de MongoDB
      mongoQuery._id = { $in: ids };
      searchResults = await this.evidenceCollection
        .find(mongoQuery)
        .sort({ relevanceScore: -1, lastUpdated: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

      total = typeof elasticResponse.hits.total === 'number' 
        ? elasticResponse.hits.total 
        : elasticResponse.hits.total?.value ?? 0;

      if (elasticResponse.suggest?.title_suggest?.[0]?.options) {
        const options = elasticResponse.suggest.title_suggest[0].options;
        if (Array.isArray(options)) {
          suggestions = options
            .map((opt: { text: string }) => opt.text)
            .filter((text: string | undefined): text is string => text !== undefined);
        }
      }
    } else {
      // Búsqueda solo en MongoDB
      total = await this.evidenceCollection.countDocuments(mongoQuery);
      searchResults = await this.evidenceCollection
        .find(mongoQuery)
        .sort({ relevanceScore: -1, lastUpdated: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
    }

    return {
      results: searchResults,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      suggestions
    };
  }

  /**
   * Genera una clave de caché basada en los filtros y paginación
   */
  private generateCacheKey(
    filters: ClinicalDashboardFilters,
    page: number,
    pageSize: number
  ): string {
    const normalized = {
      patientId: filters.patientId || '',
      categories: filters.categories?.sort().join(',') || '',
      conditions: filters.conditions?.sort().join(',') || '',
      treatments: filters.treatments?.sort().join(',') || '',
      evidenceTypes: filters.evidenceTypes?.sort().join(',') || '',
      minReliability: filters.minReliability || '',
      dateRange: filters.dateRange 
        ? `${filters.dateRange.from}_${filters.dateRange.to}` 
        : '',
      searchTerm: filters.searchTerm || '',
      page,
      pageSize
    };
    
    return `evidence-search:${JSON.stringify(normalized)}`;
  }

  /**
   * Invalida el caché para un paciente específico
   */
  public invalidatePatientCache(): void {
    this.cacheManager.clear();
  }

  /**
   * Obtiene estadísticas del caché
   */
  public getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * Cierra las conexiones a las bases de datos
   */
  public async close() {
    await this.mongoClient.close();
    await this.elasticClient.close();
  }
} 