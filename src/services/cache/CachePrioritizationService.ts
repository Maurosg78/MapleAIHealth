/**
 * Algoritmos de priorización soportados
 */
export type PrioritizationAlgorithm = 
  | 'lru'      // Least Recently Used
  | 'lfu'      // Least Frequently Used
  | 'fifo'     // First In First Out
  | 'adaptive' // Adaptativo - combina múltiples factores
  | 'weighted'; // Ponderado - basado en pesos asignados

/**
 * Criterios para la priorización
 */
export interface PrioritizationCriteria {
  // Factores
  recencyWeight?: number; // Peso de la recencia de acceso (0-1)
  frequencyWeight?: number; // Peso de la frecuencia de acceso (0-1)
  sizeWeight?: number; // Peso del tamaño del item (0-1)
  costWeight?: number; // Peso del costo de obtención (0-1)
  
  // Configuración de tiempo
  shortTermSpan?: number; // Ventana de tiempo para prioridad a corto plazo (ms)
  mediumTermSpan?: number; // Ventana de tiempo para prioridad a medio plazo (ms)
  
  // Configuración específica por sección
  sectionOverrides?: Record<string, Partial<PrioritizationCriteria>>; // Criterios específicos por sección
  patientEmphasis?: boolean; // Si debe enfatizar contexto de paciente actual
}

/**
 * Metadatos de uso para un elemento en caché
 */
export interface CacheItemUsage {
  key: string;
  accessCount: number;
  lastAccess: number;
  createdAt: number;
  size?: number;
  cost?: number;
  section?: string;
  patientId?: string;
}

/**
 * Resultado de la evaluación de prioridad
 */
export interface PriorityScore {
  key: string;
  score: number; // Mayor número = mayor prioridad
  factors: {
    recency?: number;
    frequency?: number;
    size?: number;
    cost?: number;
    contextual?: number;
  };
}

/**
 * Servicio que implementa diferentes algoritmos de priorización
 * para optimizar qué contenido se mantiene en caché
 */
export class CachePrioritizationService {
  private criteria: PrioritizationCriteria;
  private algorithm: PrioritizationAlgorithm;
  private currentPatientContext?: string;
  
  constructor(
    algorithm: PrioritizationAlgorithm = 'adaptive',
    criteria: PrioritizationCriteria = {
      recencyWeight: 0.4,
      frequencyWeight: 0.3,
      sizeWeight: 0.1,
      costWeight: 0.2,
      shortTermSpan: 15 * 60 * 1000, // 15 minutos
      mediumTermSpan: 60 * 60 * 1000, // 1 hora
      patientEmphasis: true
    }
  ) {
    this.algorithm = algorithm;
    this.criteria = criteria;
  }
  
  /**
   * Establece el contexto actual del paciente
   * @param patientId ID del paciente actual
   */
  public setPatientContext(patientId?: string): void {
    this.currentPatientContext = patientId;
  }
  
  /**
   * Calcula la puntuación de prioridad para una lista de elementos
   * @param items Lista de elementos a priorizar
   * @returns Lista ordenada por prioridad (mayor primero)
   */
  public prioritize(items: CacheItemUsage[]): PriorityScore[] {
    const now = Date.now();
    
    // Aplicar algoritmo seleccionado
    let scores: PriorityScore[] = [];
    
    switch (this.algorithm) {
      case 'lru':
        scores = this.calculateLRUScores(items, now);
        break;
      case 'lfu':
        scores = this.calculateLFUScores(items);
        break;
      case 'fifo':
        scores = this.calculateFIFOScores(items, now);
        break;
      case 'weighted':
        scores = this.calculateWeightedScores(items, now);
        break;
      case 'adaptive':
      default:
        scores = this.calculateAdaptiveScores(items, now);
        break;
    }
    
    // Ordenar por puntuación (mayor primero)
    return scores.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Calcula puntuaciones usando LRU (Least Recently Used)
   */
  private calculateLRUScores(items: CacheItemUsage[], now: number): PriorityScore[] {
    return items.map(item => {
      const recencyScore = now - item.lastAccess;
      
      return {
        key: item.key,
        score: -recencyScore, // Negativo para que valores más recientes tengan mayor puntuación
        factors: {
          recency: 1
        }
      };
    });
  }
  
  /**
   * Calcula puntuaciones usando LFU (Least Frequently Used)
   */
  private calculateLFUScores(items: CacheItemUsage[]): PriorityScore[] {
    return items.map(item => {
      return {
        key: item.key,
        score: item.accessCount,
        factors: {
          frequency: 1
        }
      };
    });
  }
  
  /**
   * Calcula puntuaciones usando FIFO (First In First Out)
   */
  private calculateFIFOScores(items: CacheItemUsage[], now: number): PriorityScore[] {
    return items.map(item => {
      const ageScore = now - item.createdAt;
      
      return {
        key: item.key,
        score: -ageScore, // Negativo para que elementos más nuevos tengan mayor puntuación
        factors: {
          recency: 1
        }
      };
    });
  }
  
  /**
   * Calcula puntuaciones usando un algoritmo ponderado
   */
  private calculateWeightedScores(items: CacheItemUsage[], now: number): PriorityScore[] {
    const { recencyWeight = 0.4, frequencyWeight = 0.3, sizeWeight = 0.1, costWeight = 0.2 } = this.criteria;
    
    return items.map(item => {
      // Normalizar valores
      const maxRecency = 24 * 60 * 60 * 1000; // 1 día como máximo para normalización
      const recencyScore = 1 - Math.min(1, (now - item.lastAccess) / maxRecency);
      
      const maxFrequency = 100; // Asumimos 100 como máximo de accesos para normalización
      const frequencyScore = Math.min(1, item.accessCount / maxFrequency);
      
      const maxSize = 1024 * 1024; // 1MB como máximo para normalización
      const sizeScore = item.size ? 1 - Math.min(1, item.size / maxSize) : 0.5;
      
      const maxCost = 2000; // 2 segundos como máximo para normalización
      const costScore = item.cost ? Math.min(1, item.cost / maxCost) : 0.5;
      
      // Calcular puntuación ponderada
      const score = 
        recencyWeight * recencyScore +
        frequencyWeight * frequencyScore +
        sizeWeight * sizeScore +
        costWeight * costScore;
      
      return {
        key: item.key,
        score,
        factors: {
          recency: recencyScore,
          frequency: frequencyScore,
          size: sizeScore,
          cost: costScore
        }
      };
    });
  }
  
  /**
   * Calcula puntuaciones usando un algoritmo adaptativo
   * que ajusta los pesos según el contexto y patrones de uso
   */
  private calculateAdaptiveScores(items: CacheItemUsage[], now: number): PriorityScore[] {
    return items.map(item => {
      // Criterios base o específicos por sección
      let criteria = { ...this.criteria };
      
      // Verificar si hay criterios específicos para esta sección
      if (item.section && criteria.sectionOverrides?.[item.section]) {
        criteria = { ...criteria, ...criteria.sectionOverrides[item.section] };
      }
      
      // Factor de recencia (más reciente = mayor puntuación)
      const recency = now - item.lastAccess;
      const shortTerm = criteria.shortTermSpan || 15 * 60 * 1000;
      const mediumTerm = criteria.mediumTermSpan || 60 * 60 * 1000;
      
      let recencyScore = 0;
      if (recency <= shortTerm) {
        // Acceso reciente (últimos 15 min) - alta prioridad
        recencyScore = 1 - (recency / shortTerm) * 0.5;
      } else if (recency <= mediumTerm) {
        // Acceso a medio plazo (últimos 60 min) - prioridad media
        recencyScore = 0.5 - ((recency - shortTerm) / (mediumTerm - shortTerm)) * 0.3;
      } else {
        // Acceso antiguo - baja prioridad
        recencyScore = 0.2 * Math.max(0, 1 - (recency - mediumTerm) / (24 * 60 * 60 * 1000));
      }
      
      // Factor de frecuencia (más accesos = mayor puntuación)
      const frequencyScore = Math.min(1, item.accessCount / 20) * 0.8;
      
      // Factor contextual (relacionado con el paciente actual)
      let contextScore = 0;
      if (criteria.patientEmphasis && this.currentPatientContext && item.patientId === this.currentPatientContext) {
        contextScore = 0.6; // Aumentar prioridad para el paciente actual
      }
      
      // Factor de tamaño/costo
      const complexityScore = item.cost 
        ? 0.4 * Math.min(1, item.cost / 500) 
        : item.size 
          ? 0.3 * (1 - Math.min(1, item.size / (512 * 1024)))
          : 0;
      
      // Calcular puntuación final
      const score = (
        (recencyScore * (criteria.recencyWeight || 0.4)) +
        (frequencyScore * (criteria.frequencyWeight || 0.3)) +
        contextScore +
        (complexityScore * (criteria.costWeight || 0.2))
      );
      
      return {
        key: item.key,
        score,
        factors: {
          recency: recencyScore,
          frequency: frequencyScore,
          contextual: contextScore,
          cost: complexityScore
        }
      };
    });
  }
  
  /**
   * Determina qué elementos deben mantenerse en caché
   * @param items Lista de elementos
   * @param maxItems Número máximo de elementos a mantener
   * @returns Claves de los elementos que deben mantenerse
   */
  public selectItemsToKeep(items: CacheItemUsage[], maxItems: number): string[] {
    if (items.length <= maxItems) {
      return items.map(item => item.key);
    }
    
    const prioritizedItems = this.prioritize(items);
    return prioritizedItems.slice(0, maxItems).map(item => item.key);
  }
  
  /**
   * Determina qué elementos deben eliminarse de la caché
   * @param items Lista de elementos
   * @param countToRemove Número de elementos a eliminar
   * @returns Claves de los elementos que deben eliminarse
   */
  public selectItemsToEvict(items: CacheItemUsage[], countToRemove: number): string[] {
    if (countToRemove <= 0) {
      return [];
    }
    
    if (countToRemove >= items.length) {
      return items.map(item => item.key);
    }
    
    const prioritizedItems = this.prioritize(items);
    return prioritizedItems.slice(-countToRemove).map(item => item.key);
  }
  
  /**
   * Actualiza el algoritmo de priorización
   */
  public setAlgorithm(algorithm: PrioritizationAlgorithm): void {
    this.algorithm = algorithm;
  }
  
  /**
   * Actualiza los criterios de priorización
   */
  public updateCriteria(criteria: Partial<PrioritizationCriteria>): void {
    this.criteria = { ...this.criteria, ...criteria };
  }
  
  /**
   * Añade una configuración de criterios específica para una sección
   */
  public addSectionCriteria(section: string, criteria: Partial<PrioritizationCriteria>): void {
    if (!this.criteria.sectionOverrides) {
      this.criteria.sectionOverrides = {};
    }
    
    this.criteria.sectionOverrides[section] = criteria;
  }
} 