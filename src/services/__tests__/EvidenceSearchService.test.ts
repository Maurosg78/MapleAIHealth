import { EvidenceSearchService } from '../EvidenceSearchService';;;;;
import { config } from '../../config/config';;;;;
import { MongoClient } from 'mongodb';;;;;
import { Client } from '@elastic/elasticsearch';;;;;

describe('EvidenceSearchService Integration Tests', () => {
  let searchService: EvidenceSearchService;
  let mongoClient: MongoClient;
  let elasticClient: Client;

  beforeAll(async () => {
    // Configurar clientes de prueba
    mongoClient = new MongoClient(config.search.mongoUri);
    elasticClient = new Client({ node: config.search.elasticUri });
    
    // Inicializar el servicio
    searchService = EvidenceSearchService.getInstance();
    
    // Conectar a las bases de datos
    await mongoClient.connect();
    await elasticClient.ping();
  });

  afterAll(async () => {
    // Limpiar recursos
    await searchService.close();
    await mongoClient.close();
    await elasticClient.close();
  });

  beforeEach(async () => {
    // Limpiar datos de prueba
    const db = mongoClient.db(config.search.databaseName);
    await db.collection(config.search.collectionName).deleteMany({});
    await elasticClient.indices.delete({
      index: config.search.indexName,
      ignore_unavailable: true
    });
  });

  it('debería buscar evidencia en MongoDB y Elasticsearch', async () => {
    // Preparar datos de prueba
    const testData = {
      title: 'Test Evidence',
      content: 'This is a test evidence document',
      source: 'test',
      dateCreated: new Date(),
      lastModified: new Date()
    };

    // Insertar en MongoDB
    await mongoClient
      .db(config.search.databaseName)
      .collection(config.search.collectionName)
      .insertOne(testData);

    // Insertar en Elasticsearch
    await elasticClient.index({
      index: config.search.indexName,
      body: testData,
      refresh: true
    });

    // Realizar búsqueda
    const results = await searchService.searchEvidence('test evidence');

    // Verificar resultados
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Evidence');
  });

  it('debería usar el caché para búsquedas repetidas', async () => {
    // Primera búsqueda
    const firstSearch = await searchService.searchEvidence('test');
    
    // Segunda búsqueda (debería venir del caché)
    const secondSearch = await searchService.searchEvidence('test');
    
    // Verificar que los resultados son idénticos
    expect(secondSearch).toEqual(firstSearch);
  });

  it('debería filtrar por rango de fechas', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const results = await searchService.searchEvidence('test', {
      start: pastDate,
      end: futureDate
    });
    
    expect(Array.isArray(results)).toBe(true);
  });
}); 