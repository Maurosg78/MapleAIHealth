import { EnhancedCacheManager } from '../EnhancedCacheManager';;;;;
import { ClinicalDashboardService } from '../../clinicalDashboard';;;;;
import { ClinicalDashboardData, ClinicalDashboardFilters } from '../../../types/clinicalDashboard';;;;;

/**
 * Utilidad para medir el rendimiento de la caché con grandes conjuntos de datos
 */
class CacheBenchmarkUtil {
  private readonly dashboardService: ClinicalDashboardService;
  private cacheManager: EnhancedCacheManager<ClinicalDashboardData>;
  
  constructor() {
    this.dashboardService = new ClinicalDashboardService();
    this.cacheManager = new EnhancedCacheManager<ClinicalDashboardData>({
      ttlMs: 15 * 60 * 1000,
      maxSize: 100,
      cleanupInterval: 60 * 1000
    });
  }
  
  /**
   * Genera un conjunto de filtros aleatorios para simular diferentes usuarios
   */
  private generateRandomFilters(count: number): ClinicalDashboardFilters[] {
    const conditions = ['low-back-pain', 'knee-osteoarthritis', 'rotator-cuff-injury', 'ankle-sprain', 'plantar-fasciitis'];
    const treatments = ['manual-therapy', 'exercise-therapy', 'electrotherapy', 'dry-needling', 'taping'];
    const categories = ['physiotherapy', 'rehabilitation', 'pain-management', 'orthopedics', 'sports-medicine'];
    
    return Array.from({ length: count }, () => {
      // Seleccionar aleatoriamente algunos filtros
      const selectedConditions = conditions
        .filter(() => Math.random() > 0.5)
        .slice(0, Math.floor(Math.random() * 3));
        
      const selectedTreatments = treatments
        .filter(() => Math.random() > 0.5)
        .slice(0, Math.floor(Math.random() * 3));
        
      const selectedCategories = categories
        .filter(() => Math.random() > 0.5)
        .slice(0, Math.floor(Math.random() * 3));
      
      return {
        conditions: selectedConditions.length > 0 ? selectedConditions : undefined,
        treatments: selectedTreatments.length > 0 ? selectedTreatments : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        minReliability: Math.random() > 0.7 ? (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5 : undefined,
        searchTerm: Math.random() > 0.8 ? `término-${Math.floor(Math.random() * 10)}` : undefined
      };
    });
  }
  
  /**
   * Simula un patrón de acceso realista con repeticiones
   * @param totalRequests Número total de solicitudes a simular
   * @param uniqueFilters Número de filtros únicos a generar
   * @param repetitionFactor Factor de repetición (0-1) donde 1 es 100% repeticiones
   */
  public async simulateRealisticAccess(
    totalRequests: number = 1000,
    uniqueFilters: number = 50,
    repetitionFactor: number = 0.7
  ): Promise<{
    totalTime: number,
    hitCount: number,
    missCount: number,
    hitRatio: number,
    averageResponseTime: number
  }> {
    // Generar conjunto de filtros únicos
    const filters = this.generateRandomFilters(uniqueFilters);
    const results: Array<{ time: number, hit: boolean }> = [];
    
    console.time('Total simulation time');
    
    for (let i = 0; i < totalRequests; i++) {
      // Determinar si usamos un filtro existente o uno nuevo basado en el factor de repetición
      const useExistingFilter = Math.random() < repetitionFactor;
      
      // Seleccionar filtro
      const filterIndex = useExistingFilter
        ? Math.floor(Math.random() * filters.length)
        : Math.floor(Math.random() * uniqueFilters);
      
      const filter = filters[filterIndex];
      
      // Crear clave y verificar si está en caché
      const cacheKey = this.dashboardService.generateCacheKey(filter);
      const startTime = performance.now();
      
      let hit = false;
      
      try {
        // Intentar obtener de la caché
        const cached = this.cacheManager.get(cacheKey);
        
        if (cached) {
          hit = true;
        } else {
          // Si no está en caché, obtener datos y almacenar
          const data = await this.dashboardService.getDashboardData(filter, {}, false);
          this.cacheManager.set(cacheKey, data, {
            section: 'clinical-dashboard',
            dynamic: true
          });
        }
        
        const endTime = performance.now();
        results.push({
          time: endTime - startTime,
          hit
        });
      } catch (error) {
        console.error('Error during simulation:', error);
      }
      
      // Mostrar progreso cada 100 solicitudes
      if (i % 100 === 0) {
        
      }
    }
    
    console.timeEnd('Total simulation time');
    
    // Calcular estadísticas
    const hitCount = results.filter(r => r.hit).length;
    const missCount = results.filter(r => !r.hit).length;
    const hitRatio = hitCount / (hitCount + missCount);
    const totalTime = results.reduce((sum, r) => sum + r.time, 0);
    const averageResponseTime = totalTime / results.length;
    
    return {
      totalTime,
      hitCount,
      missCount,
      hitRatio,
      averageResponseTime
    };
  }
  
  /**
   * Ejecuta una prueba de rendimiento para diferentes tamaños de caché
   */
  public async benchmarkCacheSizes(sizes: number[] = [10, 50, 100, 200, 500]): Promise<void> {
    
    
    for (const size of sizes) {
      
      
      // Crear nueva instancia con tamaño específico
      this.cacheManager = new EnhancedCacheManager<ClinicalDashboardData>({
        ttlMs: 15 * 60 * 1000,
        maxSize: size,
        cleanupInterval: 60 * 1000
      });
      
      // Simular acceso con 3 veces el tamaño de la caché para forzar evictions
      const result = await this.simulateRealisticAccess(size * 3, size, 0.7);
      
      
      .toFixed(2)}%`);
      }ms`);
      
      
    }
  }
}

// Ejecutar benchmark
async function runBenchmark(): void {
  const benchmark = new CacheBenchmarkUtil();
  
  
  
  // Simular uso realista
  
  const realisticResult = await benchmark.simulateRealisticAccess(1000, 100, 0.7);
  
  .toFixed(2)}%`);
  }ms`);
  
  // Benchmark de tamaños de caché
  await benchmark.benchmarkCacheSizes();
  
  
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  runBenchmark().catch(console.error);
}

export { CacheBenchmarkUtil, runBenchmark }; 