import {
  EMRAdapter,
import { HttpService } from "../../../lib/api";  EMRConsultation,
  EMRDiagnosis,
  EMRHistoryOptions,
  EMRPatientHistory,
  EMRPatientMetrics,
  EMRPatientSearchResult,
  EMRSearchQuery,
  EMRTreatment,
} from '../EMRAdapter';

/**
 * Tipos específicos para OSCAR EMR
 */
// Tipo para la respuesta de datos demográficos de OSCAR
interface OSCARDemographic {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  healthCardNumber?: string;
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  healthCardNumber?: string;
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  healthCardNumber?: string;
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  healthCardNumber?: string;
}

// Tipo para respuesta de resultados de búsqueda de OSCAR
interface OSCARSearchResult {
  demographics: OSCARDemographic[];
  totalResults: number;
}

// Tipo para notas clínicas de OSCAR
interface OSCAREncounter {
  id: string;
  date: string;
  providerName: string;
  reason: string;
  content: string;
  followUpDate?: string;
  specialty?: string;
}

// Tipo para respuesta de encuentros médicos de OSCAR
interface OSCAREncounterResult {
  notes: OSCAREncounter[];
}

// Tipo para prescripciones de OSCAR
interface OSCARPrescription {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: string;
  instructions?: string;
  prescribedBy: string;
}

// Tipo para respuesta de prescripciones de OSCAR
interface OSCARPrescriptionResult {
  prescriptions: OSCARPrescription[];
}

// Tipo para problemas médicos de OSCAR
interface OSCARProblem {
  id: string;
  code: string;
  codeSystem: string;
  description: string;
  dateRecorded: string;
  status: string;
  active: boolean;
  notes?: string;
}

// Tipo para respuesta de problemas médicos de OSCAR
interface OSCARProblemResult {
  problems: OSCARProblem[];
}

// Tipo para resultados de laboratorio de OSCAR
interface OSCARLab {
  id: string;
  date: string;
  type: string;
  results: {
    [key: string]: {
      value: string | number;
      unit?: string;
      normalRange?: string;
      isAbnormal?: boolean;
    };
  };
  orderedBy: string;
  notes?: string;
}

// Tipo para respuesta de laboratorio de OSCAR
interface OSCARLabResult {
  labs: OSCARLab[];
}

// Tipo para mediciones de OSCAR
interface OSCARMeasurement {
  id: string;
  type: string;
  date: string;
  value: string | number;
  unit?: string;
}

// Tipo para respuesta de mediciones de OSCAR
interface OSCARMeasurementResult {
  measurements: OSCARMeasurement[];
}

// Tipo para datos adicionales de OSCAR
interface OSCARAdditionalData {
  allergies: {
    id: string;
    description: string;
    reaction?: string;
    severity?: string;
  }[];
  problems: OSCARProblem[];
  vaccinations: {
    id: string;
    name: string;
    date: string;
    lot?: string;
    site?: string;
  }[];
}

/**
 * Interfaz para un resultado de historial médico
 */
interface MedicalHistoryResult {
  allergies: Array<{
    id: string;
    description: string;
    reaction?: string;
    severity?: string;
  }>;
  chronicConditions: Array<{
    id: string;
    code: string;
    codeSystem: string;
    description: string;
    dateRecorded: string;
    status: string;
    active: boolean;
    notes?: string;
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
  notes?: string;
}

/**
 * Interfaz para notas de OSCAR
 */
interface OSCARNote {
  id: string;
  providerNo: string;
  note: string;
  encounter: string;
  observationDate: string;
  programId: string;
  appointmentNo: number;
  revision: number;
  noteStatus: string;
  archived: number;
}

/**
 * Interfaz para un procedimiento de OSCAR
 */
interface OSCARProcedurePayload {
  id: string;
  preventionType: string;
  preventionDate: string;
  providerNo: string;
  status: string;
  refused: number;
  creationDate: string;
  name: string;
  description?: string;
}

/**
 * Interfaz para métricas de paciente
 */
interface PatientMetricEntry {
  date: Date;
  value: number;
  units: string;
}

/**
 * Adaptador para integración con OSCAR EMR
 * OSCAR (Open Source Clinical Application Resource) es uno de los sistemas EMR más utilizados en Ontario, Canadá
 * Es un sistema de código abierto diseñado específicamente para el sistema de salud canadiense
 */
export class OSCARAdapter implements EMRAdapter {
  public readonly name = 'OSCAR EMR Adapter';
  private readonly logger: Logger;
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly clinicId: string;
  private sessionToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(config: {
    baseUrl: string;
    username: string;
    password: string;
    clinicId: string;
  }) {
    this.logger = new Logger('OSCARAdapter');
    this.baseUrl = config.baseUrl;
    this.username = config.username;
    this.password = config.password;
    this.clinicId = config.clinicId;

    this.logger.info('Inicializado adaptador para OSCAR EMR', {
      baseUrl: this.baseUrl,
      clinicId: this.clinicId,
    });
  }

  /**
   * Prueba la conexión con OSCAR EMR
   */
  public async testConnection(): Promise<boolean> {
    try {
      this.logger.info('Probando conexión con OSCAR EMR');

      // Intentar autenticarse para verificar conexión
      await this.authenticate();
      return true;
    } catch (error) {
      this.logger.error('Error al conectar con OSCAR EMR', { error });
      return false;
    }
  }

  /**
   * Obtiene los datos de un paciente de OSCAR
   */
  public async getPatientData(patientId: string): Promise<PatientData> {
    try {
      this.logger.info('Obteniendo datos del paciente desde OSCAR', {
        patientId,
      });
      await this.ensureAuthenticated();

      // Obtener datos demográficos del paciente
      const demographic = await this.fetchData(
        `/demographicData?id=${patientId}`
      );

      // Obtener historial médico, alergias, condiciones, etc.

      const medications = await this.fetchData(
        `/prescriptions?id=${patientId}`
      );


      // Convertir datos de OSCAR al formato PatientData de la aplicación
      return this.convertOscarToPatientData(demographic, {
        allergies,
        medications,
        problems,
      });
    } catch (error) {
      this.logger.error('Error al obtener datos del paciente desde OSCAR', {
        error,
        patientId,
      });
      throw new Error(
        `Error al obtener datos del paciente: ${(error as Error).message}`
      );
    }
  }

  /**
   * Busca pacientes en OSCAR según criterios
   */
  public async searchPatients(
    query: EMRSearchQuery,
    limit: number = 20
  ): Promise<EMRPatientSearchResult[]> {
    this.logger.info(`[OSCARAdapter] Buscando pacientes con: ${JSON.stringify(query)}`);

    try {
      // Simulamos una búsqueda de pacientes en OSCAR
      // En una implementación real, aquí llamaríamos a las API de OSCAR

      // Para efectos de demostración, devolvemos datos mockeados
      // que cumplen con la interfaz EMRPatientSearchResult
      return [
        {
          id: '12345',
          fullName: 'Juan Pérez García',
          name: 'Juan Pérez García', // Propiedad requerida
          birthDate: '1980-05-15', // Propiedad requerida
          gender: 'M', // Propiedad requerida
          mrn: 'OSC-12345', // Propiedad requerida
          documentId: '12345678A',
          contactInfo: {
            email: 'juan.perez@example.com',
            phone: '555-123-4567',
            address: 'Calle Ejemplo 123, Madrid'
          },
          lastVisit: new Date('2023-03-10')
        },
        {
          id: '67890',
          fullName: 'María López Sánchez',
          name: 'María López Sánchez', // Propiedad requerida
          birthDate: '1975-11-23', // Propiedad requerida
          gender: 'F', // Propiedad requerida
          mrn: 'OSC-67890', // Propiedad requerida
          documentId: '87654321B',
          contactInfo: {
            email: 'maria.lopez@example.com',
            phone: '555-765-4321',
            address: 'Avenida Principal 456, Barcelona'
          },
          lastVisit: new Date('2023-04-05')
        }
      ].slice(0, limit);
    } catch (error) {
      this.logger.error(`[OSCARAdapter] Error al buscar pacientes: ${error}`);
      throw new Error(`Error al buscar pacientes en OSCAR: ${error}`);
    }
  }

  /**
   * Obtiene el historial médico del paciente de OSCAR
   */
  public async getPatientHistory(
    patientId: string,
    options?: EMRHistoryOptions
  ): Promise<EMRPatientHistory> {
    try {
      this.logger.info('Obteniendo historial médico desde OSCAR', {
        patientId,
        options,
      });
      await this.ensureAuthenticated();

      // Construir objeto base del historial
      const patientHistory: EMRPatientHistory = {
        patientId,
        consultations: [],
        treatments: [],
        labResults: [],
        diagnoses: [],
      };

      // Construir filtro de fechas si se proporcionan opciones
      let dateFilter = '';
      if (options?.startDate && options?.endDate) {


        dateFilter = `&startDate=${startDate}&endDate=${endDate}`;
      }

      // Obtener consultas si se solicitan
      if (!options || options.includeConsultations !== false) {
        const encounters = await this.fetchData(
          `/casemgmt/note?id=${patientId}${dateFilter}`
        );
        patientHistory.consultations = this.convertOscarEncounters(encounters);
      }

      // Obtener tratamientos si se solicitan
      if (!options || options.includeTreatments !== false) {
        const prescriptions = await this.fetchData(
          `/prescriptions?id=${patientId}${dateFilter}`
        );
        patientHistory.treatments =
          this.convertOscarPrescriptions(prescriptions);
      }

      // Obtener resultados de laboratorio si se solicitan
      if (!options || options.includeLabResults !== false) {
        const labs = await this.fetchData(
          `/lab/reports?id=${patientId}${dateFilter}`
        );
        patientHistory.labResults = this.convertOscarLabResults(labs);
      }

      // Obtener diagnósticos si se solicitan
      if (!options || options.includeDiagnoses !== false) {
        const problems = await this.fetchData(
          `/diseaseRegistry?id=${patientId}`
        );
        patientHistory.diagnoses = this.convertOscarProblems(problems);
      }

      return patientHistory;
    } catch (error) {
      this.logger.error('Error al obtener historial médico desde OSCAR', {
        error,
        patientId,
      });
      throw new Error(
        `Error al obtener historial médico: ${(error as Error).message}`
      );
    }
  }

  /**
   * Guarda una nueva consulta en OSCAR
   */
  public async saveConsultation(
    consultation: EMRConsultation
  ): Promise<string> {
    try {
      this.logger.info('Guardando consulta en OSCAR', {
        patientId: consultation.patientId,
      });
      await this.ensureAuthenticated();

      // Convertir consulta al formato de OSCAR


      // Enviar la consulta a OSCAR


      // Extraer el ID de la consulta creada

      if (!noteId) {
        throw new Error('No se recibió un ID de nota válido');
      }

      this.logger.info('Consulta guardada exitosamente en OSCAR', { noteId });
      return noteId.toString();
    } catch (error) {
      this.logger.error('Error al guardar consulta en OSCAR', {
        error,
        consultation,
      });
      throw new Error(`Error al guardar consulta: ${(error as Error).message}`);
    }
  }

  /**
   * Actualiza una consulta existente en OSCAR
   */
  public async updateConsultation(
    consultationId: string,
    updates: Partial<EMRConsultation>
  ): Promise<boolean> {
    try {
      this.logger.info('Actualizando consulta en OSCAR', { consultationId });
      await this.ensureAuthenticated();

      // Obtener la consulta existente
      const existingNote = await this.fetchData(
        `/casemgmt/note/${consultationId}`
      );

      // Aplicar actualizaciones a la nota


      // Enviar la consulta actualizada
      await this.putData(`/casemgmt/note/${consultationId}`, updatedNote);

      this.logger.info('Consulta actualizada exitosamente en OSCAR', {
        consultationId,
      });
      return true;
    } catch (error) {
      this.logger.error('Error al actualizar consulta en OSCAR', {
        error,
        consultationId,
      });
      throw new Error(
        `Error al actualizar consulta: ${(error as Error).message}`
      );
    }
  }

  /**
   * Registra un nuevo tratamiento en OSCAR
   */
  public async registerTreatment(treatment: EMRTreatment): Promise<string> {
    try {
      this.logger.info('Registrando tratamiento en OSCAR', {
        patientId: treatment.patientId,
      });
      await this.ensureAuthenticated();

      // Convertir tratamiento según su tipo
      let endpoint: string;
      let payload: Record<string, string | number | boolean | object>;

      if (treatment.type === 'medication') {
        endpoint = '/prescription';
        payload = this.convertToOscarPrescription(treatment);
      } else {
        endpoint = '/preventions';
        payload = this.convertToOscarProcedure(treatment);
      }

      // Enviar el tratamiento a OSCAR


      // Extraer el ID del tratamiento creado

      if (!treatmentId) {
        throw new Error('No se recibió un ID de tratamiento válido');
      }

      this.logger.info('Tratamiento registrado exitosamente en OSCAR', {
        treatmentId,
      });
      return treatmentId.toString();
    } catch (error) {
      this.logger.error('Error al registrar tratamiento en OSCAR', {
        error,
        treatment,
      });
      throw new Error(
        `Error al registrar tratamiento: ${(error as Error).message}`
      );
    }
  }

  /**
   * Obtiene métricas del paciente de OSCAR
   */
  public async getPatientMetrics(
    patientId: string,
    metricTypes: string[]
  ): Promise<EMRPatientMetrics> {
    try {
      this.logger.info('Obteniendo métricas del paciente desde OSCAR', {
        patientId,
        metricTypes,
      });
      await this.ensureAuthenticated();

      const metrics: EMRPatientMetrics = {
        patientId,
        weight: [],
        height: [],
        bloodPressure: [],
        glucose: [],
        cholesterol: [],
      };

      // Obtener las mediciones disponibles
      const measurements = await this.fetchData(
        `/measurements?id=${patientId}`
      );

      // Procesar las mediciones según los tipos solicitados
      this.processOscarMeasurements(measurements, metrics, metricTypes);

      return metrics;
    } catch (error) {
      this.logger.error('Error al obtener métricas del paciente desde OSCAR', {
        error,
        patientId,
      });
      throw new Error(
        `Error al obtener métricas del paciente: ${(error as Error).message}`
      );
    }
  }

  /**
   * Autentica con el sistema OSCAR
   */
  private async authenticate(): Promise<string> {
    try {
      // Si tenemos un token válido, lo devolvemos
      if (
        this.sessionToken &&
        this.tokenExpiration &&
        new Date() < this.tokenExpiration
      ) {
        return this.sessionToken;
      }

      const response = await fetch(`${this.baseUrl}/loginService`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: this.username,
          password: this.password,
          clinicNo: this.clinicId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error al autenticar: ${response.status} ${response.statusText}`
        );
      }



      if (!data.success || !data.token) {
        throw new Error('Autenticación fallida');
      }

      // Guardar el token y calcular expiración (8 horas es típico en OSCAR)
      this.sessionToken = data.token;
      this.tokenExpiration = new Date(Date.now() + 8 * 60 * 60 * 1000);

      this.logger.info('Autenticación con OSCAR exitosa');
      return this.sessionToken;
    } catch (error) {
      this.logger.error('Error en autenticación con OSCAR', { error });
      throw new Error(`Error de autenticación: ${(error as Error).message}`);
    }
  }

  /**
   * Asegura que exista una autenticación válida
   */
  private async ensureAuthenticated(): Promise<void> {
    await this.authenticate();
  }

  /**
   * Realiza una petición GET autenticada a OSCAR
   */
  private async fetchData(
    endpoint: string
  ): Promise<
    | OSCARSearchResult
    | OSCAREncounterResult
    | OSCARPrescriptionResult
    | OSCARLabResult
    | OSCARProblemResult
    | OSCARMeasurementResult
  > {
    try {


      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      this.logger.error('Error al recuperar datos de OSCAR', {
        error,
        endpoint,
      });
      throw error;
    }
  }

  /**
   * Realiza una petición POST autenticada a OSCAR
   */
  private async postData(
    endpoint: string,
    data: Record<string, string | number | boolean | object>
  ): Promise<{ id: string; success: boolean; message?: string }> {
    try {


      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
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
      this.logger.error('Error al enviar datos a OSCAR', { error, endpoint });
      throw error;
    }
  }

  /**
   * Realiza una petición PUT autenticada a OSCAR
   */
  private async putData(
    endpoint: string,
    data: Record<string, string | number | boolean | object>
  ): Promise<{ success: boolean; message?: string }> {
    try {


      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
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
      this.logger.error('Error al actualizar datos en OSCAR', {
        error,
        endpoint,
      });
      throw error;
    }
  }

  // Métodos de conversión de formato OSCAR a formatos internos

  /**
   * Convierte datos de OSCAR al formato PatientData de la aplicación
   */
  private convertOscarToPatientData(
    demographic: OSCARDemographic,
    additionalData: OSCARAdditionalData
  ): PatientData {
    try {
      // Extraer información básica
      const fullName =
        `${demographic.firstName ?? ''} ${demographic.lastName ?? ''}`.trim();





      // Obtener información de contacto




      // Construir objeto de datos del paciente
      const patientData: PatientData = {
        id: demographic.id,
        personalInfo: {
          fullName,
          firstName,
          lastName,
          birthDate: dob,
          age,
          gender: demographic.gender,
          documentId: demographic.healthCardNumber ?? '', // Health Insurance Number en Canadá
          contactInfo: {
            email,
            phone,
            address,
          },
        },
        medicalHistory: this.extractMedicalHistoryFromOscar(additionalData),
        vitalSigns: {},
      };

      return patientData;
    } catch (error) {
      this.logger.error('Error al convertir datos de OSCAR a PatientData', {
        error,
      });
      throw new Error('Error al procesar datos del paciente');
    }
  }

  /**
   * Calcula la edad a partir de la fecha de nacimiento
   */
  private calculateAge(birthDate: string): number {
    if (!birthDate) return 0;



    let age = today.getFullYear() - birthDate.getFullYear();


    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Formatea la dirección a partir de campos individuales
   */
  private formatAddress(demographic: OSCARDemographic): string {
    const components = [
      demographic.address,
      demographic.city,
      demographic.province,
      demographic.postalCode,
    ].filter(Boolean);

    return components.join(', ');
  }

  /**
   * Extrae el historial médico del formato OSCAR
   */
  private extractMedicalHistoryFromOscar(
    data: OSCARAdditionalData
  ): MedicalHistoryResult {
    // Extraer alergias
    const allergies = data.allergies.map((allergy) => ({
      id: allergy.id,
      description: allergy.description,
      reaction: allergy.reaction,
      severity: allergy.severity,
    }));

    // Extraer condiciones crónicas (problemas activos)
    const problems = data.problems
      .filter((problem) => problem.active)
      .map((problem) => ({
        id: problem.id,
        code: problem.code,
        codeSystem: problem.codeSystem,
        description: problem.description,
        dateRecorded: problem.dateRecorded,
        status: problem.status,
        active: problem.active,
        notes: problem.notes,
      }));

    return {
      allergies,
      chronicConditions: problems,
    };
  }

  /**
   * Construye parámetros de búsqueda para OSCAR
   */
  private buildSearchParams(query: EMRSearchQuery): URLSearchParams {


    if (query.name) {
      if (query.name.includes(' ')) {

        params.append('firstName', firstName);
        params.append('lastName', lastNames.join(' '));
      } else {
        params.append('name', query.name);
      }
    }

    if (query.documentId) {
      params.append('hin', query.documentId); // Health Insurance Number
    }

    if (query.email) {
      params.append('email', query.email);
    }

    if (query.phone) {
      params.append('phone', query.phone);
    }

    if (query.criteria && typeof query.criteria === 'string') {
      params.append('keywords', query.criteria);
    }

    return params;
  }

  // Métodos de conversión simplificados

  private convertOscarPatientResults(
    results: OSCARSearchResult
  ): EMRPatientSearchResult[] {
    if (!results?.demographics) return [];

    return results.demographics.map((demo: OSCARDemographic) => ({
      id: demo.id,
      name: `${demo.firstName ?? ''} ${demo.lastName ?? ''}`.trim(),
      birthDate: demo.birthDate,
      gender: demo.gender,
      mrn: demo.healthCardNumber ?? '',
    }));
  }

  private convertOscarEncounters(
    encounters: OSCAREncounterResult
  ): EMRConsultation[] {
    if (!encounters?.notes) return [];

    return encounters.notes.map((note: OSCAREncounter) => ({
      id: note.id,
      patientId: note.id,
      providerId: note.providerName,
      date: new Date(note.date),
      reason: note.reason,
      notes: note.content,
      specialty: note.specialty ?? '',
    }));
  }

  private convertOscarPrescriptions(
    prescriptions: OSCARPrescriptionResult
  ): EMRTreatment[] {
    if (!prescriptions?.prescriptions) return [];

    return prescriptions.prescriptions.map((rx: OSCARPrescription) => ({
      id: rx.id,
      patientId: rx.id,
      providerId: rx.prescribedBy,
      startDate: new Date(rx.startDate),
      endDate: rx.endDate ? new Date(rx.endDate) : undefined,
      name: rx.drugName,
      type: 'medication',
      description: rx.special ?? rx.drugName,
      dosage: rx.dosage,
      frequency: rx.frequency ?? '',
      instructions: rx.instructions ?? '',
      status: rx.status === 'completed' ? 'completed' : 'active',
    }));
  }

  private convertOscarLabResults(labs: OSCARLabResult): LabResultData[] {
    if (!labs?.labs) return [];

    return labs.labs.map((lab) => ({
      id: lab.id,
      patientId: lab.id,
      date: new Date(lab.date),
      category: 'laboratory',
      name: lab.type,
      results: lab.results,
      units: lab.orderedBy,
      range: lab.normalRange,
      abnormal: lab.isAbnormal,
      notes: lab.notes,
    }));
  }

  private convertOscarProblems(problems: OSCARProblemResult): EMRDiagnosis[] {
    if (!problems?.problems) return [];

    return problems.problems.map((problem: OSCARProblem) => ({
      id: problem.id,
      patientId: problem.id,
      date: new Date(problem.dateRecorded),
      code: problem.code,
      system: problem.codeSystem,
      description: problem.description,
      status: problem.active ? 'active' : 'resolved',
      type: 'problem',
      notes: problem.notes ?? '',
    }));
  }

  // Métodos de conversión del formato interno a OSCAR

  private convertToOscarNote(
    consultation: EMRConsultation
  ): Record<string, string | number | boolean> {
    return {
      id: consultation.patientId,
      providerNo: consultation.providerId,
      note: consultation.notes,
      encounter: consultation.reason,
      observationDate: consultation.date.toISOString().split('T')[0],
      programId: consultation.specialty ?? '0',
      appointmentNo: 0,
      revision: 1,
      noteStatus: 'A',
      archived: 0,
    };
  }

  private applyConsultationUpdates(
    existingNote: OSCARNote,
    updates: Partial<EMRConsultation>
  ): Record<string, string | number | boolean> {


    if (updates.notes) {
      updatedNote.note = updates.notes;
    }

    if (updates.reason) {
      updatedNote.encounter = updates.reason;
    }

    if (updates.specialty) {
      updatedNote.programId = updates.specialty;
    }

    // Incrementar revisión
    updatedNote.revision =
      (parseInt(String(updatedNote.revision), 10) ?? 1) + 1;

    return updatedNote;
  }

  private convertToOscarPrescription(
    treatment: EMRTreatment
  ): Record<string, string | number | boolean | null> {
    return {
      id: treatment.patientId,
      providerNo: treatment.providerId,
      rxDate: treatment.startDate.toISOString().split('T')[0],
      endDate: treatment.endDate
        ? treatment.endDate.toISOString().split('T')[0]
        : null,
      drugName: treatment.name,
      takeMin: treatment.dosage ? parseFloat(treatment.dosage) : null,
      takeUnits: treatment.dosage
        ? treatment.dosage.replace(/[\d.]/g, '').trim()
        : null,
      frequency: treatment.frequency ?? '',
      special: treatment.instructions ?? '',
      archived: 0,
      written: 1,
    };
  }

  private convertToOscarProcedure(
    treatment: EMRTreatment
  ): OSCARProcedurePayload {
    return {
      id: treatment.patientId,
      preventionType: treatment.type === 'procedure' ? 'Procedure' : 'Other',
      preventionDate: treatment.startDate.toISOString().split('T')[0],
      providerNo: treatment.providerId,
      status: treatment.status === 'completed' ? '1' : '0',
      refused: 0,
      creationDate: new Date().toISOString().split('T')[0],
      name: treatment.name,
      description: treatment.description,
    };
  }

  private processOscarMeasurements(
    measurements: OSCARMeasurementResult,
    metrics: EMRPatientMetrics,
    metricTypes: string[]
  ): void {
    if (!measurements?.measurements) return;

    // Mapear los tipos de métricas de OSCAR a los tipos de la aplicación
    const oscarTypeMap: Record<string, string> = {
      WT: 'weight',
      HT: 'height',
      BP: 'bloodPressure',
      BG: 'glucose',
      CHOL: 'cholesterol',
    };

    measurements.measurements.forEach((measurement: OSCARMeasurement) => {


      // Verificar si este tipo de métrica fue solicitado
      if (metricType && metricTypes.includes(metricType)) {
        const entry = {
          date: new Date(measurement.date),
          value: parseFloat(measurement.value),
          units: measurement.unit ?? '',
        };

        // Añadir la entrada a la categoría adecuada
        if (metricType === 'bloodPressure' && measurement.value.includes('/')) {
          const [systolic, diastolic] = measurement.value
            .split('/')
            .map(Number);
          metrics.bloodPressure.push({
            date: entry.date,
            systolic,
            diastolic,
            units: entry.units,
          });
        } else {
          (
            metrics[
              metricType as keyof EMRPatientMetrics
            ] as PatientMetricEntry[]
          ).push(entry);
        }
      }
    });
  }
}
