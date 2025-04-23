import { EnhancedCacheManager } from '../../EnhancedCacheManager';;;;;
import { ClinicalDashboardService } from '../../../clinicalDashboard';;;;;
import { estimateClinicalDashboardSize } from '../../utils/memorySizeEstimator';;;;;
import { ClinicalDashboardData, ClinicalDashboardFilters, ClinicalEvidence, ClinicalMetrics } from '../../../../types/clinicalDashboard';;;;;

describe('EnhancedCacheManager Integration Tests', () => {
  let cacheManager: EnhancedCacheManager<ClinicalDashboardData>;
  let dashboardService: ClinicalDashboardService;
  
  beforeEach(() => {
    // Configuración de prueba optimizada basada en resultados de benchmarks
    cacheManager = new EnhancedCacheManager<ClinicalDashboardData>({
      maxSize: 200,          // Tamaño óptimo según benchmarks
      ttlMs: 15 * 60 * 1000, // 15 minutos
      cleanupInterval: 60000 // 1 minuto
    }, 
    undefined,               // Configuración de invalidación por defecto
    'adaptive',              // Algoritmo de priorización adaptativo
    estimateClinicalDashboardSize);
    
    dashboardService = new ClinicalDashboardService();
  });
  
  afterEach(() => {
    cacheManager.clear();
  });
  
  test('Debe cachar y recuperar datos correctamente', async () => {
    // Generar filtros de prueba
    const testFilters: ClinicalDashboardFilters = {
      conditions: ['low-back-pain'],
      treatments: ['manual-therapy']
    };
    
    const cacheKey = dashboardService.generateCacheKey(testFilters);
    
    // Verificar que inicialmente no hay datos en caché
    expect(cacheManager.get(cacheKey)).toBeUndefined();
    
    // Obtener datos y almacenar en caché
    const dashboardData = await dashboardService.getDashboardData(testFilters, {}, false);
    cacheManager.set(cacheKey, dashboardData, {
      section: 'clinical-dashboard',
      dynamic: false
    });
    
    // Verificar que los datos están en caché
    const cachedData = cacheManager.get(cacheKey);
    expect(cachedData).toBeDefined();
    expect(cachedData).toEqual(dashboardData);
  });
  
  test('Debe manejar correctamente la invalidación por tiempo', async () => {
    // Configurar caché con TTL corto para pruebas
    const shortTTLCache = new EnhancedCacheManager<Record<string, unknown>>({
      maxSize: 10,
      ttlMs: 100, // 100ms TTL
      cleanupInterval: 50 // 50ms intervalo
    });
    
    // Almacenar datos
    shortTTLCache.set('test-key', { value: 'test-data' });
    
    // Verificar que están en caché
    expect(shortTTLCache.get('test-key')).toBeDefined();
    
    // Esperar a que expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Verificar que ya no están en caché
    expect(shortTTLCache.get('test-key')).toBeUndefined();
  });
  
  test('Debe aplicar correctamente las políticas de evicción', async () => {
    // Crear caché con tamaño limitado
    const smallCache = new EnhancedCacheManager<Record<string, string>>({
      maxSize: 5,
      ttlMs: 60000
    });
    
    // Llenar la caché
    for (let i = 0; i < 5; i++) {
      smallCache.set(`key-${i}`, { value: `data-${i}` });
    }
    
    // Verificar que todos los elementos están en caché
    for (let i = 0; i < 5; i++) {
      expect(smallCache.get(`key-${i}`)).toBeDefined();
    }
    
    // Acceder repetidamente a ciertos elementos para afectar su prioridad
    for (let i = 0; i < 10; i++) {
      smallCache.get('key-2');
      smallCache.get('key-3');
    }
    
    // Agregar nuevo elemento que debería provocar evicción
    smallCache.set('key-new', { value: 'new-data' });
    
    // Verificar que los elementos menos relevantes fueron expulsados
    // Los más accedidos deberían permanecer
    expect(smallCache.get('key-2')).toBeDefined();
    expect(smallCache.get('key-3')).toBeDefined();
    expect(smallCache.get('key-new')).toBeDefined();
  });
  
  test('Debe estimar correctamente el uso de memoria', () => {
    const mockData: ClinicalDashboardData = {
      metrics: {
        totalPatients: 100,
        averageReliability: 4.2,
        conditionDistribution: { 'low-back-pain': 45, 'knee-pain': 55 },
        evidenceUsageStats: {
          totalEvidenceCount: 150,
          recentlyAccessedCount: 35,
          byCategory: { 'physiotherapy': 80, 'rehabilitation': 70 },
          byCondition: { 'low-back-pain': 60, 'knee-pain': 40, 'shoulder-pain': 50 },
          byTreatment: { 'manual-therapy': 70, 'exercise-therapy': 80 },
          bySource: { 'journal': 50, 'systematic_review': 50, 'guideline': 50 },
          byReliability: { '1': 10, '2': 20, '3': 30, '4': 40, '5': 50 }
        },
        evidenceLevels: [
          { level: '1A', count: 30, description: 'Systematic Reviews', color: '#123456' }
        ],
        popularSearches: [
          { term: 'back pain exercises', count: 45, trending: true }
        ],
        recentlyUpdated: [],
        cachePerformance: {
          hitRate: 70,
          missRate: 30,
          avgLoadTime: 150,
          size: 0.5
        }
      } as ClinicalMetrics,
      recentEvidence: [
        {
          id: 'test-id-1',
          title: 'Evidence Title 1',
          sources: [{
            id: 'source-1',
            name: 'Journal 1',
            url: 'https://example.com/1',
            type: 'journal',
            reliability: 4,
            verificationStatus: 'verified',
            lastUpdated: '2023-01-01'
          }],
          abstract: 'This is a test abstract with reasonable length to test memory estimation',
          relevance: 0.85,
          reliabilityScore: 4,
          type: 'rct',
          url: 'https://example.com/1',
          publicationDate: '2023-01-01',
          summary: 'Test evidence summary 1',
          relevanceScore: 85,
          conditionTags: ['test-condition-1'],
          treatmentTags: ['test-treatment-1'],
          categoryTags: ['test-category-1']
        } as ClinicalEvidence,
        {
          id: 'test-id-2',
          title: 'Evidence Title 2',
          sources: [{
            id: 'source-2',
            name: 'Journal 2',
            url: 'https://example.com/2',
            type: 'systematic_review',
            reliability: 3,
            verificationStatus: 'pending',
            lastUpdated: '2023-02-15'
          }],
          abstract: 'Another test abstract with different content to ensure variance in memory estimates',
          relevance: 0.78,
          reliabilityScore: 3,
          type: 'systematic-review',
          url: 'https://example.com/2',
          publicationDate: '2023-02-15',
          summary: 'Test evidence summary 2',
          relevanceScore: 78,
          conditionTags: ['test-condition-2'],
          treatmentTags: ['test-treatment-2'],
          categoryTags: ['test-category-2']
        } as ClinicalEvidence
      ],
      lastUpdated: new Date().toISOString(),
      visualizations: [],
      filters: {
        conditions: ['test-condition-1', 'test-condition-2'],
        treatments: ['test-treatment-1', 'test-treatment-2']
      },
      config: {
        defaultFilters: {},
        enableCache: true,
        cacheConfig: {
          ttl: 15 * 60 * 1000,
          priority: 'high'
        },
        refreshInterval: 5 * 60 * 1000,
        layout: 'grid',
        charts: {
          colorScheme: 'blues',
          showLegends: true,
          interactive: true
        }
      }
    };
    
    // Estimar tamaño con nuestro estimador
    const estimatedSize = estimateClinicalDashboardSize(mockData);
    
    // Verificar que la estimación sea razonable (> 0)
    expect(estimatedSize).toBeGreaterThan(0);
    
    // Crear caché con límite de memoria
    const memoryLimitedCache = new EnhancedCacheManager<ClinicalDashboardData>({
      maxSize: 100,
      ttlMs: 60000
    }, undefined, 'weighted', estimateClinicalDashboardSize);
    
    // Almacenar múltiples elementos
    for (let i = 0; i < 5; i++) {
      const dataWithId = { 
        ...mockData,
        metrics: {
          ...mockData.metrics,
          id: `test-${i}`
        }
      };
      memoryLimitedCache.set(`memory-key-${i}`, dataWithId);
    }
    
    // Verificar que la caché no excedió su límite de memoria
    const stats = memoryLimitedCache.getStats();
    expect(stats.size).toBeLessThanOrEqual(100);
    expect(stats.memoryUsageMB).toBeDefined();
  });
});
