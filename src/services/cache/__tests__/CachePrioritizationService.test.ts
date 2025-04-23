import { CachePrioritizationService } from '../CachePrioritizationService';;;;;
import { CacheEntry, CacheStats } from '../types';;;;;

describe('CachePrioritizationService', () => {
  let service: CachePrioritizationService<any>;
  let mockStats: CacheStats;
  let mockEntry: CacheEntry<any>;

  beforeEach(() => {
    service = CachePrioritizationService.getInstance();
    
    mockStats = {
      hits: 1000,
      misses: 200,
      evictions: 50,
      totalEntries: 100,
      totalSize: 1024 * 1024, // 1MB
      maxEntrySize: 102400, // 100KB
      maxAccessCount: 100,
      totalEntryLifetime: 3600000 * 24 // 24 horas
    };

    mockEntry = {
      key: 'test-key',
      value: { data: 'test' },
      metadata: {
        lastAccess: Date.now(),
        accessCount: 50,
        size: 1024,
        section: 'clinical-dashboard',
        patientId: 'patient-1',
        isCritical: true
      }
    };
  });

  describe('calculateEntryScore', () => {
    it('debería calcular un score alto para entradas frecuentemente accedidas', () => {
      mockEntry.metadata.accessCount = 90;
      const score = service.calculateEntryScore(mockEntry, mockStats);
      expect(score).toBeGreaterThan(70);
    });

    it('debería calcular un score bajo para entradas raramente accedidas', () => {
      mockEntry.metadata.accessCount = 5;
      const score = service.calculateEntryScore(mockEntry, mockStats);
      expect(score).toBeLessThan(50);
    });

    it('debería penalizar entradas antiguas', () => {
      const oldDate = Date.now() - (24 * 60 * 60 * 1000); // 24 horas atrás
      mockEntry.metadata.lastAccess = oldDate;
      const score = service.calculateEntryScore(mockEntry, mockStats);
      expect(score).toBeLessThan(60);
    });

    it('debería priorizar entradas críticas', () => {
      mockEntry.metadata.isCritical = true;
      const criticalScore = service.calculateEntryScore(mockEntry, mockStats);
      
      mockEntry.metadata.isCritical = false;
      const normalScore = service.calculateEntryScore(mockEntry, mockStats);
      
      expect(criticalScore).toBeGreaterThan(normalScore);
    });
  });

  describe('selectEntriesForEviction', () => {
    it('debería seleccionar entradas con menor score para evicción', () => {
      const entries: CacheEntry<any>[] = [
        {
          key: 'high-priority',
          value: { data: 'important' },
          metadata: {
            lastAccess: Date.now(),
            accessCount: 90,
            size: 1024,
            isCritical: true
          }
        },
        {
          key: 'low-priority',
          value: { data: 'not-important' },
          metadata: {
            lastAccess: Date.now() - (48 * 60 * 60 * 1000),
            accessCount: 5,
            size: 1024,
            isCritical: false
          }
        }
      ];

      const targetSize = 1024;
      const keysToEvict = service.selectEntriesForEviction(entries, mockStats, targetSize);
      
      expect(keysToEvict).toContain('low-priority');
      expect(keysToEvict).not.toContain('high-priority');
    });
  });

  describe('monitorCachePerformance', () => {
    it('debería generar recomendaciones basadas en métricas', () => {
      mockStats.hits = 400;
      mockStats.misses = 600;
      const performance = service.monitorCachePerformance(mockStats);
      
      expect(performance.hitRatio).toBeLessThan(50);
      expect(performance.recommendations).toContain('Considerar aumentar el tamaño del caché');
    });

    it('debería detectar alta tasa de evicción', () => {
      mockStats.evictions = 50;
      mockStats.totalEntries = 100;
      const performance = service.monitorCachePerformance(mockStats);
      
      expect(performance.evictionRate).toBeGreaterThan(20);
      expect(performance.recommendations).toContain('Alta tasa de evicción - revisar política de retención');
    });

    it('debería detectar tiempo de vida promedio bajo', () => {
      mockStats.totalEntryLifetime = 1800000; // 30 minutos
      mockStats.totalEntries = 1;
      const performance = service.monitorCachePerformance(mockStats);
      
      expect(performance.avgEntryLifetime).toBeLessThan(3600000);
      expect(performance.recommendations).toContain('Tiempo de vida promedio bajo - ajustar TTL');
    });
  });
}); 