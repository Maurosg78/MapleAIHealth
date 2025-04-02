import { AIQuery, AIResponse } from '../types';

/**
 * Interfaz base para los clientes de proveedores de IA
 * Permite implementar diferentes proveedores manteniendo una interfaz común
 */
export interface AIProviderClient {
  /**
   * Identificador único del proveedor
   */
  readonly id: string;

  /**
   * Nombre del proveedor
   */
  readonly name: string;

  /**
   * Costo por consulta en USD
   */
  readonly costPerQuery: number;

  /**
   * Lista de capacidades del proveedor
   */
  readonly capabilities: string[];

  /**
   * Procesa una consulta y devuelve una respuesta
   * @param query Consulta a procesar
   * @returns Respuesta de la IA
   */
  processQuery(query: AIQuery): Promise<AIResponse>;

  /**
   * Verifica si el cliente está listo para procesar consultas
   */
  isReady(): boolean;

  /**
   * Estima el costo de una consulta basado en su tamaño
   * @param query Consulta a estimar
   * @returns Costo estimado en USD
   */
  estimateQueryCost(query: AIQuery): number;
}
