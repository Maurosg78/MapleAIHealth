import {
  EMRAdapter,
  EMRConsultation,
  EMRDiagnosis,
  EMRHistoryOptions,
  EMRPatientHistory,
  EMRPatientMetrics,
  EMRPatientSearchResult,
  EMRSearchQuery,
  EMRTreatment,
} from '../EMRAdapter';
import { PatientData } from '../../ai/types';
import { Logger } from '../../../lib/logger';

/**
 * Tipos específicos para ClinicCloud EMR
 */
// Tipo para datos del paciente en ClinicCloud
interface ClinicCloudPaciente {
  id: string;
  nombre: string;
  apellidos: string;
  genero: string;
  fechaNacimiento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  numeroTarjetaSanitaria?: string;
}

// Tipo para respuesta de búsqueda de pacientes
interface ClinicCloudSearchResult {
  pacientes: ClinicCloudPaciente[];
  totalResultados: number;
  pacientes: ClinicCloudPaciente[];
  totalResultados: number;
  pacientes: ClinicCloudPaciente[];
  totalResultados: number;
  pacientes: ClinicCloudPaciente[];
  totalResultados: number;
  pacientes: ClinicCloudPaciente[];
  totalResultados: number;
  pacientes: ClinicCloudPaciente[];
  totalResultados: number;
}

// Tipo para consulta médica en ClinicCloud
interface ClinicCloudConsulta {
  id: string;
  pacienteId: string;
  fecha: string;
  profesional: string;
  motivo: string;
  contenido: string;
  diagnosticos?: ClinicCloudDiagnostico[];
  proximaCita?: string;
  especialidad?: string;
  signosVitales?: {
    temperatura?: number;
    frecuenciaCardiaca?: number;
    frecuenciaRespiratoria?: number;
    tensionSistolica?: number;
    tensionDiastolica?: number;
    saturacion?: number;
    peso?: number;
    altura?: number;
  };
}

// Tipo para respuesta de consultas
interface ClinicCloudConsultaResult {
  consultas: ClinicCloudConsulta[];
  consultas: ClinicCloudConsulta[];
  consultas: ClinicCloudConsulta[];
  consultas: ClinicCloudConsulta[];
  consultas: ClinicCloudConsulta[];
  consultas: ClinicCloudConsulta[];
}

// Tipo para tratamientos en ClinicCloud
interface ClinicCloudTratamiento {
  id: string;
  pacienteId: string;
  nombreMedicamento: string;
  dosis: string;
  frecuencia: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  instrucciones?: string;
  recetadoPor: string;
  tipo: string;
  descripcion?: string;
  consultaId?: string;
}

// Tipo para respuesta de tratamientos
interface ClinicCloudTratamientoResult {
  tratamientos: ClinicCloudTratamiento[];
  tratamientos: ClinicCloudTratamiento[];
  tratamientos: ClinicCloudTratamiento[];
  tratamientos: ClinicCloudTratamiento[];
  tratamientos: ClinicCloudTratamiento[];
  tratamientos: ClinicCloudTratamiento[];
}

// Tipo para diagnósticos en ClinicCloud
interface ClinicCloudDiagnostico {
  id: string;
  codigo: string;
  sistema: string;
  descripcion?: string;
  fecha: string;
  estado: string;
  cronica: boolean;
  notas?: string;
}

// Tipo para respuesta de diagnósticos
interface ClinicCloudDiagnosticoResult {
  diagnosticos: ClinicCloudDiagnostico[];
  diagnosticos?: ClinicCloudDiagnostico[];
  diagnosticos?: ClinicCloudDiagnostico[];
  diagnosticos?: ClinicCloudDiagnostico[];
  diagnosticos?: ClinicCloudDiagnostico[];
  diagnosticos?: ClinicCloudDiagnostico[];
}

// Tipo para resultados de laboratorio en ClinicCloud
interface ClinicCloudResultadoLab {
  id: string;
  fecha: string;
  tipo: string;
  resultados: {
    [key: string]: {
      valor: string | number;
      unidad?: string;
      rangoNormal?: string;
      anormal?: boolean;
    };
  };
  solicitadoPor: string;
  notas?: string;
}

// Tipo para respuesta de laboratorio
interface ClinicCloudLabResult {
  resultados: ClinicCloudResultadoLab[];
  resultados: ClinicCloudResultadoLab[];
  resultados: ClinicCloudResultadoLab[];
  resultados: ClinicCloudResultadoLab[];
  resultados: ClinicCloudResultadoLab[];
  resultados: ClinicCloudResultadoLab[];
}

// Tipo para métricas en ClinicCloud
interface ClinicCloudMetrica {
  id: string;
  tipo: string;
  fecha: string;
  valor: string | number;
  unidad?: string;
}

// Tipo para respuesta de métricas
interface ClinicCloudMetricaResult {
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
}

// Tipo para datos adicionales en ClinicCloud
interface ClinicCloudAdditionalData {
  alergias: {
    id: string;
    descripcion?: string;
    reaccion?: string;
    gravedad?: string;
  }[];
  condiciones: ClinicCloudDiagnostico[];
  vacunas: {
    id: string;
    nombre: string;
    fecha: string;
    lote?: string;
    zona?: string;
  }[];
}

/**
 * Interfaz para el resultado del historial médico
 */
interface MedicalHistoryResult {
  alergias: Array<{
    id: string;
    descripcion?: string;
    reaccion?: string;
    gravedad?: string;
  }>;
  condicionesCronicas: Array<{
    id: string;
    codigo: string;
    sistema: string;
    descripcion?: string;
    fecha: string;
    estado: string;
    cronica: boolean;
    notas?: string;
  }>;
}

/**
 * Interfaz para resultados de laboratorio
 */
interface LabResultData {
  id: string;
  patientId: string;
  date: Date;
  category: string;
  name: string;
  results: Record<
    string,
    {
      value: string | number;
      unit?: string;
      normalRange?: string;
      isAbnormal?: boolean;
    }
  >;
  units: string;
  range?: string;
  abnormal?: boolean;
  notes: string;
}

/**
 * Interfaz para consulta de ClinicCloud
 */
interface ClinicCloudConsulta {
  id: string;
  pacienteId: string;
  medicoId: string;
  fecha: string;
  motivo: string;
  notas: string;
  especialidad?: string;
  citaProxima?: string;
  diagnosticos?: Array<{
    codigo: string;
    sistema: string;
    descripcion?: string;
  }>;
  signosVitales?: {
    temperatura?: number;
    frecuenciaCardiaca?: number;
    frecuenciaRespiratoria?: number;
    tensionSistolica?: number;
    tensionDiastolica?: number;
    saturacion?: number;
    peso?: number;
    altura?: number;
  };
}

/**
 * Interfaz para tratamiento de ClinicCloud
 */
interface ClinicCloudTratamiento {
  pacienteId: string;
  medicoId: string;
  fechaInicio: string;
  fechaFin?: string | null;
  nombre: string;
  tipo: string;
  descripcion?: string;
  dosis: string | null;
  frecuencia: string | null;
  instrucciones?: string | null;
  estado: string;
  consultaId?: string | null;
}

/**
 * Interfaz para métricas de ClinicCloud
 */
interface ClinicCloudMetrica {
  id: string;
  pacienteId: string;
  fecha: string;
  tipo: string;
  valor: string | number;
  unidad?: string;
  sistolica?: number;
  diastolica?: number;
}

/**
 * Interfaz para resultado de métricas de ClinicCloud
 */
interface ClinicCloudMetricaResult {
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
  metricas: ClinicCloudMetrica[];
}

/**
 * Adaptador para integración con ClinicCloud
 * ClinicCloud es uno de los sistemas EMR más utilizados en España
 * Especializado en clínicas privadas y consultas médicas particulares
 */
export class ClinicCloudAdapter implements EMRAdapter {
  public readonly name = 'ClinicCloud Adapter';
  private$1$3: Logger;
  private$1$3: string;
  private$1$3: string;
  private$1$3: string;
  private$1$3: string;
  private$1$3: string;
  private accessToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(config: {
    apiUrl: string;
    apiKey: string;
    clinicId: string;
    clientId?: string;
    clientSecret?: string;
  }) {
    this.logger = new Logger('ClinicCloudAdapter');
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.clinicId = config.clinicId;
    this.clientId = config.clientId ?? '';
    this.clientSecret = config.clientSecret ?? '';

    this.logger.info('Inicializado adaptador para ClinicCloud', {
      apiUrl: this.apiUrl,
      clinicId: this.clinicId,
    });
  }

  /**
   * Prueba la conexión con ClinicCloud
   */
  public async testConnection(): Promise<boolean> {
    try {
      this.logger.info('Probando conexión con ClinicCloud');

      // Intentar obtener un token para verificar credenciales
      await this.getAccessToken();

      // Realizar una petición de prueba adicional
      await this.fetchData('/ping');

      return true;
    } catch (err) {
      this.logger.error('Error al conectar con ClinicCloud', { error 
    });
      return false;
    }
  }

  /**
   * Obtiene los datos de un paciente de ClinicCloud
   */
  public async getPatientData(patientId: string): Promise<PatientData> {
    try {
      this.logger.info('Obteniendo datos del paciente desde ClinicCloud', {
        patientId,
      });

      // Obtener datos básicos del paciente
      const pacientData = await this.fetchData(`/pacientes/${patientId}`);

      // Obtener información de historial médico
      const alergias = await this.fetchData(`/pacientes/${patientId}/alergias`);
      const condiciones = await this.fetchData(
        `/pacientes/${patientId}/condiciones`
    null
  );

      // Convertir datos al formato PatientData de la aplicación
      return this.convertPatientData(pacientData, {
        alergias,
        condiciones,
      });
    } catch (err) {
      this.logger.error(
        'Error al obtener datos del paciente desde ClinicCloud',
        { error, patientId 
    }
    null
  );
      throw new Error(
        `Error al obtener datos del paciente: ${.message}`
    null
  );
    }
  }

  /**
   * Busca pacientes en ClinicCloud según criterios
   */
  public async searchPatients(
    query: EMRSearchQuery,
    limit = 10
  ): Promise<EMRPatientSearchResult[]> {
    try {
      this.logger.info('Buscando pacientes en ClinicCloud', { query, limit });

      // Construir parámetros de búsqueda
      const searchParams = this.buildSearchParams;
      searchParams.append('limit', limit.toString());

      // Ejecutar la búsqueda
      const results = await this.fetchData(
        `/pacientes/buscar?${searchParams.toString()}`
    null
  );

      // Convertir resultados al formato de la aplicación
      return this.convertSearchResults;
    } catch (err) {
      this.logger.error('Error al buscar pacientes en ClinicCloud', {
        error,
        query,
      
    });
      throw new Error(`Error al buscar pacientes: ${.message}`);
    }
  }

  /**
   * Obtiene el historial médico del paciente de ClinicCloud
   */
  public async getPatientHistory(
    patientId: string,
    options?: EMRHistoryOptions
  ): Promise<EMRPatientHistory> {
    try {
      this.logger.info('Obteniendo historial médico desde ClinicCloud', {
        patientId,
        options,
      });

      // Construir objeto base del historial
      const patientHistory: EMRPatientHistory = {
        patientId,
        consultations: [],
        treatments: [],
        labResults: [],
        diagnoses: [],
      };

      // Construir filtro de fechas si se proporcionan opciones
      let fechaParams = '';
      if (options?.startDate && options?.endDate) {
        const fechaInicio = this.formatDate(options.startDate);
        const fechaFin = this.formatDate(options.endDate);
        fechaParams = `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }

      // Obtener consultas si se solicitan
      if (!options || options.includeConsultations !== false) {
        const consultas = await this.fetchData(
          `/pacientes/${patientId}/consultas?${fechaParams}`
    null
  );
        patientHistory.consultations = this.convertConsultas;
      }

      // Obtener tratamientos si se solicitan
      if (!options || options.includeTreatments !== false) {
        const tratamientos = await this.fetchData(
          `/pacientes/${patientId}/tratamientos?${fechaParams}`
    null
  );
        patientHistory.treatments = this.convertTratamientos;
      }

      // Obtener resultados de laboratorio si se solicitan
      if (!options || options.includeLabResults !== false) {
        const laboratorio = await this.fetchData(
          `/pacientes/${patientId}/laboratorio?${fechaParams}`
    null
  );
        patientHistory.labResults = this.convertLaboratorio;
      }

      // Obtener diagnósticos si se solicitan
      if (!options || options.includeDiagnoses !== false) {
        const diagnosticos = await this.fetchData(
          `/pacientes/${patientId}/diagnosticos?${fechaParams}`
    null
  );
        patientHistory.diagnoses = this.convertDiagnosticos;
      }

      return patientHistory;
    } catch (err) {
      this.logger.error('Error al obtener historial médico desde ClinicCloud', {
        error,
        patientId,
      
    });
      throw new Error(
        `Error al obtener historial médico: ${.message}`
    null
  );
    }
  }

  /**
   * Guarda una nueva consulta en ClinicCloud
   */
  public async saveConsultation(
    consultation: EMRConsultation
  ): Promise<string> {
    try {
      this.logger.info('Guardando consulta en ClinicCloud', {
        patientId: consultation.patientId,
      });

      // Convertir consulta al formato de ClinicCloud
      const consultaData = this.convertToClinicCloudConsulta;

      // Enviar la consulta a ClinicCloud
      const response = await this.postData('/consultas', consultaData);

      // Extraer el ID de la consulta creada
      const consultaId = response.id;
      if (!consultaId) {
        throw new Error('No se recibió un ID de consulta válido');
      }

      this.logger.info('Consulta guardada exitosamente en ClinicCloud', {
        consultaId,
      });
      return consultaId.toString();
    } catch (err) {
      this.logger.error('Error al guardar consulta en ClinicCloud', {
        error,
        consultation,
      
    });
      throw new Error(`Error al guardar consulta: ${.message}`);
    }
  }

  /**
   * Actualiza una consulta existente en ClinicCloud
   */
  public async updateConsultation(
    consultationId: string,
    updates: Partial<EMRConsultation>
  ): Promise<boolean> {
    try {
      this.logger.info('Actualizando consulta en ClinicCloud', {
        consultationId,
      });

      // Obtener la consulta existente
      const consultaExistente = await this.fetchData(
        `/consultas/${consultationId}`
    null
  );

      // Aplicar actualizaciones
      const consultaActualizada = this.applyConsultaUpdates(
        consultaExistente,
        updates
    null
  );

      // Enviar los cambios
      await this.putData(`/consultas/${consultationId}`, consultaActualizada);

      this.logger.info('Consulta actualizada exitosamente en ClinicCloud', {
        consultationId,
      });
      return true;
    } catch (err) {
      this.logger.error('Error al actualizar consulta en ClinicCloud', {
        error,
        consultationId,
      
    });
      throw new Error(
        `Error al actualizar consulta: ${.message}`
    null
  );
    }
  }

  /**
   * Registra un nuevo tratamiento en ClinicCloud
   */
  public async registerTreatment(treatment: EMRTreatment): Promise<string> {
    try {
      this.logger.info('Registrando tratamiento en ClinicCloud', {
        patientId: treatment.patientId,
      });

      // Convertir tratamiento al formato de ClinicCloud
      const tratamientoData = this.convertToClinicCloudTratamiento;

      // Enviar el tratamiento a ClinicCloud
      let endpoint;
      if (treatment.type === 'medication') {
        endpoint = '/tratamientos/medicamentos';
      } else if (treatment.type === 'procedure') {
        endpoint = '/tratamientos/procedimientos';
      } else {
        endpoint = '/tratamientos/otros';
      }

      const response = await this.postData;

      // Extraer el ID del tratamiento creado
      const tratamientoId = response.id;
      if (!tratamientoId) {
        throw new Error('No se recibió un ID de tratamiento válido');
      }

      this.logger.info('Tratamiento registrado exitosamente en ClinicCloud', {
        tratamientoId,
      });
      return tratamientoId.toString();
    } catch (err) {
      this.logger.error('Error al registrar tratamiento en ClinicCloud', {
        error,
        treatment,
      
    });
      throw new Error(
        `Error al registrar tratamiento: ${.message}`
    null
  );
    }
  }

  /**
   * Obtiene métricas del paciente de ClinicCloud
   */
  public async getPatientMetrics(
    patientId: string,
    metricTypes: string[]
  ): Promise<EMRPatientMetrics> {
    try {
      this.logger.info('Obteniendo métricas del paciente desde ClinicCloud', {
        patientId,
        metricTypes,
      });

      const metrics: EMRPatientMetrics = {
        patientId,
        weight: [],
        height: [],
        bloodPressure: [],
        glucose: [],
        cholesterol: [],
      };

      // Mapear tipos de métricas a los nombres utilizados en ClinicCloud
      const metricMap: Record<string, string> = {
        weight: 'peso',
        height: 'altura',
        bloodPressure: 'tension',
        glucose: 'glucosa',
        cholesterol: 'colesterol',
      };

      // Filtrar los tipos solicitados que tienen equivalente en ClinicCloud
      const metricTypesToQuery = metricTypes
        .filter((item) => metricMap[type])
        .map((item) => metricMap[type]);

      if (metricTypesToQuery.length > 0) {
        // Obtener todas las métricas en una sola petición
        const tiposParam = metricTypesToQuery.join(',');
        const metricas = await this.fetchData(
          `/pacientes/${patientId}/metricas?tipos=${tiposParam}`
    null
  );

        // Procesar cada tipo de métrica
        this.processMetricas;
      }

      return metrics;
    } catch (err) {
      this.logger.error(
        'Error al obtener métricas del paciente desde ClinicCloud',
        { error, patientId 
    }
    null
  );
      throw new Error(
        `Error al obtener métricas del paciente: ${.message}`
    null
  );
    }
  }

  /**
   * Obtiene un token de acceso para ClinicCloud
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Si tenemos un token válido, lo devolvemos
      if (
        this.accessToken &&
        this.tokenExpiration &&
        new Date() < this.tokenExpiration
      ) {
        return this.accessToken;
      }

      // Si no, debemos obtener uno nuevo
      let token;

      // ClinicCloud soporta dos métodos de autenticación:
      // 1. API Key simple
      // 2. OAuth2 con flujo de client credentials
      if (this.clientId && this.clientSecret) {
        // Usar OAuth2
        const response = await fetch(`${this.apiUrl}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Clinic-Id': this.clinicId,
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            scope: 'read write',
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Error en autenticación OAuth2: ${response.status} ${response.statusText}`
    null
  );
        }

        const data = await response.json();
        token = data.access_token;

        // Guardar token y calcular expiración (típicamente 1 hora)
        this.accessToken = token;
        this.tokenExpiration = new Date(Date.now() + data.expires_in * 1000);
      } else {
        // Usar API Key simple
        token = this.apiKey;

        // En este caso, no hay expiración (el API key es de larga duración)
        this.accessToken = token;
        this.tokenExpiration = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año
      }

      this.logger.info('Token de acceso ClinicCloud obtenido exitosamente');
      return token;
    } catch (err) {
      this.logger.error('Error al obtener token de acceso ClinicCloud', {
        error,
      
    });
      throw new Error(
        `Error al obtener token de acceso: ${.message}`
    null
  );
    }
  }

  /**
   * Realiza una petición GET autenticada a ClinicCloud
   */
  private async fetchData(
    endpoint: string
  ): Promise<
    | ClinicCloudSearchResult
    | ClinicCloudConsultaResult
    | ClinicCloudTratamientoResult
    | ClinicCloudLabResult
    | ClinicCloudDiagnosticoResult
    | ClinicCloudMetricaResult
  > {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Clinic-Id': this.clinicId,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error en petición: ${response.status} ${response.statusText}`
    null
  );
      }

      return await response.json();
    } catch (err) {
      this.logger.error('Error al recuperar datos de ClinicCloud', {
        error,
        endpoint,
      
    });
      throw error;
    }
  }

  /**
   * Realiza una petición POST autenticada a ClinicCloud
   */
  private async postData(
    endpoint: string,
    data: Record<string, string | number | boolean | object>
  ): Promise<{ id: string; exito: boolean; mensaje?: string }> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Clinic-Id': this.clinicId,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify,
      });

      if (!response.ok) {
        throw new Error(
          `Error en petición POST: ${response.status} ${response.statusText}`
    null
  );
      }

      return await response.json();
    } catch (err) {
      this.logger.error('Error al enviar datos a ClinicCloud', {
        error,
        endpoint,
      
    });
      throw error;
    }
  }

  /**
   * Realiza una petición PUT autenticada a ClinicCloud
   */
  private async putData(
    endpoint: string,
    data: Record<string, string | number | boolean | object>
  ): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Clinic-Id': this.clinicId,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify,
      });

      if (!response.ok) {
        throw new Error(
          `Error en petición PUT: ${response.status} ${response.statusText}`
    null
  );
      }

      return await response.json();
    } catch (err) {
      this.logger.error('Error al actualizar datos en ClinicCloud', {
        error,
        endpoint,
      
    });
      throw error;
    }
  }

  /**
   * Convierte datos de ClinicCloud al formato PatientData de la aplicación
   */
  private convertPatientData(
    pacienteData: ClinicCloudPaciente,
    additionalData: ClinicCloudAdditionalData
  ): PatientData {
    try {
      // Extraer información básica
      const fullName =
        `${pacienteData.nombre ?? ''} ${pacienteData.apellidos ?? ''}`.trim();
      const firstName = pacienteData.nombre ?? '';
      const lastName = pacienteData.apellidos ?? '';
      const dob = pacienteData.fechaNacimiento;
      const age = this.calculateAge;

      // Obtener información de contacto
      const email = pacienteData.email ?? '';
      const phone = pacienteData.telefono ?? '';
      const address = this.formatAddress;

      // Construir el objeto PatientData
      const patientData: PatientData = {
        id: pacienteData.id,
        personalInfo: {
          fullName,
          firstName,
          lastName,
          dateOfBirth: dob,
          age,
          gender: this.mapGender(pacienteData.genero),
          documentId: pacienteData.numeroTarjetaSanitaria ?? '',
          contactInfo: {
            email,
            phone,
            address,
          },
        },
        medicalHistory: this.extractMedicalHistory,
        vitalSigns: {},
      };

      return patientData;
    } catch (err) {
      this.logger.error('Error al convertir datos de paciente de ClinicCloud', {
        error,
      
    });
      throw new Error('Error al procesar datos del paciente');
    }
  }

  /**
   * Mapea el género del formato de ClinicCloud al formato de la aplicación
   */
  private mapGender(gender: string): string {
    switch (gender?.toLowerCase()) {
      case 'hombre':
      case 'h':
      case 'masculino':
        return 'masculino';
      case 'mujer':
      case 'm':
      case 'femenino':
        return 'femenino';
      default:
        return 'otro';
    }
  }

  /**
   * Calcula la edad a partir de la fecha de nacimiento
   */
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Extrae el historial médico de los datos adicionales
   */
  private extractMedicalHistory(
    data: ClinicCloudAdditionalData
  ): MedicalHistoryResult {
    // Extraer alergias
    const alergias = data.alergias.map((item) => ({
      id: alergia.id,
      descripcion?: alergia.descripcion,
      reaccion: alergia.reaccion,
      gravedad: alergia.gravedad,
    }));

    // Extraer condiciones crónicas
    const condiciones = data.condiciones
      .filter((item) => condicion.cronica)
      .map((item) => ({
        id: condicion.id,
        codigo: condicion.codigo,
        sistema: condicion.sistema,
        descripcion?: condicion.descripcion,
        fecha: condicion.fecha,
        estado: condicion.estado,
        cronica: condicion.cronica,
        notas: condicion.notas,
      }));

    return {
      alergias,
      condicionesCronicas: condiciones,
    };
  }

  /**
   * Formatea una fecha para las peticiones a ClinicCloud
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Construye parámetros de búsqueda para ClinicCloud
   */
  private buildSearchParams(query: EMRSearchQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (query.name) {
      if (query.name.includes(' ')) {
        const nameParts = query.name.split(' ');
        params.append('nombre', nameParts[0]);
        params.append('apellidos', nameParts.slice(1).join(' '));
      } else {
        params.append('q', query.name);
      }
    }

    if (query.documentId) {
      params.append('documento', query.documentId);
    }

    if (query.email) {
      params.append('email', query.email);
    }

    if (query.phone) {
      params.append('telefono', query.phone);
    }

    if (query.criteria && typeof query.criteria === 'string') {
      params.append('q', query.criteria);
    }

    return params;
  }

  /**
   * Convierte resultados de búsqueda de ClinicCloud al formato de la aplicación
   */
  private convertSearchResults(
    results: ClinicCloudSearchResult
  ): EMRPatientSearchResult[] {
    if (!results || !results.pacientes) return [];

    return results.pacientes.map((item) => ({
      id: paciente.id,
      fullName: `${paciente.nombre ?? ''} ${paciente.apellidos ?? ''}`.trim(),
      dateOfBirth: paciente.fechaNacimiento
        ? new Date(paciente.fechaNacimiento)
        : undefined,
      documentId: paciente.numeroTarjetaSanitaria,
      contactInfo: {
        email: paciente.email,
        phone: paciente.telefono,
      },
    }));
  }

  /**
   * Convierte consultas de ClinicCloud al formato de la aplicación
   */
  private convertConsultas(
    consultas: ClinicCloudConsultaResult
  ): EMRConsultation[] {
    if (!consultas || !consultas.consultas) return [];

    return consultas.consultas.map((item) => ({
      id: consulta.id,
      patientId: consulta.pacienteId,
      providerId: consulta.profesional,
      date: new Date(consulta.fecha),
      reason: consulta.motivo,
      notes: consulta.contenido,
      diagnoses: consulta.diagnosticos.map((item) => ({
        code: diag.codigo,
        system: diag.sistema as 'ICD-10' | 'ICD-11' | 'SNOMED-CT' | 'other',
        description: diag.descripcion,
        date: new Date(diag.fecha),
        status: diag.estado === 'activo' ? 'active' : 'resolved',
      })),
      specialty: consulta.especialidad ?? '',
      followUpDate: consulta.proximaCita
        ? new Date(consulta.proximaCita)
        : undefined,
    }));
  }

  /**
   * Convierte tratamientos de ClinicCloud al formato de la aplicación
   */
  private convertTratamientos(
    tratamientos: ClinicCloudTratamientoResult
  ): EMRTreatment[] {
    if (!tratamientos || !tratamientos.tratamientos) return [];

    return tratamientos.tratamientos.map((item) => ({
      id: tratamiento.id,
      patientId: tratamiento.pacienteId,
      providerId: tratamiento.recetadoPor,
      startDate: new Date(tratamiento.fechaInicio),
      endDate: tratamiento.fechaFin
        ? new Date(tratamiento.fechaFin)
        : undefined,
      name: tratamiento.nombreMedicamento,
      type: this.mapTreatmentType(tratamiento.tipo),
      description: tratamiento.descripcion || tratamiento.nombreMedicamento,
      dosage: tratamiento.dosis ?? '',
      frequency: tratamiento.frecuencia ?? '',
      instructions: tratamiento.instrucciones || '',
      status: this.mapTreatmentStatus(tratamiento.estado),
      consultationId: tratamiento.consultaId,
    }));
  }

  /**
   * Mapea el tipo de tratamiento de ClinicCloud al formato de la aplicación
   */
  private mapTreatmentType(
    type: string
  ): 'medication' | 'procedure' | 'therapy' | 'lifestyle' | 'other' {
    switch (type?.toLowerCase()) {
      case 'medicamento':
      case 'farmaco':
        return 'medication';
      case 'procedimiento':
      case 'cirugia':
        return 'procedure';
      case 'terapia':
      case 'fisioterapia':
      case 'rehabilitacion':
        return 'therapy';
      case 'estilo de vida':
      case 'dieta':
      case 'ejercicio':
        return 'lifestyle';
      default:
        return 'other';
    }
  }

  /**
   * Mapea el estado del tratamiento de ClinicCloud al formato de la aplicación
   */
  private mapTreatmentStatus(
    status: string
  ): 'active' | 'completed' | 'cancelled' | 'scheduled' {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'active';
      case 'completado':
      case 'finalizado':
        return 'completed';
      case 'cancelado':
        return 'cancelled';
      case 'programado':
      case 'pendiente':
        return 'scheduled';
      default:
        return 'active';
    }
  }

  /**
   * Convierte resultados de laboratorio de ClinicCloud al formato de la aplicación
   */
  private convertLaboratorio(
    laboratorio: ClinicCloudLabResult
  ): LabResultData[] {
    if (!laboratorio.resultados) return [];

    return laboratorio.resultados.map((item) => ({
      id: resultado.id,
      patientId: resultado.pacienteId,
      date: new Date(resultado.fecha),
      category: 'laboratory',
      name: resultado.tipo,
      results: resultado.resultados,
      units: resultado.unidad,
      range: resultado.rangoNormal,
      abnormal: resultado.anormal,
      notes: resultado.notas ?? '',
    }));
  }

  /**
   * Convierte diagnósticos de ClinicCloud al formato de la aplicación
   */
  private convertDiagnosticos(
    diagnosticos?: ClinicCloudDiagnosticoResult
  ): EMRDiagnosis[] {
    if (!diagnosticos?.diagnosticos) return [];

    return diagnosticos.diagnosticos.map((item) => ({
      id: diagnostico.id,
      patientId: diagnostico.pacienteId,
      date: new Date(diagnostico.fecha),
      code: diagnostico.codigo ?? '',
      system: diagnostico.sistema ?? 'CIE-10',
      description: diagnostico.descripcion,
      status: diagnostico.estado === 'activo' ? 'active' : 'resolved',
      type: 'diagnosis',
      notes: diagnostico.notas ?? '',
    }));
  }

  /**
   * Convierte una consulta al formato de ClinicCloud
   */
  private convertToClinicCloudConsulta(
    consultation: EMRConsultation
  ): ClinicCloudConsulta {
    const consulta: ClinicCloudConsulta = {
      id: consultation.id,
      pacienteId: consultation.patientId,
      medicoId: consultation.providerId,
      fecha: this.formatDate(consultation.date),
      motivo: consultation.reason,
      notas: consultation.notes ?? '',
      especialidad: consultation.specialty ?? '',
    };

    // Añadir fecha de próxima cita si existe
    if (consultation.followUpDate) {
      consulta.citaProxima = this.formatDate(consultation.followUpDate);
    }

    // Añadir diagnósticos si existen
    if (consultation.diagnoses?.length > 0) {
      consulta.diagnosticos = consultation.diagnoses.map((item) => ({
        codigo: diag.code,
        sistema: diag.system,
        descripcion?: diag.description,
      }));
    }

    // Añadir signos vitales si existen
    if (consultation.vitalSigns) {
      consulta.signosVitales = {
        temperatura: consultation.vitalSigns.temperature,
        frecuenciaCardiaca: consultation.vitalSigns.heartRate,
        frecuenciaRespiratoria: consultation.vitalSigns.respiratoryRate,
        tensionSistolica: consultation.vitalSigns.bloodPressureSystolic,
        tensionDiastolica: consultation.vitalSigns.bloodPressureDiastolic,
        saturacion: consultation.vitalSigns.oxygenSaturation,
        peso: consultation.vitalSigns.weight,
        altura: consultation.vitalSigns.height,
      };
    }

    return consulta;
  }

  /**
   * Aplica actualizaciones a una consulta existente
   */
  private applyConsultaUpdates(
    consultaExistente: ClinicCloudConsulta,
    updates: Partial<EMRConsultation>
  ): ClinicCloudConsulta {
    const updatedConsulta = { ...consultaExistente };

    if (updates.reason) {
      updatedConsulta.motivo = updates.reason;
    }

    if (updates.notes) {
      updatedConsulta.notas = updates.notes;
    }

    if (updates.specialty) {
      updatedConsulta.especialidad = updates.specialty;
    }

    if (updates.followUpDate) {
      updatedConsulta.citaProxima = this.formatDate(updates.followUpDate);
    }

    return updatedConsulta;
  }

  /**
   * Convierte un tratamiento al formato de ClinicCloud
   */
  private convertToClinicCloudTratamiento(
    treatment: EMRTreatment
  ): ClinicCloudTratamiento {
    return {
      pacienteId: treatment.patientId,
      medicoId: treatment.providerId,
      fechaInicio: this.formatDate(treatment.startDate),
      fechaFin?: treatment.endDate ? this.formatDate(treatment.endDate) : null,
      nombre: treatment.name,
      tipo: this.reverseMapTreatmentType(treatment.type),
      descripcion?: treatment.description,
      dosis: treatment.dosage ?? null,
      frecuencia: treatment.frequency ?? null,
      instrucciones?: treatment.instructions ?? null,
      estado: this.reverseMapTreatmentStatus(treatment.status),
      consultaId?: treatment.consultationId ?? null,
    };
  }

  /**
   * Mapea el tipo de tratamiento del formato de la aplicación al de ClinicCloud
   */
  private reverseMapTreatmentType(type: string): string {
    switch (type) {
      case 'medication':
        return 'medicamento';
      case 'procedure':
        return 'procedimiento';
      case 'therapy':
        return 'terapia';
      case 'lifestyle':
        return 'estilo de vida';
      default:
        return 'otro';
    }
  }

  /**
   * Mapea el estado del tratamiento del formato de la aplicación al de ClinicCloud
   */
  private reverseMapTreatmentStatus(status: string): string {
    switch (type) {
      case 'active':
        return 'activo';
      case 'completed':
        return 'completado';
      case 'cancelled':
        return 'cancelado';
      case 'scheduled':
        return 'programado';
      default:
        return 'activo';
    }
  }

  /**
   * Procesa métricas del formato de ClinicCloud al formato de la aplicación
   */
  private processMetricas(
    metricas: ClinicCloudMetricaResult,
    metrics: EMRPatientMetrics
  ): void {
    if (!metricas?.metricas) return;

    metricas.metricas.forEach((metrica: ClinicCloudMetrica) => {
      const fecha = new Date(metrica.fecha);

      switch (metrica.tipo.toLowerCase()) {
        case 'peso':
          metrics.weight.push({
            date: fecha,
            value: metrica.valor,
            units: metrica.unidad || 'kg',
          });
          break;
        case 'altura':
          metrics.height.push({
            date: fecha,
            value: metrica.valor,
            units: metrica.unidad || 'cm',
          });
          break;
        case 'tension':
          if (metrica.sistolica && metrica.diastolica) {
            metrics.bloodPressure.push({
              date: fecha,
              systolic: metrica.sistolica,
              diastolic: metrica.diastolica,
              units: metrica.unidad || 'mmHg',
            });
          }
          break;
        case 'glucosa':
          metrics.glucose.push({
            date: fecha,
            value: metrica.valor,
            units: metrica.unidad || 'mg/dL',
          });
          break;
        case 'colesterol':
          metrics.cholesterol.push({
            date: fecha,
            value: metrica.valor,
            units: metrica.unidad || 'mg/dL',
          });
          break;
      }
    });
  }
}
