// Test de carga intensivo para evaluar el sistema de caché con datasets grandes
import { performance } from 'perf_hooks';
import { TextEncoder } from 'util';

// Configuración del test
const TEST_CONFIG = {
  concurrentUsers: 10,        // Usuarios simulados (reducido para prueba rápida)
  requestsPerUser: 20,        // Solicitudes por usuario (reducido para prueba rápida)
  cacheSizes: [50, 200],      // Tamaños de caché a probar
  repetitionPattern: 0.8,     // 80% de solicitudes repetidas
  datasetSizes: {
    small: 1024,              // ~1KB
    medium: 1024 * 10,        // ~10KB
    large: 1024 * 50          // ~50KB (reducido para prueba rápida)
  },
  delayBetweenRequests: 2,    // ms entre solicitudes (reducido para prueba rápida)
  maxConcurrentRequests: 5
};

// Clase para simulación de caché avanzada
class AdvancedCacheManager {
  constructor(options = {}) {
    this.config = {
      maxSize: options.maxSize || 100,
      ttlMs: options.ttlMs || 60000,
      algorithm: options.algorithm || 'lru',
      estimatedMaxMemory: options.estimatedMaxMemory || 100 * 1024 * 1024 // 100MB por defecto
    };
    
    this.cache = new Map();
    this.accessCount = new Map();
    this.lastAccess = new Map();
    this.memoryUsage = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      memoryExceeded: 0,
      ttlExpired: 0
    };
  }
  
  // Estima el tamaño en bytes de un objeto
  estimateSize(obj) {
    // Convertir a JSON y contar bytes
    const jsonStr = JSON.stringify(obj);
    return new TextEncoder().encode(jsonStr).length;
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return undefined;
    }
    
    const entry = this.cache.get(key);
    const now = Date.now();
    
    // Verificar TTL
    if (now - entry.timestamp > this.config.ttlMs) {
      this.cache.delete(key);
      this.accessCount.delete(key);
      this.lastAccess.delete(key);
      this.memoryUsage -= entry.size;
      this.stats.ttlExpired++;
      this.stats.misses++;
      return undefined;
    }
    
    // Actualizar estadísticas de acceso
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, now);
    this.stats.hits++;
    
    return entry.data;
  }
  
  set(key, value) {
    const now = Date.now();
    const size = this.estimateSize(value);
    
    // Verificar si la entrada ya existe
    if (this.cache.has(key)) {
      const existingEntry = this.cache.get(key);
      this.memoryUsage = this.memoryUsage - existingEntry.size + size;
      
      this.cache.set(key, {
        data: value,
        timestamp: now,
        size
      });
      
      this.lastAccess.set(key, now);
      return;
    }
    
    // Verificar si hay espacio - aplicar política de evicción si es necesario
    while (
      (this.cache.size >= this.config.maxSize || 
       this.memoryUsage + size > this.config.estimatedMaxMemory) && 
      this.cache.size > 0
    ) {
      this.evictOne();
      this.stats.evictions++;
    }
    
    // Si aún excedería la memoria, no almacenar
    if (size > this.config.estimatedMaxMemory) {
      this.stats.memoryExceeded++;
      return;
    }
    
    // Almacenar la entrada
    this.cache.set(key, {
      data: value,
      timestamp: now,
      size
    });
    
    this.accessCount.set(key, 0);
    this.lastAccess.set(key, now);
    this.memoryUsage += size;
  }
  
  // Elimina la entrada menos valiosa según el algoritmo
  evictOne() {
    if (this.cache.size === 0) return;
    
    let keyToEvict;
    
    switch (this.config.algorithm) {
      case 'lru': // Least Recently Used
        keyToEvict = this.findLRUKey();
        break;
      case 'lfu': // Least Frequently Used
        keyToEvict = this.findLFUKey();
        break;
      case 'ttl': // Closest to TTL expiration
        keyToEvict = this.findOldestKey();
        break;
      case 'size': // Largest Size First
        keyToEvict = this.findLargestKey();
        break;
      default:
        keyToEvict = this.findLRUKey();
    }
    
    if (keyToEvict) {
      const entry = this.cache.get(keyToEvict);
      this.memoryUsage -= entry.size;
      this.cache.delete(keyToEvict);
      this.accessCount.delete(keyToEvict);
      this.lastAccess.delete(keyToEvict);
    }
  }
  
  findLRUKey() {
    let oldestAccess = Infinity;
    let lruKey;
    
    for (const [key, time] of this.lastAccess.entries()) {
      if (time < oldestAccess) {
        oldestAccess = time;
        lruKey = key;
      }
    }
    
    return lruKey;
  }
  
  findLFUKey() {
    let minAccessCount = Infinity;
    let lfuKey;
    
    for (const [key, count] of this.accessCount.entries()) {
      if (count < minAccessCount) {
        minAccessCount = count;
        lfuKey = key;
      }
    }
    
    return lfuKey;
  }
  
  findOldestKey() {
    let oldestTimestamp = Infinity;
    let oldestKey;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
  
  findLargestKey() {
    let maxSize = -1;
    let largestKey;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.size > maxSize) {
        maxSize = entry.size;
        largestKey = key;
      }
    }
    
    return largestKey;
  }
  
  clear() {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
    this.memoryUsage = 0;
  }
  
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
      memoryUsageMB: this.memoryUsage / (1024 * 1024),
      hitRatio: this.stats.hits / (this.stats.hits + this.stats.misses || 1)
    };
  }
}

// Generar datos ficticios de diferentes tamaños
function generateMockData(size) {
  const mockData = {
    id: `data-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    metrics: {},
    items: []
  };
  
  // Generar datos para alcanzar el tamaño aproximado
  let currentSize = JSON.stringify(mockData).length;
  const targetSize = size;
  
  // Agregar métricas
  for (let i = 0; i < 20; i++) {
    mockData.metrics[`metric_${i}`] = Math.random() * 1000;
  }
  
  // Agregar items hasta alcanzar tamaño objetivo
  while (currentSize < targetSize) {
    const item = {
      id: Math.floor(Math.random() * 1000000),
      name: `Item ${Math.random().toString(36).substring(2, 9)}`,
      value: Math.random() * 100,
      description: Array(20).fill(0).map(() => Math.random().toString(36).substring(2, 9)).join(' '),
      tags: Array(5).fill(0).map(() => Math.random().toString(36).substring(2, 9))
    };
    
    mockData.items.push(item);
    currentSize = JSON.stringify(mockData).length;
  }
  
  return mockData;
}

// Simula retraso de red y procesamiento
async function simulateNetworkDelay(min = 50, max = 150) {
  const delay = min + Math.random() * (max - min);
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Simula un usuario realizando múltiples solicitudes
async function simulateUser(userId, cache, config) {
  const results = {
    userId,
    totalTime: 0,
    requests: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
  
  // Generar conjunto de claves que este usuario solicitará
  const userKeys = [];
  const maxUniqueKeys = Math.ceil(config.requestsPerUser * (1 - config.repetitionPattern));
  
  for (let i = 0; i < maxUniqueKeys; i++) {
    userKeys.push(`user:${userId}:key:${i}`);
  }
  
  // Realizar solicitudes
  for (let i = 0; i < config.requestsPerUser; i++) {
    // Determinar si esta solicitud es repetida o nueva
    const useRepeatedKey = Math.random() < config.repetitionPattern && userKeys.length > 0;
    
    // Seleccionar clave
    const keyIndex = useRepeatedKey 
      ? Math.floor(Math.random() * userKeys.length)
      : userKeys.length;
      
    let key;
    if (useRepeatedKey) {
      key = userKeys[keyIndex];
    } else {
      key = `user:${userId}:key:${keyIndex}`;
      userKeys.push(key);
    }
    
    // Medir tiempo
    const start = performance.now();
    
    // Intentar obtener de caché
    let data = cache.get(key);
    let isCacheHit = Boolean(data);
    
    // Si no está en caché, generar y almacenar
    if (!data) {
      // Determinar tamaño de datos
      const dataSize = Math.random() < 0.8 
        ? config.datasetSizes.small // 80% son conjuntos pequeños
        : Math.random() < 0.5 
          ? config.datasetSizes.medium // 10% son conjuntos medianos
          : config.datasetSizes.large; // 10% son conjuntos grandes
      
      // Simular tiempo de servidor y red
      await simulateNetworkDelay();
      
      // Generar datos
      data = generateMockData(dataSize);
      
      // Almacenar en caché
      cache.set(key, data);
    }
    
    const end = performance.now();
    
    // Actualizar resultados
    results.totalTime += (end - start);
    results.requests++;
    
    if (isCacheHit) {
      results.cacheHits++;
    } else {
      results.cacheMisses++;
    }
    
    // Pequeño retraso entre solicitudes
    await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
  }
  
  return results;
}

// Ejecuta un test completo con un tamaño de caché específico
async function runTestWithCacheSize(cacheSize) {
  console.log(`\n===== EJECUTANDO TEST CON TAMAÑO DE CACHÉ: ${cacheSize} =====`);
  
  // Crear caché con el tamaño especificado
  const cache = new AdvancedCacheManager({
    maxSize: cacheSize,
    algorithm: 'lru',
    ttlMs: 60000,
    estimatedMaxMemory: 200 * 1024 * 1024 // 200MB
  });
  
  // Track active promises
  const activePromises = new Set();
  
  // Simular usuarios concurrentes
  const userPromises = [];
  console.time('Total test time');
  
  for (let userId = 0; userId < TEST_CONFIG.concurrentUsers; userId++) {
    // Control concurrency
    while (activePromises.size >= TEST_CONFIG.maxConcurrentRequests) {
      // Wait for some promises to complete
      await Promise.race(Array.from(activePromises));
    }
    
    const userPromise = simulateUser(userId, cache, TEST_CONFIG);
    activePromises.add(userPromise);
    
    userPromise.then(() => {
      activePromises.delete(userPromise);
    });
    
    userPromises.push(userPromise);
    
    // Mostrar progreso
    if (userId % 10 === 0) {
      console.log(`Iniciado usuario ${userId}/${TEST_CONFIG.concurrentUsers}`);
    }
  }
  
  // Esperar que todos los usuarios terminen
  const userResults = await Promise.all(userPromises);
  console.timeEnd('Total test time');
  
  // Calcular estadísticas
  const totalRequests = userResults.reduce((sum, r) => sum + r.requests, 0);
  const totalTime = userResults.reduce((sum, r) => sum + r.totalTime, 0);
  const totalHits = userResults.reduce((sum, r) => sum + r.cacheHits, 0);
  const totalMisses = userResults.reduce((sum, r) => sum + r.cacheMisses, 0);
  
  const avgTimePerRequest = totalTime / totalRequests;
  const hitRatio = totalHits / totalRequests;
  
  // Obtener estadísticas de la caché
  const cacheStats = cache.getStats();
  
  // Mostrar resultados
  console.log('\n===== RESULTADOS DEL TEST =====');
  console.log(`- Total solicitudes: ${totalRequests}`);
  console.log(`- Ratio de aciertos: ${(hitRatio * 100).toFixed(2)}%`);
  console.log(`- Tiempo promedio por solicitud: ${avgTimePerRequest.toFixed(2)}ms`);
  console.log('\n===== ESTADÍSTICAS DE CACHÉ =====');
  console.log(`- Tamaño final: ${cacheStats.size}/${cacheSize}`);
  console.log(`- Uso de memoria: ${cacheStats.memoryUsageMB.toFixed(2)}MB`);
  console.log(`- Expulsiones: ${cacheStats.evictions}`);
  console.log(`- Expirados por TTL: ${cacheStats.ttlExpired}`);
  console.log(`- Rechazados por memoria: ${cacheStats.memoryExceeded}`);
  
  return {
    cacheSize,
    totalRequests,
    hitRatio,
    avgTimePerRequest,
    cacheStats
  };
}

// Ejecuta todos los tests de carga
async function runLoadTests() {
  console.log('===== INICIANDO TESTS DE CARGA DE CACHÉ =====');
  console.log(`Configuración: ${TEST_CONFIG.concurrentUsers} usuarios, ${TEST_CONFIG.requestsPerUser} solicitudes por usuario`);
  
  const results = [];
  
  for (const cacheSize of TEST_CONFIG.cacheSizes) {
    const result = await runTestWithCacheSize(cacheSize);
    results.push(result);
  }
  
  // Comparar resultados
  console.log('\n===== COMPARACIÓN DE RESULTADOS =====');
  console.log('Tamaño caché | Hit Ratio | Tiempo promedio | Memoria');
  console.log('------------|-----------|-----------------|--------');
  results.forEach(r => {
    console.log(`${r.cacheSize.toString().padEnd(12)} | ${(r.hitRatio * 100).toFixed(2).padEnd(9)}% | ${r.avgTimePerRequest.toFixed(2).padEnd(15)}ms | ${r.cacheStats.memoryUsageMB.toFixed(2)}MB`);
  });
  
  console.log('\n===== TEST DE CARGA COMPLETADO =====');
}

// Ejecutar tests
runLoadTests().catch(console.error); 