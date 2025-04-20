import { 
  ClinicalDashboardData, 
  ClinicalEvidence, 
  ClinicalDashboardFilters, 
  ClinicalDashboardConfig,
  EvidenceVisualization,
  ClinicalMetrics,
  EvidenceSource
} from '../types/clinicalDashboard';
import { EnhancedCacheManager } from './cache/EnhancedCacheManager';
import { commonInvalidationRules } from './cache/InvalidationStrategy';
import { estimateClinicalDashboardSize } from './cache/utils/memorySizeEstimator';
import { CacheManagerFactory } from './cache/CacheManagerFactory';
import { CacheMetadata } from './cache/types';

// Configuración por defecto para el dashboard
const DEFAULT_CONFIG: ClinicalDashboardConfig = {
  defaultFilters: {},
  enableCache: true,
  cacheConfig: {
    ttl: 15 * 60 * 1000, // 15 minutos
    priority: 'high',
  },
  refreshInterval: 5 * 60 * 1000, // 5 minutos
  layout: 'grid',
  charts: {
    colorScheme: 'blues',
    showLegends: true,
    interactive: true
  }
};

// Inicializar caché para el dashboard con optimizaciones para grandes conjuntos de datos
const dashboardCache = new EnhancedCacheManager<ClinicalDashboardData>(
  {
    ttlMs: 15 * 60 * 1000, // 15 minutos
    maxSize: 50, // Máximo 50 dashboards en caché
    cleanupInterval: 60 * 1000, // Limpiar cada minuto
    patientBased: true // Habilitar agrupación por paciente
  }, 
  {
    rules: commonInvalidationRules,
    defaultTTL: 15 * 60 * 1000,
    enablePatientScoping: true,
    enableSectionScoping: true,
    enableDependencyTracking: true
  },
  'adaptive', // Algoritmo de priorización
  estimateClinicalDashboardSize // Estimador de tamaño en memoria
);

/**
 * Servicio para obtener datos del Dashboard de Información Clínica
 */
export class ClinicalDashboardService {
  private cacheManager: CacheManager<ClinicalDashboardData>;
  
  constructor() {
    // Reemplazar inicialización de caché existente con la versión mejorada
    this.cacheManager = CacheManagerFactory.getInstanceForSection<ClinicalDashboardData>('clinical-dashboard', {
      patientBased: true
    });
  }
  
  /**
   * Obtiene los datos del dashboard según los filtros especificados
   * @param filters Filtros a aplicar
   * @param config Configuración del dashboard
   * @param useCache Si debe usar la caché
   */
  public async getDashboardData(
    filters: ClinicalDashboardFilters, 
    config: Partial<ClinicalDashboardConfig> = {},
    useCache: boolean = true
  ): Promise<ClinicalDashboardData> {
    const cacheKey = this.generateCacheKey(filters);
    
    // Verificar caché si está habilitado
    if (useCache) {
      const cachedData = this.cacheManager.get(cacheKey);
      if (cachedData) {
        console.log('Returning cached clinical dashboard data');
        return cachedData;
      }
    }
    
    // Si no hay datos en caché o caché deshabilitado, obtener datos
    console.log('Fetching fresh clinical dashboard data');
    const dashboardData = await this.fetchClinicalDashboardData(filters, config);
    
    // Almacenar en caché con metadatos mejorados
    if (useCache) {
      const metadata: CacheMetadata = {
        patientId: filters.patientId,
        section: 'clinical-dashboard',
        dynamic: Boolean(filters.searchTerm),
        ttl: filters.searchTerm ? 5 * 60 * 1000 : undefined // TTL más corto para búsquedas
      };
      
      this.cacheManager.set(cacheKey, dashboardData, metadata);
    }
    
    return dashboardData;
  }
  
  /**
   * Genera una clave de caché basada en los filtros aplicados
   */
  public generateCacheKey(filters: ClinicalDashboardFilters): string {
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
      searchTerm: filters.searchTerm || ''
    };
    
    return `clinical-dashboard:${JSON.stringify(normalized)}`;
  }
  
  /**
   * Obtiene métricas clínicas (simulado por ahora)
   */
  private async fetchClinicalMetrics(filters: ClinicalDashboardFilters): Promise<ClinicalMetrics> {
    // Simulación de datos para desarrollo
    // En una implementación real, usaríamos filters para filtrar los datos
    console.log('Filtros aplicados:', filters.patientId, filters.timeRange);
    
    return {
      evidenceUsageStats: {
        totalEvidenceCount: 1250,
        recentlyAccessedCount: 78,
        byCategory: {
          'physiotherapy': 420,
          'rehabilitation': 345,
          'pain-management': 210,
          'orthopedics': 175,
          'sports-medicine': 100
        },
        byCondition: {
          'low-back-pain': 210,
          'knee-osteoarthritis': 185,
          'rotator-cuff-injury': 140,
          'ankle-sprain': 120,
          'plantar-fasciitis': 95
        },
        byTreatment: {
          'manual-therapy': 310,
          'exercise-therapy': 290,
          'electrotherapy': 210,
          'dry-needling': 170,
          'taping': 130
        },
        bySource: {
          'journal': 620,
          'systematic_review': 340,
          'meta_analysis': 190,
          'guideline': 80,
          'study': 20
        },
        byReliability: {
          '5': 420,
          '4': 380,
          '3': 250,
          '2': 150,
          '1': 50
        }
      },
      evidenceLevels: [
        { level: '1A', count: 210, description: 'Revisiones sistemáticas', color: '#2C5282' },
        { level: '1B', count: 180, description: 'Ensayos clínicos aleatorizados', color: '#3182CE' },
        { level: '2A', count: 150, description: 'Revisiones con homogeneidad', color: '#4299E1' },
        { level: '2B', count: 240, description: 'Estudios de cohortes', color: '#63B3ED' },
        { level: '3', count: 180, description: 'Estudios de casos y controles', color: '#90CDF4' },
        { level: '4', count: 240, description: 'Series de casos', color: '#BEE3F8' },
        { level: '5', count: 50, description: 'Opinión de expertos', color: '#EBF8FF' }
      ],
      popularSearches: [
        { term: 'ejercicios para lumbalgia', count: 245, trending: true },
        { term: 'estiramientos isquiotibiales', count: 189, trending: false },
        { term: 'tratamiento túnel carpiano', count: 176, trending: true },
        { term: 'terapia manual cervical', count: 152, trending: false },
        { term: 'ejercicios propiocepción', count: 143, trending: true }
      ],
      recentlyUpdated: this.generateMockEvidence(3),
      cachePerformance: {
        hitRate: 76.4,
        missRate: 23.6,
        avgLoadTime: 245, // ms
        size: 1.2 // MB
      }
    };
  }
  
  /**
   * Obtiene evidencia clínica reciente (simulado por ahora)
   */
  private async fetchRecentEvidence(filters: ClinicalDashboardFilters): Promise<ClinicalEvidence[]> {
    // En el futuro, implementar lógica de filtrado real
    // Por ahora solo registramos los filtros para evitar warnings de linting
    console.log('Buscando evidencia con filtros:', filters.searchTerm, filters.categories);
    
    return this.generateMockEvidence(10);
  }
  
  /**
   * Obtiene visualizaciones para la evidencia (simulado por ahora)
   */
  private async fetchVisualizations(evidence: ClinicalEvidence[]): Promise<EvidenceVisualization[]> {
    // Generar visualizaciones basadas en la evidencia
    return evidence.slice(0, 5).map((item, index) => ({
      id: `viz-${index + 1}`,
      title: `Visualización para ${item.title}`,
      evidenceId: item.id,
      type: ['chart', 'table', 'graph', 'timeline', 'comparison'][index % 5] as EvidenceVisualization['type'],
      config: {
        dataType: 'outcomes',
        xAxis: 'treatment',
        yAxis: 'improvement',
        series: ['control', 'treatment'],
        colors: ['#4285F4', '#34A853']
      },
      lastRendered: new Date().toISOString()
    }));
  }
  
  /**
   * Genera evidencia de prueba para desarrollo
   */
  private generateMockEvidence(count: number): ClinicalEvidence[] {
    const evidenceTypes: Array<EvidenceSource['type']> = [
      'journal', 'guideline', 'study', 'systematic_review', 'meta_analysis'
    ];
    
    const conditions = [
      'Low Back Pain', 'Knee Osteoarthritis', 'Rotator Cuff Injuries', 
      'Cervical Pain', 'Plantar Fasciitis', 'Tennis Elbow', 'Ankle Sprain'
    ];
    
    const treatments = [
      'Manual Therapy', 'Exercise Therapy', 'Dry Needling', 
      'Electrotherapy', 'Therapeutic Ultrasound', 'Taping'
    ];
    
    const categories = [
      'Physiotherapy', 'Rehabilitation', 'Pain Management', 
      'Orthopedics', 'Sports Medicine', 'Evidence Based Practice'
    ];
    
    return Array.from({ length: count }, (_, i) => {
      const conditionTags = [
        conditions[Math.floor(Math.random() * conditions.length)],
        conditions[Math.floor(Math.random() * conditions.length)]
      ].filter((v, i, a) => a.indexOf(v) === i); // Eliminar duplicados
      
      const treatmentTags = [
        treatments[Math.floor(Math.random() * treatments.length)],
        treatments[Math.floor(Math.random() * treatments.length)]
      ].filter((v, i, a) => a.indexOf(v) === i);
      
      const categoryTags = [
        categories[Math.floor(Math.random() * categories.length)],
        categories[Math.floor(Math.random() * categories.length)]
      ].filter((v, i, a) => a.indexOf(v) === i);
      
      return {
        id: `evidence-${i + 1}`,
        title: `Evidencia clínica sobre ${conditionTags.join(' y ')}`,
        summary: `Esta evidencia demuestra la efectividad de ${treatmentTags.join(' y ')} para el manejo de ${conditionTags.join(' y ')}.`,
        description: `Análisis detallado de la efectividad de diferentes modalidades de tratamiento para ${conditionTags.join(' y ')}. Los resultados sugieren que ${treatmentTags.join(' y ')} pueden ser particularmente efectivos.`,
        sources: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, j) => ({
          id: `source-${i}-${j}`,
          name: `Journal of ${categoryTags[0]} Research`,
          url: `https://example.com/journal/${i}${j}`,
          type: evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)],
          reliability: (1 + Math.floor(Math.random() * 5)) as 1 | 2 | 3 | 4 | 5,
          verificationStatus: Math.random() > 0.3 ? 'verified' : Math.random() > 0.5 ? 'pending' : 'unverified',
          lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        })),
        relevanceScore: 50 + Math.floor(Math.random() * 50),
        conditionTags: conditionTags.map(t => t.toLowerCase().replace(/\s+/g, '-')),
        treatmentTags: treatmentTags.map(t => t.toLowerCase().replace(/\s+/g, '-')),
        categoryTags: categoryTags.map(t => t.toLowerCase().replace(/\s+/g, '-')),
        publicationDate: new Date(
          2020 + Math.floor(Math.random() * 4), 
          Math.floor(Math.random() * 12), 
          1 + Math.floor(Math.random() * 28)
        ).toISOString().split('T')[0]
      };
    });
  }
  
  /**
   * Invalida la caché del dashboard
   */
  public invalidateCache(section?: string): void {
    if (section) {
      dashboardCache.invalidateBySection(section);
    } else {
      dashboardCache.invalidateBySection('clinical-dashboard');
    }
  }
  
  /**
   * Invalida la caché para un paciente específico
   */
  public invalidateCacheForPatient(patientId: string): void {
    if (this.cacheManager.invalidateByPatient) {
      this.cacheManager.invalidateByPatient(patientId);
    }
  }
  
  /**
   * Obtiene estadísticas de la caché del dashboard
   */
  public getCacheStats(): any {
    if (this.cacheManager.getStats) {
      return this.cacheManager.getStats();
    }
    return { enabled: false };
  }
  
  /**
   * Precarga configuraciones comunes del dashboard para mejorar el rendimiento inicial
   */
  public async preloadCommonConfigurations(): Promise<void> {
    try {
      // Lista de configuraciones comunes a precargar
      const commonConfigs = [
        // Dashboard sin filtros (vista general)
        { 
          filters: {}, 
          key: 'clinical-dashboard:{"patientId":"","categories":"","conditions":"","treatments":"","evidenceTypes":"","minReliability":"","dateRange":"","searchTerm":""}',
          metadata: { section: 'clinical-dashboard', dynamic: true }
        },
        // Dashboard filtrado por categoría común
        { 
          filters: { categories: ['physiotherapy'] }, 
          key: 'clinical-dashboard:{"patientId":"","categories":"physiotherapy","conditions":"","treatments":"","evidenceTypes":"","minReliability":"","dateRange":"","searchTerm":""}',
          metadata: { section: 'clinical-dashboard', dynamic: true }
        }
      ];
      
      // Precargar cada configuración
      for (const config of commonConfigs) {
        await dashboardCache.preloadCommonEntries([
          {
            key: config.key,
            getValue: async () => this.getDashboardData(config.filters, {}, false),
            metadata: config.metadata
          }
        ]);
      }
      
      console.log('Preloaded common dashboard configurations');
    } catch (error) {
      console.error('Error preloading dashboard configurations:', error);
    }
  }
} 