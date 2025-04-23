import { ClinicalDashboardData, ClinicalEvidence, ClinicalDashboardFilters, ClinicalMetrics } from '../types/clinicalDashboard';;;;;
import { CacheManager } from './cache/CacheManager';;;;;
import { CacheMetadata, CacheStats } from './cache/types';;;;;
import { EvidenceSearchService } from './EvidenceSearchService';;;;;
import { config } from '../config/config';;;;;

export class ClinicalDashboardService {
  private static instance: ClinicalDashboardService;
  private cacheManager: CacheManager<ClinicalDashboardData>;
  private evidenceSearchService: EvidenceSearchService;
  
  private constructor() {
    this.cacheManager = new CacheManager<ClinicalDashboardData>({
      ttlMs: config.medical.cache.ttl,
      maxSize: config.medical.cache.maxSize
    });
    this.evidenceSearchService = EvidenceSearchService.getInstance();
  }

  public static getInstance(): ClinicalDashboardService {
    if (!ClinicalDashboardService.instance) {
      ClinicalDashboardService.instance = new ClinicalDashboardService();
    }
    return ClinicalDashboardService.instance;
  }
  
  public async getDashboardData(
    filters: ClinicalDashboardFilters, 
    useCache: boolean = true
  ): Promise<ClinicalDashboardData> {
    const cacheKey = this.generateCacheKey(filters);
    
    if (useCache) {
      const cachedData = this.cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData as ClinicalDashboardData;
      }
    }
    
    const dashboardData = await this.fetchClinicalDashboardData(filters);
    
    if (useCache) {
      const metadata: CacheMetadata = {
        lastAccess: Date.now(),
        accessCount: 1,
        size: JSON.stringify(dashboardData).length,
        patientId: filters.patientId,
        section: 'clinical-dashboard'
      };
      
      this.cacheManager.set(cacheKey, dashboardData, metadata);
    }
    
    return dashboardData;
  }
  
  private generateCacheKey(filters: ClinicalDashboardFilters): string {
    const normalized = {
      patientId: filters.patientId || '',
      categories: filters.categories?.sort().join(',') || '',
      conditions: filters.conditions?.sort().join(',') || '',
      treatments: filters.treatments?.sort().join(',') || '',
      evidenceTypes: filters.evidenceTypes?.sort().join(',') || '',
      minReliability: filters.minReliability || '',
      dateRange: filters.dateRange 
        ? `${filters.dateRange.start}_${filters.dateRange.end}` 
        : '',
      searchTerm: filters.searchTerm || ''
    };
    
    return `clinical-dashboard:${JSON.stringify(normalized)}`;
  }
  
  private async fetchClinicalMetrics(filters: ClinicalDashboardFilters): Promise<ClinicalMetrics> {
    return {
      patientId: filters.patientId || '',
      lastVisit: new Date().toISOString(),
      nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      treatmentProgress: 75,
      painLevel: 3,
      mobilityScore: 85,
      adherenceToTreatment: 90,
      lastUpdated: new Date().toISOString(),
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
        avgLoadTime: 245,
        size: 1.2
      }
    };
  }
  
  private async fetchClinicalDashboardData(
    filters: ClinicalDashboardFilters
  ): Promise<ClinicalDashboardData> {
    const metrics = await this.fetchClinicalMetrics(filters);
    const recentEvidence = await this.fetchRecentEvidence();
    
    return {
      patientId: filters.patientId || '',
      metrics: {
        evidenceUsageStats: metrics.evidenceUsageStats,
        cachePerformance: metrics.cachePerformance,
        evidenceLevels: metrics.evidenceLevels
      },
      config: {
        refreshInterval: 300000 // 5 minutos
      },
      lastUpdated: new Date().toISOString(),
      recentEvidence: recentEvidence.map(ev => ({
        id: ev.id,
        title: ev.title,
        date: ev.lastUpdated,
        type: ev.categoryTags[0] || 'general'
      }))
    };
  }
  
  private async fetchRecentEvidence(): Promise<ClinicalEvidence[]> {
    return this.generateMockEvidence(5);
  }
  
  private generateMockEvidence(count: number): ClinicalEvidence[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `evidence-${i}`,
      title: `Evidencia de prueba ${i + 1}`,
      summary: `Resumen de evidencia ${i + 1}`,
      content: `Contenido detallado de la evidencia ${i + 1}`,
      source: 'Journal of Clinical Evidence',
      reliability: 4,
      relevanceScore: 85,
      conditionTags: ['dolor lumbar', 'fisioterapia'],
      treatmentTags: ['terapia manual', 'ejercicio'],
      categoryTags: ['rehabilitación', 'dolor crónico'],
      lastUpdated: new Date().toISOString()
    }));
  }
  
  public invalidateCache(): void {
    this.cacheManager.clear();
  }
  
  public invalidateCacheForPatient(): void {
    this.cacheManager.clear();
  }
  
  public getCacheStats(): CacheStats {
    return this.cacheManager.getStats();
  }
} 