import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../cacheService';
import { AIResponse } from '../types';

describe('CacheService', () => {
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
    const result = await cacheService.get('test-key');
    expect(result).toEqual(testData);
  });

  it('should return null for non-existent keys', async () => {
    const result = await cacheService.get('non-existent');
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
    const result = await cacheService.get('test-key');
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

    const stats = cacheService.getStats();
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
