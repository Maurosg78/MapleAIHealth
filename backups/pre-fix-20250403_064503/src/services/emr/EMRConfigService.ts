import { Logger } from "../../lib/logger";
import { EMRAdapterFactory } from "./EMRAdapterFactory";
import { EMRAdapter, EMRAdapterConfig } from "./types";

/**
 * Servicio para gestionar la configuración de adaptadores EMR
 */
export class EMRConfigService {
  private static instance: EMRConfigService;
  private readonly logger: Logger;
  private currentAdapter: EMRAdapter | null = null;
  private currentAdapterName: string | null = null;
  private currentConfig: EMRAdapterConfig | null = null;

  private constructor() {
    this.logger = new Logger('EMRConfigService');
    this.loadSavedConfig();
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): EMRConfigService {
    if (!EMRConfigService.instance) {
      EMRConfigService.instance = new EMRConfigService();
    }
    return EMRConfigService.instance;
  }

  /**
   * Obtiene el adaptador EMR actual
   * Si no hay ninguno configurado, devuelve el adaptador genérico
   */
  public getAdapter(): EMRAdapter {
    if (!this.currentAdapter) {
      this.logger.info(
        'No hay adaptador configurado, usando adaptador genérico'
      );
      this.currentAdapter = EMRAdapterFactory.getInstance().getAdapter('GENERIC');
      this.currentAdapterName = 'GENERIC';
    }
    return this.currentAdapter;
  }

  /**
   * Obtiene el nombre del adaptador EMR actual
   */
  public getCurrentAdapterName(): string {
    return this.currentAdapterName ?? 'GENERIC';
  }

  /**
   * Obtiene la configuración actual del adaptador EMR
   */
  public getCurrentConfig(): EMRAdapterConfig | null {
    return this.currentConfig;
  }

  /**
   * Configura un adaptador EMR
   * @param adapterName Nombre del adaptador a configurar
   * @param config Configuración del adaptador
   */
  public async configureAdapter(
    adapterName: string,
    config: EMRAdapterConfig
  ): Promise<boolean> {
    try {
      this.logger.info(`Configurando adaptador EMR: ${adapterName}`);

      // Obtener una instancia del adaptador con la configuración proporcionada
      const adapter = EMRAdapterFactory.getInstance().getAdapter(adapterName, config);

      // Probar la conexión
      const isConnected = await adapter.testConnection();

      if (!isConnected) {
        this.logger.error(
          `Error al probar conexión con adaptador: ${adapterName}`
        );
        return false;
      }

      // Guardar adaptador y configuración
      this.currentAdapter = adapter;
      this.currentAdapterName = adapterName;
      this.currentConfig = config;

      // Persistir configuración
      this.saveConfig();

      this.logger.info(
        `Adaptador EMR configurado exitosamente: ${adapterName}`
      );
      return true;
    } catch (error) {
      this.logger.error(`Error al configurar adaptador EMR: ${adapterName}`, {
        error,
      });
      return false;
    }
  }

  /**
   * Carga la configuración guardada
   */
  private loadSavedConfig(): void {
    try {
      const savedAdapterName = localStorage.getItem('emrAdapterName');
      const savedConfigStr = localStorage.getItem('emrAdapterConfig');
      const savedConfig = savedConfigStr ? JSON.parse(savedConfigStr) : null;

      if (savedAdapterName && savedConfig) {
        this.logger.info(
          `Cargando configuración guardada para: ${savedAdapterName}`
        );

        // Obtener adaptador con la configuración guardada
        this.currentAdapter = EMRAdapterFactory.getInstance().getAdapter(
          savedAdapterName,
          savedConfig
        );
        this.currentAdapterName = savedAdapterName;
        this.currentConfig = savedConfig;
      } else {
        this.logger.info('No hay configuración guardada');
      }
    } catch (error) {
      this.logger.error('Error al cargar configuración guardada', { error });
    }
  }

  /**
   * Guarda la configuración actual
   */
  private saveConfig(): void {
    if (this.currentAdapterName && this.currentConfig) {
      localStorage.setItem('emrAdapterName', this.currentAdapterName);
      localStorage.setItem(
        'emrAdapterConfig',
        JSON.stringify(this.currentConfig)
      );
      this.logger.info(
        `Configuración guardada para: ${this.currentAdapterName}`
      );
    }
  }

  /**
   * Resetea la configuración actual
   */
  public resetConfig(): void {
    localStorage.removeItem('emrAdapterName');
    localStorage.removeItem('emrAdapterConfig');
    this.currentAdapter = null;
    this.currentAdapterName = null;
    this.currentConfig = null;
    this.logger.info('Configuración reseteada');
  }

  /**
   * Verifica si hay un adaptador configurado
   */
  public hasConfiguredAdapter(): boolean {
    return (
      this.currentAdapter !== null && this.currentAdapterName !== 'GENERIC'
    );
  }
}

export default EMRConfigService;
