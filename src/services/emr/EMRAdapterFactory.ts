import { Logger } from '../../lib/logger'
import { EMRAdapter } from './interfaces/EMRAdapter'
import { GenericEMRAdapter } from './implementations/GenericEMRAdapter'
import { EPICAdapter } from './implementations/EPICAdapter'
import { OSCARAdapter } from './implementations/OSCARAdapter'
import { ClinicCloudAdapter } from './implementations/ClinicCloudAdapter'

/**
 * Tipo para las opciones de configuración de adaptadores EMR
 */
export interface EMRAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  apiUrl?: string;
  username?: string;
  password?: string;
  timeout?: number;
  clientId?: string;
  clientSecret?: string;
  clinicId?: string;
}

/**
 * Configuración específica para el adaptador OSCAR
 */
export interface OSCARAdapterConfig {
  baseUrl: string;
  username: string;
  password: string;
  clinicId: string;
}

/**
 * Configuración específica para el adaptador ClinicCloud
 */
export interface ClinicCloudAdapterConfig {
  apiUrl: string;
  apiKey: string;
  clinicId: string;
}

/**
 * Configuración específica para el adaptador EPIC
 */
export interface EPICAdapterConfig {
  apiBaseUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Fábrica para crear y gestionar adaptadores EMR
 */
export class EMRAdapterFactory {
  private static instance: EMRAdapterFactory;
  private adapters: Map<string, EMRAdapter> = new Map();
  private readonly logger: Logger;

  private constructor() {
    this.logger = new Logger('EMRAdapterFactory');
    this.initializeDefaultAdapters();
  }

  public static getInstance(): EMRAdapterFactory {
    if (!EMRAdapterFactory.instance) {
      EMRAdapterFactory.instance = new EMRAdapterFactory();
    }
    return EMRAdapterFactory.instance;
  }

  // Método para pruebas
  public static resetForTests(): void {
    EMRAdapterFactory.instance = new EMRAdapterFactory();
  }

  private initializeDefaultAdapters(): void {
    this.logger.info('Inicializando adaptadores EMR por defecto');
    this.registerAdapter('GENERIC', new GenericEMRAdapter());
  }

  /**
   * Registra un adaptador EMR en la fábrica
   */
  public registerAdapter(name: string, adapter: EMRAdapter): void {
    const normalizedName = name.toUpperCase();
    this.adapters.set(normalizedName, adapter);
    this.logger.info(`Adaptador EMR registrado: ${normalizedName}`);
  }

  /**
   * Obtiene un adaptador EMR por su nombre
   * Si se proporcionan opciones de configuración, crea una nueva instancia
   */
  public getAdapter(name: string, config?: EMRAdapterConfig): EMRAdapter {
    const normalizedName = name.toUpperCase();

    // Verificar si el adaptador existe
    if (!this.adapters.has(normalizedName)) {
      this.logger.error(`Adaptador EMR no encontrado: ${normalizedName}`);
      throw new Error(`Adaptador EMR no soportado: ${normalizedName}`);
    }

    // Obtener el adaptador base
    const adapter = this.adapters.get(normalizedName)!;

    // Si no hay configuración, devolver el adaptador base
    if (!config) {
      return adapter;
    }

    // Crear una nueva instancia con la configuración proporcionada
    switch (normalizedName) {
      case 'OSCAR': {
        if (!config.baseUrl) {
          throw new Error('Se requiere baseUrl para el adaptador OSCAR');
        }
        const oscarConfig: OSCARAdapterConfig = {
          baseUrl: config.baseUrl,
          username: config.username || '',
          password: config.password || '',
          clinicId: config.clinicId || ''
        };
        return new OSCARAdapter(oscarConfig);
      }

      case 'CLINICCLOUD': {
        if (!config.apiUrl || !config.apiKey) {
          throw new Error('Se requiere apiUrl y apiKey para el adaptador CLINICCLOUD');
        }
        const clinicCloudConfig: ClinicCloudAdapterConfig = {
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          clinicId: config.clinicId || ''
        };
        return new ClinicCloudAdapter(clinicCloudConfig);
      }

      case 'EPIC': {
        if (!config.baseUrl) {
          throw new Error('Se requiere baseUrl para el adaptador EPIC');
        }
        const epicConfig: EPICAdapterConfig = {
          apiBaseUrl: config.baseUrl,
          apiKey: config.apiKey,
          clientId: config.clientId,
          clientSecret: config.clientSecret
        };
        return new EPICAdapter(epicConfig);
      }

      case 'GENERIC':
      default:
        return adapter;
    }
  }

  /**
   * Obtiene una lista de los nombres de adaptadores disponibles
   */
  public getAvailableAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Obtiene un mapa con información sobre los adaptadores disponibles
   */
  public getAdaptersInfo(): Array<{ id: string; name: string; description: string }> {
    return Array.from(this.adapters.entries()).map(([id, adapter]) => ({
      id,
      name: adapter.name,
      description: adapter.description || ''
    }));
  }
}
