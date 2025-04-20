// Script de benchmark simplificado para probar el rendimiento de la caché

// Simulación de datos
const CONDITIONS = ['low-back-pain', 'knee-osteoarthritis', 'rotator-cuff-injury', 'ankle-sprain', 'plantar-fasciitis'];
const TREATMENTS = ['manual-therapy', 'exercise-therapy', 'electrotherapy', 'dry-needling', 'taping'];
const CATEGORIES = ['physiotherapy', 'rehabilitation', 'pain-management', 'orthopedics', 'sports-medicine'];

// Simulación del EnhancedCacheManager
class MockCacheManager {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }
  
  get(key) {
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    return undefined;
  }
  
  set(key, value) {
    // Política de evicción básica si se alcanza el máximo
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRatio: this.hits / (this.hits + this.misses || 1)
    };
  }
}

// Generador de datos aleatorios
function generateRandomFilter() {
  const selectedConditions = CONDITIONS
    .filter(() => Math.random() > 0.5)
    .slice(0, Math.floor(Math.random() * 3));
    
  const selectedTreatments = TREATMENTS
    .filter(() => Math.random() > 0.5)
    .slice(0, Math.floor(Math.random() * 3));
    
  const selectedCategories = CATEGORIES
    .filter(() => Math.random() > 0.5)
    .slice(0, Math.floor(Math.random() * 3));
  
  return {
    conditions: selectedConditions,
    treatments: selectedTreatments,
    categories: selectedCategories,
    minReliability: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined,
    searchTerm: Math.random() > 0.8 ? `término-${Math.floor(Math.random() * 10)}` : undefined
  };
}

// Genera una clave basada en filtros
function generateCacheKey(filter) {
  const normalized = {
    patientId: filter.patientId || '',
    categories: (filter.categories || []).sort().join(','),
    conditions: (filter.conditions || []).sort().join(','),
    treatments: (filter.treatments || []).sort().join(','),
    minReliability: filter.minReliability || '',
    searchTerm: filter.searchTerm || ''
  };
  
  return `clinical-dashboard:${JSON.stringify(normalized)}`;
}

// Simula obtener datos (con latencia artificial)
async function fetchData(filter) {
  // Simular un tiempo de obtención de datos
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  
  return {
    metrics: { total: Math.floor(Math.random() * 1000) },
    filters: filter,
    lastUpdated: new Date().toISOString()
  };
}

// Ejecuta el benchmark
async function runBenchmark() {
  console.log('Iniciando benchmark de caché...');
  
  const cacheSizes = [10, 50, 100, 200];
  
  for (const size of cacheSizes) {
    console.log(`\n===== TESTING CACHE SIZE: ${size} =====`);
    
    const cache = new MockCacheManager(size);
    const totalRequests = size * 3; // 3 veces el tamaño para forzar evictions
    const uniqueFilters = size;
    const repetitionFactor = 0.7; // 70% de repetición
    
    // Generar filtros únicos
    const filters = Array(uniqueFilters).fill(0).map(() => generateRandomFilter());
    
    console.time('Total execution time');
    let totalTime = 0;
    
    // Ejecutar simulación
    for (let i = 0; i < totalRequests; i++) {
      // Determinar si usamos filtro existente o nuevo
      const useExistingFilter = Math.random() < repetitionFactor;
      const filterIndex = useExistingFilter 
        ? Math.floor(Math.random() * filters.length) 
        : Math.floor(Math.random() * uniqueFilters);
      
      const filter = filters[filterIndex];
      const cacheKey = generateCacheKey(filter);
      
      const start = performance.now();
      
      // Intentar obtener de caché
      let data = cache.get(cacheKey);
      
      // Si no está en caché, obtener y almacenar
      if (!data) {
        data = await fetchData(filter);
        cache.set(cacheKey, data);
      }
      
      const end = performance.now();
      totalTime += (end - start);
      
      // Mostrar progreso
      if (i % Math.max(1, Math.floor(totalRequests / 10)) === 0) {
        console.log(`Progreso: ${i}/${totalRequests}`);
      }
    }
    
    console.timeEnd('Total execution time');
    
    // Mostrar resultados
    const stats = cache.getStats();
    console.log('\nResultados:');
    console.log(`- Hit Ratio: ${(stats.hitRatio * 100).toFixed(2)}%`);
    console.log(`- Hits: ${stats.hits}`);
    console.log(`- Misses: ${stats.misses}`);
    console.log(`- Tamaño final de caché: ${stats.size}`);
    console.log(`- Tiempo promedio por operación: ${(totalTime / totalRequests).toFixed(2)}ms`);
  }
  
  console.log('\nBenchmark completado!');
}

// Ejecutar benchmark
runBenchmark().catch(console.error); 