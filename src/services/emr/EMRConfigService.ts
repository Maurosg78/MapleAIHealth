import { EMRSystem } from './types';
import { EMRAdapterConfig } from './EMRAdapterFactory';

/**
 * Servicio para gestionar la configuración de los sistemas EMR
 * Permite almacenar y recuperar configuraciones para diferentes sistemas
 */
export class EMRConfigService {
  private static instance: EMRConfigService;
  private configs: Map<EMRSystem, EMRAdapterConfig>;
  private currentSystem: EMRSystem = 'GenericEMR';

  /**
   * Constructor privado (patrón Singleton)
   */
  private constructor() {
    this.configs = new Map();

    // Inicializar con configuraciones por defecto
    this.configs.set('GenericEMR', {
      baseUrl: 'https://api.example.com/emr/generic',
      timeout: 30000,
      useCache: true,
      cacheTTL: 3600000,
    });

    this.configs.set('EPIC', {
      baseUrl: 'https://api.example.com/emr/epic',
      timeout: 30000,
      useCache: true,
      cacheTTL: 3600000,
    });

    this.configs.set('OSCAR', {
      baseUrl: 'https://api.example.com/emr/oscar',
      timeout: 30000,
      useCache: true,
      cacheTTL: 3600000,
    });

    this.configs.set('ClinicCloud', {
      baseUrl: 'https://api.example.com/emr/cliniccloud',
      timeout: 30000,
      useCache: true,
      cacheTTL: 3600000,
    });
  }

  /**
   * Obtiene la instancia única del servicio (patrón Singleton)
   */
  public static getInstance(): EMRConfigService {
    if (!EMRConfigService.instance) {
      EMRConfigService.instance = new EMRConfigService();
    }
    return EMRConfigService.instance;
  }

  /**
   * Establece la configuración para un sistema EMR
   * @param system Sistema EMR
   * @param config Configuración para el sistema
   */
  public setConfig(system: EMRSystem, config: EMRAdapterConfig): void {
    // Combinar con configuración existente si existe
    const existingConfig = this.configs.get(system) || {};
    this.configs.set(system, { ...existingConfig, ...config });
  }

  /**
   * Obtiene la configuración para un sistema EMR
   * @param system Sistema EMR
   * @returns Configuración del sistema
   */
  public getConfig(system: EMRSystem): EMRAdapterConfig {
    return this.configs.get(system) || {};
  }

  /**
   * Establece el sistema EMR actual
   * @param system Sistema EMR
   */
  public setCurrentSystem(system: EMRSystem): void {
    this.currentSystem = system;
  }

  /**
   * Obtiene el sistema EMR actual
   * @returns Sistema EMR actual
   */
  public getCurrentSystem(): EMRSystem {
    return this.currentSystem;
  }

  /**
   * Obtiene la configuración del sistema EMR actual
   * @returns Configuración del sistema actual
   */
  public getCurrentConfig(): EMRAdapterConfig {
    return this.getConfig(this.currentSystem);
  }

  /**
   * Actualiza parcialmente la configuración del sistema actual
   * @param config Configuración parcial para actualizar
   */
  public updateCurrentConfig(config: Partial<EMRAdapterConfig>): void {
    const currentConfig = this.getCurrentConfig();
    this.setConfig(this.currentSystem, { ...currentConfig, ...config });
  }

  /**
   * Verifica si hay configuración para un sistema
   * @param system Sistema EMR
   * @returns Verdadero si hay configuración para el sistema
   */
  public hasConfig(system: EMRSystem): boolean {
    return this.configs.has(system);
  }

  /**
   * Elimina la configuración de un sistema
   * @param system Sistema EMR
   */
  public deleteConfig(system: EMRSystem): void {
    this.configs.delete(system);
  }

  /**
   * Obtiene los sistemas con configuración
   * @returns Lista de sistemas configurados
   */
  public getConfiguredSystems(): EMRSystem[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Obtiene todas las configuraciones
   * @returns Mapa con todas las configuraciones de sistemas EMR
   */
  public getAllConfigs(): Map<EMRSystem, EMRAdapterConfig> {
    return new Map(this.configs);
  }
}

// Exportar la instancia única
export const emrConfigService = EMRConfigService.getInstance();
