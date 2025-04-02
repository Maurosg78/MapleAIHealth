/**
import { HttpService } from "../../../lib/api"; * Tipo para las opciones de configuración de adaptadores EMR
 */
export type EMRAdapterConfig = {
  apiKey?: string;
  baseUrl?: string;
  apiUrl?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  clinicId?: string;
  timeout?: number;
  [key: string]: unknown;
};

/**
 * Fábrica para crear y gestionar adaptadores EMR
 */
export class EMRAdapterFactory {
  private static readonly adapters: Map<string, EMRAdapter> = new Map();
  private static readonly logger: Logger = new Logger('EMRAdapterFactory');
  private static initialized = false;

  /**
   * Inicializa la fábrica con los adaptadores por defecto
   */
  private static initializeDefaultAdapters(): void {
    if (EMRAdapterFactory.initialized) {
      return;
    }

    // Registrar adaptador genérico
    EMRAdapterFactory.registerAdapter('GENERIC', new GenericEMRAdapter());

    // Indicar que ya hemos inicializado
    EMRAdapterFactory.initialized = true;
    EMRAdapterFactory.logger.info(
      'Fábrica de adaptadores EMR inicializada con adaptadores por defecto'
    );
  }

  /**
   * Registra un adaptador EMR en la fábrica
   */
  public static registerAdapter(name: string, adapter: EMRAdapter): void {
    EMRAdapterFactory.adapters.set(name.toUpperCase(), adapter);
    EMRAdapterFactory.logger.info(`Adaptador EMR registrado: ${name}`);
  }

  /**
   * Obtiene un adaptador EMR por su nombre
   * Si se proporcionan opciones de configuración, crea una nueva instancia
   */
  public static getAdapter(
    name: string,
    config?: EMRAdapterConfig
  ): EMRAdapter {
    EMRAdapterFactory.initializeDefaultAdapters();

    // Si hay configuración, crear una nueva instancia
    if (config) {
      return EMRAdapterFactory.createAdapter(adapterName, config);
    }

    // Si no, obtener la instancia existente

    if (!adapter) {
      EMRAdapterFactory.logger.error(`Adaptador EMR no encontrado: ${name}`);
      throw new Error(`No se encontró un adaptador EMR para: ${name}`);
    }

    return adapter;
  }

  /**
   * Crea una nueva instancia de un adaptador EMR con la configuración proporcionada
   */
  private static createAdapter(
    name: string,
    config: EMRAdapterConfig
  ): EMRAdapter {
    EMRAdapterFactory.logger.info(`Creando adaptador EMR: ${name}`);

    switch (name) {
      case 'EPIC':
        if (!config.baseUrl) {
          throw new Error('Se requiere baseUrl para el adaptador EPIC');
        }
        return new EPICAdapter({
          apiBaseUrl: config.baseUrl,
          apiKey: config.apiKey,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        });

      case 'OSCAR':
        if (
          !config.baseUrl ||
          !config.username ||
          !config.password ||
          !config.clinicId
        ) {
          throw new Error(
            'Se requiere baseUrl, username, password y clinicId para el adaptador OSCAR'
          );
        }
        return new OSCARAdapter({
          baseUrl: config.baseUrl,
          username: config.username,
          password: config.password,
          clinicId: config.clinicId,
        });

      case 'CLINICCLOUD':
        if (!config.apiUrl || !config.apiKey || !config.clinicId) {
          throw new Error(
            'Se requiere apiUrl, apiKey y clinicId para el adaptador ClinicCloud'
          );
        }
        return new ClinicCloudAdapter({
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          clinicId: config.clinicId,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        });

      case 'GENERIC':
        return new GenericEMRAdapter();

      default:
        EMRAdapterFactory.logger.error(
          `Adaptador EMR no implementado: ${name}`
        );
        throw new Error(
          `No existe implementación para el adaptador EMR: ${name}`
        );
    }
  }

  /**
   * Obtiene una lista de los nombres de adaptadores disponibles
   */
  public static getAvailableAdapters(): string[] {
    EMRAdapterFactory.initializeDefaultAdapters();
    return Array.from(EMRAdapterFactory.adapters.keys());
  }

  /**
   * Obtiene un mapa con información sobre los adaptadores disponibles
   */
  public static getAdaptersInfo(): Array<{
    id: string;
    name: string;
    description: string;
  }> {
    EMRAdapterFactory.initializeDefaultAdapters();

    return [
      {
        id: 'GENERIC',
        name: 'Adaptador Genérico',
        description: 'Adaptador de demostración para pruebas y desarrollo',
      },
      {
        id: 'EPIC',
        name: 'EPIC EMR',
        description:
          'Adaptador para EPIC, uno de los sistemas EMR más utilizados en EE.UU. y Canadá',
      },
      {
        id: 'OSCAR',
        name: 'OSCAR EMR',
        description:
          'Adaptador para OSCAR, sistema EMR de código abierto popular en Canadá',
      },
      {
        id: 'CLINICCLOUD',
        name: 'ClinicCloud',
        description:
          'Adaptador para ClinicCloud, uno de los sistemas EMR más utilizados en España',
      },
    ];
  }
}
