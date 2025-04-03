import { 
   render, screen 
 } from "@testing-library/react"
  oscarPatientData,
import { 
   HttpService 
 } from "../../../lib/api"
  oscarSearchResults,
import { 
  oscarPatientHistory,
  clinicCloudPatientData,
  clinicCloudSearchResults,
  clinicCloudPatientHistory,
  epicPatientData,
  epicSearchResults,
  epicPatientHistory,
  patientMetrics,
  apiErrors,
} from './MockEMRResponses';

// Definir tipos para mejorar la legibilidad y mantenimiento
type ErrorType =
  | 'unauthorized'
  | 'notFound'
  | 'serverError'
  | 'badRequest'
  | null;
type AdapterType = 'oscar' | 'cliniccloud' | 'epic';
type ResponseData = Record<string, unknown>;

/**
 * Servicio HTTP Mock para pruebas unitarias
 * Simula llamadas a APIs de sistemas EMR
 */
export class MockHttpService {
  private authTokens: Record<string, string> = {};
  private shouldFailAuth: boolean = false;
  private shouldFailRequests: boolean = false;
  private delayMs: number = 0;
  private errorToThrow: ErrorType = null;

  // Mapeo de endpoints para respuestas GET
  private readonly endpointResponses: Record<
    AdapterType,
    Record<string, unknown>
  > = {
    oscar: {
      demographic: oscarPatientData,
      search: oscarSearchResults,
      history: oscarPatientHistory,
      metrics: patientMetrics,
    },
    cliniccloud: {
      paciente: clinicCloudPatientData,
      buscar: clinicCloudSearchResults,
      historial: clinicCloudPatientHistory,
      metricas: patientMetrics,
    },
    epic: {
      Patient: epicPatientData,
      'Patient?': epicSearchResults,
      Bundle: epicPatientHistory,
      Observation: patientMetrics,
    },
  };

  // Mapeo de endpoints para POST
  private readonly postEndpoints = {
    consultation: true,
    consulta: true,
    Encounter: true,
    treatment: true,
    tratamiento: true,
    MedicationRequest: true,
  };

  /**
   * Configura si la autenticación debe fallar
   */
  public setAuthShouldFail(shouldFail: boolean): void {
    this.shouldFailAuth = shouldFail;
  }

  /**
   * Configura si las peticiones deben fallar
   */
  public setRequestsShouldFail(shouldFail: boolean): void {
    this.shouldFailRequests = shouldFail;
  }

  /**
   * Configura un retraso en las respuestas (en ms)
   */
  public setResponseDelay(delayMs: number): void {
    this.delayMs = delayMs;
  }

  /**
   * Configura un error específico para lanzar
   */
  public setErrorToThrow(error: ErrorType): void {
    this.errorToThrow = error;
  }

  /**
   * Simula autenticación para OSCAR
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async authenticateOscar(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _username: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _password: string
  ): Promise<string> {
    return this.authenticate('oscar');
  }

  /**
   * Simula autenticación para ClinicCloud
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async authenticateClinicCloud(_apiKey: string): Promise<string> {
    return this.authenticate('cliniccloud');
  }

  /**
   * Simula autenticación OAuth2 para EPIC
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async authenticateEpic(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientSecret: string
  ): Promise<string> {
    return this.authenticate('epic');
  }

  /**
   * Método común para manejar la autenticación
   */
  private async authenticate(adapter: AdapterType): Promise<string> {
    await this.delay();

    if (this.shouldFailAuth) {
      throw new Error(apiErrors.unauthorized.message);
    }


    this.authTokens[adapter] = token;
    return token;
  }

  /**
   * Simula una solicitud GET
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async get<T>(
    url: string,
    adapter: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _params?: Record<string, string>
  ): Promise<T> {
    await this.delay();
    this.checkErrors();
    this.verifyAuthentication(adapter as AdapterType);

    // Extraer el endpoint y clave de respuesta
    const { endpoint, responseKey } = this.extractEndpointInfo(
      url,
      adapter as AdapterType
    );

    // Obtener la respuesta correspondiente
    const response = this.getResponseForEndpoint(
      adapter as AdapterType,
      endpoint,
      responseKey
    );

    if (response) {
      return response as unknown as T;
    }

    throw new Error(apiErrors.notFound.message);
  }

  /**
   * Extrae información del endpoint y clave de respuesta
   */
  private extractEndpointInfo(
    url: string,
    adapter: AdapterType
  ): { endpoint: string; responseKey: string } {



    // Para EPIC, tenemos algunos casos especiales
    let responseKey = endpoint;
    if (adapter === 'epic') {
      if (url.includes('Patient?')) {
        responseKey = 'Patient?';
      } else if (url.includes('Bundle')) {
        responseKey = 'Bundle';
      }
    }

    return { endpoint, responseKey };
  }

  /**
   * Obtiene la respuesta adecuada según el adaptador y endpoint
   */
  private getResponseForEndpoint(
    adapter: AdapterType,
    endpoint: string,
    responseKey: string
  ): unknown {

    if (!adapterResponses) return null;

    return adapterResponses[responseKey] || null;
  }

  /**
   * Simula una solicitud POST
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async post<T>(
    url: string,
    adapter: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Record<string, unknown>
  ): Promise<T> {
    await this.delay();
    this.checkErrors();
    this.verifyAuthentication(adapter as AdapterType);

    // Extraer el endpoint



    // Verificar si es un endpoint válido para POST
    if (this.isValidPostEndpoint(endpoint)) {
      return this.createSuccessResponse('created') as unknown as T;
    }

    throw new Error(apiErrors.notFound.message);
  }

  /**
   * Simula una solicitud PUT
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async put<T>(
    url: string,
    adapter: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Record<string, unknown>
  ): Promise<T> {
    await this.delay();
    this.checkErrors();
    this.verifyAuthentication(adapter as AdapterType);

    // Extraer el endpoint e ID




    // Verificar si es un endpoint válido para PUT (solo consultas por ahora)
    if (
      endpoint === 'consultation' ||
      endpoint === 'consulta' ||
      endpoint === 'Encounter'
    ) {
      return { id, status: 'updated' } as unknown as T;
    }

    throw new Error(apiErrors.notFound.message);
  }

  /**
   * Verifica si el endpoint es válido para POST
   */
  private isValidPostEndpoint(endpoint: string): boolean {
    return endpoint in this.postEndpoints;
  }

  /**
   * Crea una respuesta de éxito
   */
  private createSuccessResponse(status: string): ResponseData {
    return { id: `gen-${Date.now()}`, status };
  }

  /**
   * Verifica la autenticación para el adaptador especificado
   */
  private verifyAuthentication(adapter: AdapterType): void {
    if (!this.authTokens[adapter]) {
      throw new Error(apiErrors.unauthorized.message);
    }
  }

  /**
   * Verifica si se debe lanzar algún error
   */
  private checkErrors(): void {
    if (this.shouldFailRequests) {
      throw new Error(apiErrors.serverError.message);
    }

    if (this.errorToThrow) {

      throw new Error(error.message);
    }
  }

  /**
   * Simula un retraso en la respuesta
   */
  private async delay(): Promise<void> {
    if (this.delayMs > 0) {
      return new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
  }
}
