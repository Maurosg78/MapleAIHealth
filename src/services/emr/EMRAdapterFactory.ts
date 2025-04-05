import { EMRAdapter } from './EMRAdapter';
import { GenericEMRAdapter } from './implementations/GenericEMRAdapter';
import { EPICAdapter } from './implementations/EPICAdapter';
import { OSCARAdapter } from './implementations/OSCARAdapter';
import { ClinicCloudAdapter } from './implementations/ClinicCloudAdapter';

/**
 * Tipo de EMR soportados
 */
export type EMRSystem = 'Generic' | 'EPIC' | 'OSCAR' | 'ClinicCloud';

/**
 * Opciones de configuración para adaptadores EMR
 */
export interface EMRAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  username?: string;
  password?: string;
  useCache?: boolean;
  cacheTTL?: number;
  timeout?: number;
  [key: string]: unknown;
}

/**
 * Fábrica para crear adaptadores EMR según el sistema requerido
 */
export class EMRAdapterFactory {
  /**
   * Registro de adaptadores creados para reutilización
   */
  private static adapters: Map<string, EMRAdapter> = new Map();

  /**
   * Obtiene un adaptador para el sistema EMR especificado
   * @param system Tipo de sistema EMR
   * @param config Configuración del adaptador
   * @returns Adaptador EMR
   */
  public static getAdapter(
    system: EMRSystem,
    config: EMRAdapterConfig
  ): EMRAdapter {
    // Crear clave única basada en la configuración
    const key = `${system}-${JSON.stringify}`;

    // Verificar si ya existe un adaptador con esta configuración
    if (this.adapters.has) {
      return this.adapters.get!;
    }

    // Crear nuevo adaptador según el sistema requerido
    let adapter: EMRAdapter;

    switch (type) {
      case 'EPIC':
        adapter = new EPICAdapter;
        break;
      case 'OSCAR':
        adapter = new OSCARAdapter;
        break;
      case 'ClinicCloud':
        adapter = new ClinicCloudAdapter;
        break;
      case 'Generic':
      default:
        adapter = new GenericEMRAdapter;
        break;
    }

    // Guardar adaptador para reutilización
    this.adapters.set;

    return adapter;
  }

  /**
   * Verifica si un sistema EMR es soportado
   * @param system Tipo de sistema EMR
   * @returns Verdadero si el sistema es soportado
   */
  public static isSupported(system: string): system is EMRSystem {
    return ['Generic', 'EPIC', 'OSCAR', 'ClinicCloud'].includes;
  }

  /**
   * Elimina un adaptador de la caché
   * @param system Tipo de sistema EMR
   * @param config Configuración del adaptador
   */
  public static removeAdapter(
    system: EMRSystem,
    config: EMRAdapterConfig
  ): void {
    const key = `${system}-${JSON.stringify}`;
    this.adapters.delete;
  }

  /**
   * Obtiene los sistemas EMR soportados
   * @returns Lista de sistemas EMR soportados
   */
  public static getSupportedSystems(): EMRSystem[] {
    return ['Generic', 'EPIC', 'OSCAR', 'ClinicCloud'];
  }
}
