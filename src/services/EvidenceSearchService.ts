import { ClinicalEvidence, ClinicalDashboardFilters } from '../types/clinicalDashboard';
import { CacheManagerFactory } from './cache/CacheManagerFactory';
import { estimateClinicalEvidenceSize } from './cache/utils/memorySizeEstimator';
import { CacheMetadata } from './cache/types';
import { MongoClient, Collection, ObjectId, Filter } from 'mongodb';
import { Client } from '@elastic/elasticsearch';

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

/**
 * Servicio para búsqueda y gestión de evidencia clínica
 */
export class EvidenceSearchService {
  private static instance: EvidenceSearchService;
  private cacheManager = CacheManagerFactory.getInstance<SearchResult>('evidence-search');
  private readonly defaultPageSize = 10;
  private mongoClient: MongoClient;
  private elasticClient: Client;
  private evidenceCollection: Collection<ClinicalEvidence>;
  private config: SearchConfig;

  private constructor(config: SearchConfig) {
    this.config = config;
    this.mongoClient = new MongoClient(config.mongoUri);
    this.elasticClient = new Client({ node: config.elasticUri });
    this.evidenceCollection = this.mongoClient.db(config.databaseName).collection(config.collectionName);

    // Configurar el caché para evidencia clínica
    this.cacheManager.updateConfig({
      ttlMs: 30 * 60 * 1000, // 30 minutos
      maxSize: 100, // Máximo 100 resultados en caché
      cleanupInterval: 5 * 60 * 1000, // Limpiar cada 5 minutos
      patientBased: true,
      sizeEstimator: (data: unknown) => {
        const result = data as SearchResult;
        return result.results.reduce((total, item) => total + estimateClinicalEvidenceSize(item), 0);
      }
    });

    // Inicializar índices
    this.initializeIndexes();
  }

  private async initializeIndexes() {
    // Crear índices en MongoDB
    await this.evidenceCollection.createIndexes([
      { key: { relevanceScore: -1 } },
      { key: { lastUpdated: -1 } },
      { key: { conditionTags: 1 } },
      { key: { treatmentTags: 1 } },
      { key: { categoryTags: 1 } }
    ]);

    // Crear índice en Elasticsearch
    try {
      await this.elasticClient.indices.create({
        index: this.config.indexName,
        mappings: {
          properties: {
            title: { type: 'text', analyzer: 'spanish' },
            summary: { type: 'text', analyzer: 'spanish' },
            content: { type: 'text', analyzer: 'spanish' },
            conditionTags: { type: 'keyword' },
            treatmentTags: { type: 'keyword' },
            categoryTags: { type: 'keyword' },
            relevanceScore: { type: 'float' },
            reliability: { type: 'integer' },
            lastUpdated: { type: 'date' }
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorBody = (error as { meta?: { body?: { error?: { type?: string } } } }).meta?.body;
        if (errorBody?.error?.type === 'resource_already_exists_exception') {
          return;
        }
      }
      throw error;
    }
  }

  public static getInstance(config: SearchConfig): EvidenceSearchService {
    if (!EvidenceSearchService.instance) {
      EvidenceSearchService.instance = new EvidenceSearchService(config);
    }
    return EvidenceSearchService.instance;
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