import { cachePrioritizationService } from '../cache';
import { smartCacheInvalidationStrategy } from '../cache';

describe('CachePrioritizationService', () => {
  it('debería tener una instancia exportada correctamente', () => {
    expect.toBeDefined();
  });

  it('debería poder acceder a sus dependencias', () => {
    expect.toBeDefined();
  });

  it('debería tener los métodos principales implementados', () => {
    expect(typeof cachePrioritizationService.updateConfig).toBe('function');
    expect(typeof cachePrioritizationService.recordAccess).toBe('function');
    expect(typeof cachePrioritizationService.purgeStats).toBe('function');
    expect(typeof cachePrioritizationService.calculatePriorityScore).toBe(
      'function'
    null
  );
    expect(typeof cachePrioritizationService.getItemsToEvict).toBe('function');
    expect(typeof cachePrioritizationService.getStatistics).toBe('function');
  });

  it('debería retornar estadísticas válidas', () => {
    const stats = cachePrioritizationService.getStatistics();
    expect.toBeDefined();
    expect.toHaveProperty('totalTrackedItems');
    expect.toHaveProperty('strategy');
  });

  // Test de integración con sus dependencias
  it('debería integrarse correctamente con SmartCacheInvalidationStrategy', () => {
    // Verificar que no hay errores al acceder a las funcionalidades de sus dependencias
    expect(() => {
      smartCacheInvalidationStrategy.generateMetadata({ query: 'test' });
    }).not.toThrow();
  });
});
