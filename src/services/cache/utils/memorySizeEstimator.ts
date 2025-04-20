/**
 * Utilidades para estimar el tamaño aproximado en memoria de diferentes tipos de datos
 * Estas estimaciones son aproximadas y se utilizan para optimizar la gestión de memoria en la caché
 */
import { ClinicalDashboardData, ClinicalEvidence } from '../../../types/clinicalDashboard';

/**
 * Tipos de datos básicos y sus tamaños aproximados en bytes
 * Basados en implementaciones típicas en navegadores modernos
 */
const PRIMITIVE_SIZES = {
  boolean: 4,
  number: 8,
  string: 2, // Por carácter
  object: 32, // Overhead básico por objeto
  array: 16, // Overhead básico por array
  date: 8,
  map: 40, // Overhead básico para Map
  set: 40, // Overhead básico para Set
  null: 0,
  undefined: 0
};

// Definir TypedArray para incluir todos los tipos de arrays tipados
type TypedArray = 
  | Int8Array 
  | Uint8Array 
  | Uint8ClampedArray 
  | Int16Array 
  | Uint16Array 
  | Int32Array 
  | Uint32Array 
  | Float32Array 
  | Float64Array;

/**
 * Tipos de colecciones que necesitan un manejo especial
 */
type Collection = 
  | Set<unknown> 
  | Map<unknown, unknown> 
  | WeakMap<object, unknown> 
  | WeakSet<object>;

/**
 * Verifica si un valor es una colección (Map, Set, WeakMap, WeakSet)
 */
function isCollection(obj: unknown): obj is Collection {
  return (
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof WeakMap ||
    obj instanceof WeakSet
  );
}

/**
 * Verifica si un valor es un TypedArray (Int8Array, Float32Array, etc.)
 */
function isTypedArray(obj: unknown): obj is TypedArray {
  return ArrayBuffer.isView(obj) && !(obj instanceof DataView);
}

/**
 * Estima el tamaño en memoria de un objeto
 * @param obj Objeto a estimar
 * @param seenObjects Mapa de objetos ya procesados (para evitar referencias circulares)
 * @returns Tamaño estimado en bytes
 */
export function estimateObjectSize(obj: unknown, seenObjects = new Map<object, boolean>()): number {
  // Valores nulos o undefined
  if (obj === null || obj === undefined) {
    return PRIMITIVE_SIZES.null;
  }
  
  // Evitar ciclos infinitos con objetos ya procesados
  if (typeof obj === 'object' && obj !== null && seenObjects.has(obj)) {
    return 0;
  }
  
  // Registrar este objeto como visto si es un objeto
  if (typeof obj === 'object' && obj !== null) {
    seenObjects.set(obj, true);
  }
  
  // Tipos primitivos
  if (typeof obj === 'boolean') {
    return PRIMITIVE_SIZES.boolean;
  }
  
  if (typeof obj === 'number') {
    return PRIMITIVE_SIZES.number;
  }
  
  if (typeof obj === 'string') {
    return obj.length * PRIMITIVE_SIZES.string + PRIMITIVE_SIZES.object;
  }
  
  // Función - tratamos como objeto
  if (typeof obj === 'function') {
    return PRIMITIVE_SIZES.object;
  }
  
  // Fecha
  if (obj instanceof Date) {
    return PRIMITIVE_SIZES.date;
  }
  
  // TypedArray
  if (isTypedArray(obj)) {
    // El tamaño real del buffer más el overhead
    return obj.byteLength + PRIMITIVE_SIZES.object;
  }
  
  // ArrayBuffer
  if (obj instanceof ArrayBuffer) {
    return obj.byteLength + PRIMITIVE_SIZES.object;
  }
  
  // Colecciones (Map, Set)
  if (isCollection(obj)) {
    let size = obj instanceof Map || obj instanceof Set ? PRIMITIVE_SIZES.map : PRIMITIVE_SIZES.object;
    
    // Sumar tamaños de elementos para Map y Set (no podemos con WeakMap/WeakSet)
    if (obj instanceof Map) {
      for (const [key, value] of obj.entries()) {
        size += estimateObjectSize(key, seenObjects);
        size += estimateObjectSize(value, seenObjects);
      }
    } else if (obj instanceof Set) {
      for (const item of obj.values()) {
        size += estimateObjectSize(item, seenObjects);
      }
    }
    
    return size;
  }
  
  // Array
  if (Array.isArray(obj)) {
    return PRIMITIVE_SIZES.array + 
      obj.reduce((total, item) => total + estimateObjectSize(item, seenObjects), 0);
  }
  
  // Objeto genérico
  if (typeof obj === 'object') {
    let size = PRIMITIVE_SIZES.object;
    
    // Sumar el tamaño de las propiedades
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Tamaño de la clave
        size += key.length * PRIMITIVE_SIZES.string;
        // Tamaño del valor
        size += estimateObjectSize((obj as Record<string, unknown>)[key], seenObjects);
      }
    }
    
    return size;
  }
  
  // Tipo no manejado
  return 0;
}

/**
 * Estimadores específicos para diferentes tipos de datos de la aplicación
 */

/**
 * Estima el tamaño de los datos del dashboard clínico
 * @param dashboardData Datos del dashboard clínico
 */
export function estimateClinicalDashboardSize(dashboardData: ClinicalDashboardData | null | undefined): number {
  // Si no hay datos, retornar 0
  if (!dashboardData) return 0;
  
  let size = PRIMITIVE_SIZES.object;
  
  // Estimar métricas
  if (dashboardData.metrics) {
    size += estimateObjectSize(dashboardData.metrics);
  }
  
  // Estimar evidencia reciente
  if (dashboardData.recentEvidence && Array.isArray(dashboardData.recentEvidence)) {
    size += PRIMITIVE_SIZES.array;
    size += dashboardData.recentEvidence.reduce(
      (total, evidence) => total + estimateObjectSize(evidence),
      0
    );
  }
  
  // Estimar visualizaciones
  if (dashboardData.visualizations && Array.isArray(dashboardData.visualizations)) {
    size += PRIMITIVE_SIZES.array;
    size += dashboardData.visualizations.reduce(
      (total, viz) => total + estimateObjectSize(viz),
      0
    );
  }
  
  // Estimar filtros
  if (dashboardData.filters) {
    size += estimateObjectSize(dashboardData.filters);
  }
  
  // Estimar configuración
  if (dashboardData.config) {
    size += estimateObjectSize(dashboardData.config);
  }
  
  // Otros campos
  if (dashboardData.lastUpdated && typeof dashboardData.lastUpdated === 'string') {
    size += dashboardData.lastUpdated.length * PRIMITIVE_SIZES.string;
  }
  
  return size;
}

/**
 * Estima el tamaño de una respuesta de evidencia clínica
 * @param evidence Datos de evidencia clínica
 */
export function estimateClinicalEvidenceSize(evidence: ClinicalEvidence | null | undefined): number {
  if (!evidence) return 0;
  
  let size = PRIMITIVE_SIZES.object;
  
  // Estimar campos principales de evidencia clínica
  if (evidence.title && typeof evidence.title === 'string') {
    size += evidence.title.length * PRIMITIVE_SIZES.string;
  }
  
  if (evidence.summary && typeof evidence.summary === 'string') {
    size += evidence.summary.length * PRIMITIVE_SIZES.string;
  }
  
  if (evidence.description && typeof evidence.description === 'string') {
    size += evidence.description.length * PRIMITIVE_SIZES.string;
  }
  
  // Estimar fuentes
  if (evidence.sources && Array.isArray(evidence.sources)) {
    size += PRIMITIVE_SIZES.array;
    size += evidence.sources.reduce(
      (total, source) => total + estimateObjectSize(source),
      0
    );
  }
  
  // Estimar tags
  if (evidence.conditionTags && Array.isArray(evidence.conditionTags)) {
    size += PRIMITIVE_SIZES.array;
    size += evidence.conditionTags.reduce(
      (total, tag) => total + (tag ? tag.length * PRIMITIVE_SIZES.string : 0),
      0
    );
  }
  
  if (evidence.treatmentTags && Array.isArray(evidence.treatmentTags)) {
    size += PRIMITIVE_SIZES.array;
    size += evidence.treatmentTags.reduce(
      (total, tag) => total + (tag ? tag.length * PRIMITIVE_SIZES.string : 0),
      0
    );
  }
  
  if (evidence.categoryTags && Array.isArray(evidence.categoryTags)) {
    size += PRIMITIVE_SIZES.array;
    size += evidence.categoryTags.reduce(
      (total, tag) => total + (tag ? tag.length * PRIMITIVE_SIZES.string : 0),
      0
    );
  }
  
  // Otros campos
  if (evidence.publicationDate && typeof evidence.publicationDate === 'string') {
    size += evidence.publicationDate.length * PRIMITIVE_SIZES.string;
  }
  
  // Propiedades restantes
  size += estimateObjectSize({
    id: evidence.id,
    relevanceScore: evidence.relevanceScore,
    cacheMetadata: evidence.cacheMetadata
  });
  
  return size;
}

/**
 * Estima el tamaño en memoria y agrega un factor de sobrestimación para ser conservador
 * @param obj Objeto a estimar
 * @param overestimationFactor Factor de sobrestimación (1.2 = 20% extra)
 */
export function estimateMemorySizeConservative(obj: unknown, overestimationFactor = 1.2): number {
  if (obj === null || obj === undefined) return 0;
  return Math.ceil(estimateObjectSize(obj) * overestimationFactor);
}

/**
 * Convierte bytes a megabytes
 * @param bytes Tamaño en bytes
 * @returns Tamaño en MB
 */
export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Convierte un tamaño en bytes a una representación legible
 * @param bytes Tamaño en bytes
 * @returns Tamaño formateado con unidad
 */
export function formatSize(bytes: number): string {
  if (isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
} 