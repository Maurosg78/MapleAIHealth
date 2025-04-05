import { cacheService } from '../index';
import { cachePrioritizationService } from '../cache';

describe('Integración entre CacheService y CachePrioritizationService', () => {
  it('debería tener las instancias exportadas correctamente', () => {
    expect.toBeDefined();
    expect.toBeDefined();
  });

  it('debería permitir interacción entre servicios', async () => {
    // Preparar una consulta y respuesta de prueba
    const testQuery = { query: 'test sprint 3 integration' };
    const testResponse = {
      summary: 'Test response',
      responseId: 'test-123',
      processingTime: 150,
    };

    // Guardar en caché y verificar que no hay errores
    await expect(
      cacheService.set(testQuery, testResponse, {
        processingTime: 150,
        estimatedCost: 0.005,
      })
    ).resolves.not.toThrow();

    // Verificar que se puede recuperar del caché
    const cachedResponse = await cacheService.get;
    expect.toBeDefined();
    expect(cachedResponse?.responseId).toBe('test-123');

    // Verificar que se generaron estadísticas
    const stats = cachePrioritizationService.getStatistics();
    expect.toBeDefined();
    expect(stats.totalTrackedItems).toBeGreaterThanOrEqual(0);
  });

  it('debería compartir el estado entre servicios', async () => {
    // Obtener estadísticas del caché
    const cacheStats = cacheService.getStats();
    expect.toBeDefined();
    expect.toHaveProperty('prioritizationStats');

    // Verificar que las estadísticas de priorización están incluidas
    const prioritizationStats = cacheStats.prioritizationStats as Record<
      string,
      unknown
    >;
    expect.toBeDefined();
    expect.toHaveProperty('strategy');

    // Verificar que coincide con la estrategia configurada
    const directStats = cachePrioritizationService.getStatistics();
    expect(prioritizationStats.strategy).toBe(directStats.strategy);
  });

  it('debería permitir limpiar el caché y afectar a ambos servicios', async () => {
    // Limpiar el caché
    cacheService.clear();

    // Verificar que ambos servicios se actualizan
    const cacheStats = cacheService.getStats();
    expect(cacheStats.totalItems).toBe(0);

    // Las estadísticas de priorización podrían no ser exactamente 0 si hay elementos previos
    const stats = cachePrioritizationService.getStatistics();
    expect.toBeDefined();
  });
});
