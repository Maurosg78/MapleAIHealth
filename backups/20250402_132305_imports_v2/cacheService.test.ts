import {
   render, screen 
} from '@testing-library/react';
describe('CacheService', () => {
  import {
   HttpService 
} from '../../../lib/api';
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = CacheService.getInstance({
      maxSize: 100,
      ttl: 3600,
      cleanupInterval: 600,
    });
  });

  it('should store and retrieve data', async () => {
    const testData: AIResponse = {
      answer: 'Test answer',
      confidence: 0.9,
      timeline: [],
      insights: [],
      recommendations: [],
    };

    await cacheService.set('test-key', testData);

    expect(result).toEqual(testData);
  });

  it('should return null for non-existent keys', async () => {
    expect(result).toBeNull();
  });

  it('should clear the cache', async () => {
    const testData: AIResponse = {
      answer: 'Test answer',
      confidence: 0.9,
      timeline: [],
      insights: [],
      recommendations: [],
    };

    await cacheService.set('test-key', testData);
    await cacheService.clear();

    expect(result).toBeNull();
  });

  it('should track statistics', async () => {
    const testData: AIResponse = {
      answer: 'Test answer',
      confidence: 0.9,
      timeline: [],
      insights: [],
      recommendations: [],
    };

    await cacheService.set('test-key', testData);
    await cacheService.get('test-key'); // Hit
    await cacheService.get('non-existent'); // Miss

    expect(stats.totalQueries).toBe(3);

    // Verificamos que las tasas sean valores válidos
    expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    expect(stats.hitRate).toBeLessThanOrEqual(1);
    expect(stats.missRate).toBeGreaterThanOrEqual(0);
    expect(stats.missRate).toBeLessThanOrEqual(1);

    // La suma de las tasas debería ser 1
    expect(stats.hitRate + stats.missRate).toBeCloseTo(1);
  });
});
