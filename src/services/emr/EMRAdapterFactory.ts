import { EMRAdapter } from './interfaces/EMRAdapter';
import { EMRSystem } from './types';

/**
 * Configuración para inicializar adaptadores EMR
 */
export interface EMRAdapterConfig {
  baseUrl?: string;
  timeout?: number;
  apiKey?: string;
  useCache?: boolean;
  cacheTTL?: number;
  [key: string]: unknown;
}

/**
 * Fábrica para crear adaptadores EMR según el sistema
 * Desacopla la creación de adaptadores del resto del código
 */
export class EMRAdapterFactory {
  private static adapters: Map<EMRSystem, new () => EMRAdapter> = new Map();

  /**
   * Registra un adaptador para un sistema EMR específico
   * @param system Sistema EMR
   * @param adapterClass Clase del adaptador
   */
  static registerAdapter(system: EMRSystem, adapterClass: new () => EMRAdapter): void {
    EMRAdapterFactory.adapters.set(system, adapterClass);
  }

  /**
   * Obtiene un adaptador para el sistema EMR especificado
   * @param system Sistema EMR
   * @param config Configuración para inicializar el adaptador
   * @returns Instancia del adaptador
   * @throws Error si el sistema no tiene adaptador registrado
   */
  static async getAdapter(system: EMRSystem, config: EMRAdapterConfig): Promise<EMRAdapter> {
    const AdapterClass = EMRAdapterFactory.adapters.get(system);

    if (!AdapterClass) {
      throw new Error(`No adapter registered for EMR system: ${system}`);
    }

    const adapter = new AdapterClass();
    await adapter.initialize(config);

    return adapter;
  }

  /**
   * Verifica si existe un adaptador para el sistema EMR especificado
   * @param system Sistema EMR
   * @returns true si existe un adaptador registrado
   */
  static hasAdapter(system: EMRSystem): boolean {
    return EMRAdapterFactory.adapters.has(system);
  }

  /**
   * Obtiene la lista de sistemas EMR con adaptadores registrados
   * @returns Lista de sistemas EMR disponibles
   */
  static getAvailableSystems(): EMRSystem[] {
    return Array.from(EMRAdapterFactory.adapters.keys());
  }
}
