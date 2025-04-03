import crypto from "crypto";
  EMRAdapter,
import { 
   HttpService 
 } from "../../../lib/api"
  EMRConsultation,
import { 
  EMRDiagnosis,
  EMRHistoryOptions,
  EMRPatientHistory,
  EMRPatientMetrics,
  EMRPatientSearchResult,
  EMRSearchQuery,
  EMRTreatment,
} from '../EMRAdapter';

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
}

// Tipo para métricas en ClinicCloud
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

// Tipo para respuesta de métricas
interface ClinicCloudMetricaResult {
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
}

interface ClinicCloudConfig {
  apiUrl: string;
  apiKey: string;
  clinicId: string;
}

interface ClinicCloudPatient {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  genero: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ultimaVisita?: string;
}

interface ClinicCloudDiagnostico {
  id: string;
  pacienteId: string;
  fecha: string;
  codigo: string;
  sistema: "ICD-10" | "ICD-11" | "SNOMED-CT" | "other";
  descripcion: string;
  estado: "active" | "resolved" | "recurrent" | "chronic" | "suspected";
  tipo: string;
  notas?: string;
}

/**
 * Adaptador para integración con ClinicCloud
 * ClinicCloud es uno de los sistemas EMR más utilizados en España
 * Especializado en clínicas privadas y consultas médicas particulares
 */
export class ClinicCloudAdapter implements EMRAdapter {
  public readonly name = 'ClinicCloud Adapter';
  private readonly logger: Logger;
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly clinicId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiration: Date | null = null;
  private config: ClinicCloudConfig;
  private httpService: HttpService;

  constructor(config: ClinicCloudConfig, httpService: HttpService) {
    this.logger = new Logger('ClinicCloudAdapter');
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.clinicId = config.clinicId;
    this.clientId = config.clientId ?? '';
    this.clientSecret = config.clientSecret ?? '';
    this.config = config;
    this.httpService = httpService;

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
    } catch (error) {
      this.logger.error('Error al conectar con ClinicCloud', { error });
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


      // Obtener información de historial médico

      const condiciones = await this.fetchData(
        `/pacientes/${patientId}/condiciones`
      );

      // Convertir datos al formato PatientData de la aplicación
      return this.convertPatientData(pacientData, {
        alergias,
        condiciones,
      });
    } catch (error) {
      this.logger.error(
        'Error al obtener datos del paciente desde ClinicCloud',
        { error, patientId }
      );
      throw new Error(
        `Error al obtener datos del paciente: ${(error as Error).message}`
      );
    }
  }

  /**
   * Busca pacientes en ClinicCloud según criterios
   */
  public async searchPatients(query: string): Promise<EMRPatientSearchResult[]> {
    try {
      const response = await this.httpService.get<ClinicCloudPatient[]>(
        `${this.apiUrl}/pacientes/buscar`,
        {
          params: { q: query },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Clinic-ID': this.clinicId
          }
        }
      );

      return response.map(patient => ({
        id: patient.id || crypto.randomUUID(),
        fullName: `${patient.nombre} ${patient.apellido}`,
        name: `${patient.nombre} ${patient.apellido}`,
        birthDate: patient.fechaNacimiento,
        gender: patient.genero,
        mrn: patient.id,
        documentId: patient.documento,
        contactInfo: {
          email: patient.email,
          phone: patient.telefono,
          address: patient.direccion
        },
        lastVisit: patient.ultimaVisita ? new Date(patient.ultimaVisita) : undefined
      }));
    } catch (error) {
      console.error('Error buscando pacientes en ClinicCloud:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial médico del paciente de ClinicCloud
   */
  public async getPatientHistory(patientId: string): Promise<EMRConsultation[]> {
    try {
      const response = await this.httpService.get<ClinicCloudConsulta[]>(
        `${this.apiUrl}/pacientes/${patientId}/historial`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Clinic-ID': this.clinicId
          }
        }
      );

      return response.map(consulta => ({
        id: consulta.id || crypto.randomUUID(),
        patientId: consulta.pacienteId,
        providerId: consulta.medicoId,
        date: new Date(consulta.fecha),
        reason: consulta.motivo,
        notes: consulta.notas,
        specialty: consulta.especialidad,
        diagnoses: consulta.diagnosticos?.map(d => ({
          id: d.id || crypto.randomUUID(),
          patientId: d.pacienteId,
          date: new Date(d.fecha),
          code: d.codigo,
          system: d.sistema,
          description: d.descripcion,
          status: d.estado,
          type: d.tipo,
          notes: d.notas
        })),
        followUpDate: consulta.citaProxima ? new Date(consulta.citaProxima) : undefined
      }));
    } catch (error) {
      console.error('Error obteniendo historial del paciente en ClinicCloud:', error);
      throw error;
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


      // Enviar la consulta a ClinicCloud


      // Extraer el ID de la consulta creada

      if (!consultaId) {
        throw new Error('No se recibió un ID de consulta válido');
      }

      this.logger.info('Consulta guardada exitosamente en ClinicCloud', {
        consultaId,
      });
      return consultaId.toString();
    } catch (error) {
      this.logger.error('Error al guardar consulta en ClinicCloud', {
        error,
        consultation,
      });
      throw new Error(`Error al guardar consulta: ${(error as Error).message}`);
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
      );

      // Aplicar actualizaciones
      const consultaActualizada = this.applyConsultaUpdates(
        consultaExistente,
        updates
      );

      // Enviar los cambios
      await this.putData(`/consultas/${consultationId}`, consultaActualizada);

      this.logger.info('Consulta actualizada exitosamente en ClinicCloud', {
        consultationId,
      });
      return true;
    } catch (error) {
      this.logger.error('Error al actualizar consulta en ClinicCloud', {
        error,
        consultationId,
      });
      throw new Error(
        `Error al actualizar consulta: ${(error as Error).message}`
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


      // Enviar el tratamiento a ClinicCloud
      let endpoint;
      if (treatment.type === 'medication') {
        endpoint = '/tratamientos/medicamentos';
      } else if (treatment.type === 'procedure') {
        endpoint = '/tratamientos/procedimientos';
      } else {
        endpoint = '/tratamientos/otros';
      }



      // Extraer el ID del tratamiento creado

      if (!tratamientoId) {
        throw new Error('No se recibió un ID de tratamiento válido');
      }

      this.logger.info('Tratamiento registrado exitosamente en ClinicCloud', {
        tratamientoId,
      });
      return tratamientoId.toString();
    } catch (error) {
      this.logger.error('Error al registrar tratamiento en ClinicCloud', {
        error,
        treatment,
      });
      throw new Error(
        `Error al registrar tratamiento: ${(error as Error).message}`
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
        .filter((type) => metricMap[type])
        .map((type) => metricMap[type]);

      if (metricTypesToQuery.length > 0) {
        // Obtener todas las métricas en una sola petición

        const metricas = await this.fetchData(
          `/pacientes/${patientId}/metricas?tipos=${tiposParam}`
        );

        // Procesar cada tipo de métrica
        this.processMetricas(metricas, metrics);
      }

      return metrics;
    } catch (error) {
      this.logger.error(
        'Error al obtener métricas del paciente desde ClinicCloud',
        { error, patientId }
      );
      throw new Error(
        `Error al obtener métricas del paciente: ${(error as Error).message}`
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
          );
        }


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
    } catch (error) {
      this.logger.error('Error al obtener token de acceso ClinicCloud', {
        error,
      });
      throw new Error(
        `Error al obtener token de acceso: ${(error as Error).message}`
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
        );
      }

      return await response.json();
    } catch (error) {
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


      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Clinic-Id': this.clinicId,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Error en petición POST: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
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


      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Clinic-Id': this.clinicId,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Error en petición PUT: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
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





      // Obtener información de contacto




      // Construir el objeto PatientData
      const patientData: PatientData = {
        id: pacienteData.id || crypto.randomUUID(),
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
        medicalHistory: this.extractMedicalHistory(additionalData),
        vitalSigns: {},
      };

      return patientData;
    } catch (error) {
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



    let age = today.getFullYear() - birthDate.getFullYear();


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
    const alergias = data.alergias.map((alergia) => ({
      id: alergia.id || crypto.randomUUID(),
      descripcion: alergia.descripcion,
      reaccion: alergia.reaccion,
      gravedad: alergia.gravedad,
    }));

    // Extraer condiciones crónicas
    const condiciones = data.condiciones
      .filter((condicion) => condicion.cronica)
      .map((condicion) => ({
        id: condicion.id || crypto.randomUUID(),
        codigo: condicion.codigo,
        sistema: condicion.sistema,
        descripcion: condicion.descripcion,
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


    if (query.name) {
      if (query.name.includes(' ')) {

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

    return results.pacientes.map((paciente) => {
      const fullName =
        `${paciente.nombre ?? ''} ${paciente.apellidos ?? ''}`.trim();
      return {
        id: paciente.id || crypto.randomUUID(),
        fullName: fullName,
        name: fullName,
        birthDate: paciente.fechaNacimiento ?? '',
        gender: paciente.genero ?? 'desconocido',
        mrn: paciente.numeroTarjetaSanitaria ?? '',
        dateOfBirth: paciente.fechaNacimiento
          ? new Date(paciente.fechaNacimiento)
          : undefined,
        documentId: paciente.numeroTarjetaSanitaria,
        contactInfo: {
          email: paciente.email,
          phone: paciente.telefono,
        },
      };
    });
  }

  /**
   * Convierte consultas de ClinicCloud al formato de la aplicación
   */
  private convertConsultas(
    consultas: ClinicCloudConsultaResult
  ): EMRConsultation[] {
    if (!consultas || !consultas.consultas) return [];

    return consultas.consultas.map((consulta) => ({
      id: consulta.id || crypto.randomUUID(),
      patientId: consulta.pacienteId,
      providerId: consulta.profesional,
      date: new Date(consulta.fecha),
      reason: consulta.motivo,
      notes: consulta.contenido,
      diagnoses: consulta.diagnosticos.map((diag) => ({
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

    return tratamientos.tratamientos.map((tratamiento) => ({
      id: tratamiento.id || crypto.randomUUID(),
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

    return laboratorio.resultados.map((resultado) => ({
      id: resultado.id || crypto.randomUUID(),
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

    return diagnosticos.diagnosticos.map((diagnostico) => ({
      id: diagnostico.id || crypto.randomUUID(),
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
      id: consultation.id || crypto.randomUUID(),
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
      consulta.diagnosticos = consultation.diagnoses.map((diag) => ({
        codigo: diag.code,
        sistema: diag.system,
        descripcion: diag.description,
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
      fechaFin: treatment.endDate ? this.formatDate(treatment.endDate) : null,
      nombre: treatment.name,
      tipo: this.reverseMapTreatmentType(treatment.type),
      descripcion: treatment.description,
      dosis: treatment.dosage ?? null,
      frecuencia: treatment.frequency ?? null,
      instrucciones: treatment.instructions ?? null,
      estado: this.reverseMapTreatmentStatus(treatment.status),
      consultaId: treatment.consultationId ?? null,
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
    switch (status) {
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
