import { CacheMetadata } from './types';

export type InvalidationPattern = 
  | 'time-based'       // Invalidación basada en tiempo (TTL)
  | 'event-based'      // Invalidación basada en eventos (ej: cambios en datos)
  | 'query-based'      // Invalidación basada en consultas relacionadas
  | 'patient-based'    // Invalidación basada en cambios de paciente
  | 'section-based'    // Invalidación por sección (ej: SOAP)
  | 'dependency-based' // Invalidación basada en dependencias
  | 'manual';          // Invalidación manual

export interface InvalidationRule {
  pattern: InvalidationPattern;
  condition: (metadata?: CacheMetadata) => boolean;
  priority: number; // Mayor número = mayor prioridad
  description?: string;
}

export interface InvalidationConfig {
  rules: InvalidationRule[];
  defaultTTL: number; // Tiempo de vida predeterminado en ms
  enablePatientScoping: boolean; // Si se permite agrupar por paciente
  enableSectionScoping: boolean; // Si se permite agrupar por sección
  enableDependencyTracking: boolean; // Si se rastrean dependencias
}

export interface InvalidationResult {
  invalidated: boolean;
  reason: string;
  pattern: InvalidationPattern;
  timestamp: number;
}

export class InvalidationStrategy {
  private config: InvalidationConfig;
  private dependencyGraph: Map<string, Set<string>>; // clave -> conjunto de claves dependientes

  constructor(config: InvalidationConfig) {
    this.config = config;
    this.dependencyGraph = new Map();
  }

  /**
   * Evalúa si una entrada de caché debe ser invalidada
   * @param key Clave de la entrada
   * @param timestamp Timestamp de la última actualización
   * @param metadata Metadatos asociados
   * @returns Resultado de la evaluación de invalidación
   */
  public shouldInvalidate(key: string, timestamp: number, metadata?: CacheMetadata): InvalidationResult {
    const now = Date.now();
    
    // Verificar reglas en orden de prioridad
    const sortedRules = [...this.config.rules].sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      // Evaluar la condición de la regla
      if (rule.condition(metadata)) {
        // Verificar el patrón específico
        switch (rule.pattern) {
          case 'time-based': {
            const ttl = metadata?.ttl as number || this.config.defaultTTL;
            if (now - timestamp > ttl) {
              return {
                invalidated: true,
                reason: `TTL expirado después de ${ttl}ms`,
                pattern: 'time-based',
                timestamp: now
              };
            }
            break;
          }
            
          case 'patient-based':
            if (this.config.enablePatientScoping && metadata?.patientId) {
              return {
                invalidated: true,
                reason: `Invalidación basada en cambios del paciente ${metadata.patientId}`,
                pattern: 'patient-based',
                timestamp: now
              };
            }
            break;
            
          case 'section-based':
            if (this.config.enableSectionScoping && metadata?.section) {
              return {
                invalidated: true,
                reason: `Invalidación basada en cambios de la sección ${metadata.section}`,
                pattern: 'section-based',
                timestamp: now
              };
            }
            break;
            
          case 'dependency-based':
            if (this.config.enableDependencyTracking && this.hasDependencyInvalidation(key)) {
              return {
                invalidated: true,
                reason: 'Invalidación basada en dependencias',
                pattern: 'dependency-based',
                timestamp: now
              };
            }
            break;
            
          case 'manual':
            return {
              invalidated: true,
              reason: 'Invalidación manual',
              pattern: 'manual',
              timestamp: now
            };
            
          default:
            break;
        }
      }
    }
    
    // Si ninguna regla causó invalidación
    return {
      invalidated: false,
      reason: 'Entrada válida',
      pattern: 'time-based',
      timestamp: now
    };
  }
  
  /**
   * Verifica si una clave tiene dependencias invalidadas
   */
  private hasDependencyInvalidation(key: string): boolean {
    // Verificar si la clave está en el grafo de dependencias
    return this.dependencyGraph.has(key) && this.dependencyGraph.get(key)?.size !== 0;
  }
  
  /**
   * Registra una dependencia entre dos claves
   * @param key Clave principal
   * @param dependsOn Clave de la que depende
   */
  public registerDependency(key: string, dependsOn: string): void {
    if (!this.dependencyGraph.has(dependsOn)) {
      this.dependencyGraph.set(dependsOn, new Set());
    }
    
    this.dependencyGraph.get(dependsOn)?.add(key);
  }
  
  /**
   * Obtiene todas las claves que dependen de una clave dada
   * @param key Clave base
   * @returns Conjunto de claves dependientes
   */
  public getDependents(key: string): Set<string> {
    return this.dependencyGraph.get(key) || new Set();
  }
  
  /**
   * Agregar una nueva regla de invalidación
   * @param rule Regla a agregar
   */
  public addRule(rule: InvalidationRule): void {
    this.config.rules.push(rule);
  }
  
  /**
   * Eliminar una regla existente
   * @param pattern Patrón de la regla a eliminar
   * @param priority Prioridad de la regla a eliminar
   */
  public removeRule(pattern: InvalidationPattern, priority: number): void {
    this.config.rules = this.config.rules.filter(
      rule => !(rule.pattern === pattern && rule.priority === priority)
    );
  }
  
  /**
   * Actualizar la configuración de invalidación
   * @param config Nueva configuración parcial
   */
  public updateConfig(config: Partial<InvalidationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Reglas predefinidas comunes
export const commonInvalidationRules: InvalidationRule[] = [
  // Regla de TTL básica
  {
    pattern: 'time-based',
    condition: () => true, // Aplica a todas las entradas
    priority: 10,
    description: 'Invalidación basada en TTL global'
  },
  
  // Regla para datos clínicos (mayor prioridad)
  {
    pattern: 'section-based',
    condition: (metadata) => metadata?.section === 'clinical',
    priority: 50,
    description: 'Invalidación de datos clínicos'
  },
  
  // Regla para cambios en pacientes
  {
    pattern: 'patient-based',
    condition: (metadata) => Boolean(metadata?.patientId),
    priority: 40,
    description: 'Invalidación por cambios en paciente'
  },
  
  // Regla para contenido dinámico
  {
    pattern: 'query-based',
    condition: (metadata) => metadata?.dynamic === true,
    priority: 30,
    description: 'Invalidación de contenido dinámico'
  }
]; 