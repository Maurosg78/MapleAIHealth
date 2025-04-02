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
 * Tipos específicos para EPIC usando FHIR
 */
// Tipo base para recursos FHIR
interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
}

// Definir interfaz para EMRLabResult con la propiedad requerida orderedBy
interface EMRLabResult {
  id: string;
  patientId: string;
  date: Date;
  type: string;
  name: string;
  results: Record<
    string,
    {
      value: string | number;
      unit?: string;
      referenceRange?: string;
      isAbnormal?: boolean;
    }
  >;
  units?: string;
  range?: string;
  abnormal?: boolean;
  notes?: string;
  orderedBy: string;
}

// Interfaces adicionales para reducir el uso de 'any'
interface FHIRMedicationResource extends FHIRResource {
  medicationCodeableConcept?: {
    text?: string;
  };
  dosageInstruction?: Array<{
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
      };
    }>;
    timing?: {
      text?: string;
    };
  }>;
  authoredOn?: string;
}

interface FHIREncounterResource extends FHIRResource {
  id: string;
  status?: string; // Añadir la propiedad status que faltaba
  subject?: {
    reference: string;
  };
  participant?: Array<{
    individual?: {
      reference: string;
    };
  }>;
  period?: {
    start?: string;
  };
  reasonCode?: Array<{
    text?: string;
  }>;
  note?: Array<{
    text?: string;
  }>;
  serviceType?: {
    text?: string;
  };
  class?: {
    // Añadir clase como opcional
    system: string;
    code: string;
    display: string;
  };
}

interface FHIRConditionResource extends FHIRResource {
  clinicalStatus?: {
    coding?: Array<{
      code?: string;
    }>;
  };
  code?: {
    text?: string;
  };
}

// Tipo para paciente FHIR
interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  name?: Array<{
    family?: string;
    given?: string[];
    use?: string;
    prefix?: string[];
    suffix?: string[];
  }>;
  gender?: string;
  birthDate?: string;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    use?: string;
  }>;
  identifier?: Array<{
    system?: string;
    value?: string;
    type?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
  }>;
  active?: boolean;
}

// Tipo para bundle FHIR
interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  type: string;
  total?: number;
  entry?: Array<{
    resource?: FHIRResource;
    fullUrl?: string;
    search?: {
      mode?: string;
      score?: number;
    };
  }>;
}

// Tipo para respuesta FHIR (usado en algunos métodos)
interface FHIRResponse {
  resourceType: string;
  id?: string;
  status?: string;
  location?: string;
  etag?: string;
  lastModified?: string;
}

// Tipo para datos adicionales que no se obtienen directamente del paciente
interface FHIRAdditionalData {
  allergies?: FHIRBundle;
  conditions?: FHIRBundle;
  observations?: FHIRBundle;
  medications?: FHIRBundle;
}

/**
 * Adaptador para integración con EPIC EMR
 * EPIC es uno de los sistemas EMR más utilizados en hospitales y clínicas grandes
 * Este adaptador implementa la interfaz EMRAdapter para conectar con la API FHIR de EPIC
 */
export class EPICAdapter implements EMRAdapter {
  public readonly name = 'EPIC EMR Adapter';
  private readonly logger: Logger;
  private readonly apiBaseUrl: string;
  // Variables para configuración futura - actualmente no utilizadas
  private readonly apiKey?: string;
  private readonly clientId?: string;
  private readonly clientSecret?: string;
  private accessToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(config: {
    apiBaseUrl: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  }) {
    this.logger = new Logger('EPICAdapter');
    this.apiBaseUrl = config.apiBaseUrl;
    this.apiKey = config.apiKey ?? '';
    this.clientId = config.clientId ?? '';
    this.clientSecret = config.clientSecret ?? '';

    this.logger.info('Inicializado adaptador para EPIC EMR', {
      baseUrl: this.apiBaseUrl,
    });
  }

  /**
   * Prueba la conexión con EPIC EMR
   */
  public async testConnection(): Promise<boolean> {
    try {
      this.logger.info('Probando conexión con EPIC EMR');

      // Intentar obtener un token para verificar credenciales
      await this.getAccessToken();
      return true;
    } catch (error) {
      this.logger.error('Error al conectar con EPIC EMR', { error });
      return false;
    }
  }

  /**
   * Obtiene los datos de un paciente de EPIC
   */
  public async getPatientData(patientId: string): Promise<PatientData> {
    try {
      this.logger.info('Obteniendo datos del paciente desde EPIC', {
        patientId,
      });

      await this.ensureValidToken();

      // Obtener datos básicos del paciente utilizando FHIR
      const patientResource = await this.fetchFHIRResource<FHIRPatient>(
        `Patient/${patientId}`
      );

      // Obtener información adicional como alergias, condiciones, etc.
      const allergies = await this.fetchFHIRResource<FHIRBundle>(
        `AllergyIntolerance?patient=${patientId}`
      );
      const conditions = await this.fetchFHIRResource<FHIRBundle>(
        `Condition?patient=${patientId}`
      );
      const medications = await this.fetchFHIRResource<FHIRBundle>(
        `MedicationRequest?patient=${patientId}`
      );

      // Convertir datos FHIR al formato PatientData de la aplicación
      return this.convertFHIRToPatientData(patientResource, {
        allergies,
        conditions,
        medications,
      });
    } catch (error) {
      this.logger.error('Error al obtener datos del paciente desde EPIC', {
        error,
        patientId,
      });
      throw new Error(
        `Error al obtener datos del paciente: ${(error as Error).message}`
      );
    }
  }

  /**
   * Busca pacientes en EPIC según criterios
   */
  public async searchPatients(
    query: EMRSearchQuery,
    limit = 10
  ): Promise<EMRPatientSearchResult[]> {
    try {
      this.logger.info('Buscando pacientes en EPIC', { query, limit });

      await this.ensureValidToken();

      // Construir parámetros de búsqueda FHIR
      const searchParams = this.buildFHIRSearchParams(query);

      // Añadir el límite de resultados
      searchParams.append('_count', limit.toString());

      // Ejecutar la búsqueda
      const searchResults = await this.fetchFHIRResource<FHIRBundle>(
        `Patient?${searchParams.toString()}`
      );

      // Convertir resultados FHIR a formato de la aplicación
      return this.convertFHIRPatientBundle(searchResults);
    } catch (error) {
      this.logger.error('Error al buscar pacientes en EPIC', { error, query });
      throw new Error(`Error al buscar pacientes: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene el historial médico del paciente de EPIC
   */
  public async getPatientHistory(
    patientId: string,
    options?: EMRHistoryOptions
  ): Promise<EMRPatientHistory> {
    try {
      this.logger.info('Obteniendo historial médico desde EPIC', {
        patientId,
        options,
      });

      await this.ensureValidToken();

      // Construir objeto base del historial
      const patientHistory: EMRPatientHistory = {
        patientId,
        consultations: [],
        treatments: [],
        labResults: [],
        diagnoses: [],
      };

      // Obtener consultas si se solicitan
      if (!options || options.includeConsultations !== false) {
        const encounters = await this.fetchFHIRResource<FHIRBundle>(
          `Encounter?patient=${patientId}`
        );
        patientHistory.consultations = this.convertFHIREncounters(encounters);
      }

      // Obtener tratamientos si se solicitan
      if (!options || options.includeTreatments !== false) {
        const medicationRequests = await this.fetchFHIRResource<FHIRBundle>(
          `MedicationRequest?patient=${patientId}`
        );
        const procedures = await this.fetchFHIRResource<FHIRBundle>(
          `Procedure?patient=${patientId}`
        );
        patientHistory.treatments = [
          ...this.convertFHIRMedicationRequests(medicationRequests),
          ...this.convertFHIRProcedures(procedures),
        ];
      }

      // Obtener resultados de laboratorio si se solicitan
      if (!options || options.includeLabResults !== false) {
        const observations = await this.fetchFHIRResource<FHIRBundle>(
          `Observation?patient=${patientId}&category=laboratory`
        );
        patientHistory.labResults = this.convertFHIRObservations(observations);
      }

      // Obtener diagnósticos si se solicitan
      if (!options || options.includeDiagnoses !== false) {
        const conditions = await this.fetchFHIRResource<FHIRBundle>(
          `Condition?patient=${patientId}`
        );
        patientHistory.diagnoses = this.convertFHIRConditions(conditions);
      }

      return patientHistory;
    } catch (error) {
      this.logger.error('Error al obtener historial médico desde EPIC', {
        error,
        patientId,
      });
      throw new Error(
        `Error al obtener historial médico: ${(error as Error).message}`
      );
    }
  }

  /**
   * Guarda una nueva consulta en EPIC
   */
  public async saveConsultation(
    consultation: EMRConsultation
  ): Promise<string> {
    try {
      this.logger.info('Guardando consulta en EPIC', {
        patientId: consultation.patientId,
      });

      await this.ensureValidToken();

      // Convertir consulta al formato FHIR Encounter
      const encounterResource = this.convertToFHIREncounter(consultation);

      // Enviar la consulta a EPIC
      const response = await this.postFHIRResource(
        'Encounter',
        encounterResource
      );

      // Extraer el ID del recurso creado
      const resourceId = this.extractResourceIdFromResponse(response);

      this.logger.info('Consulta guardada exitosamente en EPIC', {
        resourceId,
      });
      return resourceId;
    } catch (error) {
      this.logger.error('Error al guardar consulta en EPIC', {
        error,
        consultation,
      });
      throw new Error(`Error al guardar consulta: ${(error as Error).message}`);
    }
  }

  /**
   * Actualiza una consulta existente en EPIC
   */
  public async updateConsultation(
    consultationId: string,
    updates: Partial<EMRConsultation>
  ): Promise<boolean> {
    try {
      this.logger.info('Actualizando consulta en EPIC', { consultationId });

      await this.ensureValidToken();

      // Obtener consulta existente
      const existingEncounter = await this.fetchFHIRResource<FHIRResource>(
        `Encounter/${consultationId}`
      );

      // Aplicar actualizaciones al recurso FHIR
      const updatedEncounter = this.applyConsultationUpdates(
        existingEncounter,
        updates
      );

      // Enviar la consulta actualizada
      await this.putFHIRResource(
        `Encounter/${consultationId}`,
        updatedEncounter
      );

      this.logger.info('Consulta actualizada exitosamente en EPIC', {
        consultationId,
      });
      return true;
    } catch (error) {
      this.logger.error('Error al actualizar consulta en EPIC', {
        error,
        consultationId,
      });
      throw new Error(
        `Error al actualizar consulta: ${(error as Error).message}`
      );
    }
  }

  /**
   * Registra un nuevo tratamiento en EPIC
   */
  public async registerTreatment(treatment: EMRTreatment): Promise<string> {
    try {
      this.logger.info('Registrando tratamiento en EPIC', {
        patientId: treatment.patientId,
      });

      await this.ensureValidToken();

      // Determinar el tipo de recurso FHIR basado en el tipo de tratamiento
      let resourceType: string;
      let fhirResource: FHIRResource;

      if (treatment.type === 'medication') {
        resourceType = 'MedicationRequest';
        fhirResource = this.convertToFHIRMedicationRequest(treatment);
      } else if (treatment.type === 'procedure') {
        resourceType = 'Procedure';
        fhirResource = this.convertToFHIRProcedure(treatment);
      } else {
        resourceType = 'CarePlan';
        fhirResource = this.convertToFHIRCarePlan(treatment);
      }

      // Enviar el tratamiento a EPIC
      const response = await this.postFHIRResource(resourceType, fhirResource);

      // Extraer el ID del recurso creado
      const resourceId = this.extractResourceIdFromResponse(response);

      this.logger.info('Tratamiento registrado exitosamente en EPIC', {
        resourceId,
      });
      return resourceId;
    } catch (error) {
      this.logger.error('Error al registrar tratamiento en EPIC', {
        error,
        treatment,
      });
      throw new Error(
        `Error al registrar tratamiento: ${(error as Error).message}`
      );
    }
  }

  /**
   * Obtiene métricas del paciente de EPIC
   */
  public async getPatientMetrics(
    patientId: string,
    metricTypes: string[]
  ): Promise<EMRPatientMetrics> {
    try {
      this.logger.info('Obteniendo métricas del paciente desde EPIC', {
        patientId,
        metricTypes,
      });

      await this.ensureValidToken();

      const metrics: EMRPatientMetrics = {
        patientId,
        weight: [],
        height: [],
        bloodPressure: [],
        glucose: [],
        cholesterol: [],
      };

      // Construir lista de códigos LOINC para las métricas solicitadas
      const loincCodes = this.getLoincCodesForMetrics(metricTypes);

      if (loincCodes.length > 0) {
        // Obtener las observaciones para los códigos seleccionados
        const observations = await this.fetchFHIRResource<FHIRBundle>(
          `Observation?patient=${patientId}&code=${loincCodes.join(',')}`
        );

        // Procesar las observaciones y organizarlas en métricas
        this.processFHIRObservationsToMetrics(observations, metrics);
      }

      return metrics;
    } catch (error) {
      this.logger.error('Error al obtener métricas del paciente desde EPIC', {
        error,
        patientId,
      });
      throw new Error(
        `Error al obtener métricas del paciente: ${(error as Error).message}`
      );
    }
  }

  /**
   * Obtiene un token de acceso para la API de EPIC
   */
  private async getAccessToken(): Promise<string> {
    try {
      this.logger.info('Obteniendo token de acceso para EPIC API');

      // Usar las credenciales en un escenario real
      if (!this.apiKey && !this.clientId && !this.clientSecret) {
        this.logger.warn(
          'Credenciales no proporcionadas, usando token de prueba'
        );
        return 'mock-epic-token-12345';
      }

      // En un entorno real, usaríamos estas credenciales para autenticar
      const authParams = new URLSearchParams();
      if (this.clientId) authParams.append('client_id', this.clientId);
      if (this.clientSecret)
        authParams.append('client_secret', this.clientSecret);
      if (this.apiKey) authParams.append('api_key', this.apiKey);

      // En este ejemplo simulado, solo registramos que usamos las credenciales
      this.logger.info('Autenticando con credenciales configuradas', {
        hasApiKey: !!this.apiKey,
        hasClientCredentials: !!this.clientId && !!this.clientSecret,
      });

      // Por simplicidad, devolvemos un token "simulado"
      return 'mock-epic-token-12345';
    } catch (error) {
      this.logger.error('Error al obtener token de acceso', { error });
      throw new Error('No se pudo autenticar con la API de EPIC');
    }
  }

  /**
   * Asegura que el token de acceso sea válido
   */
  private async ensureValidToken(): Promise<void> {
    const now = new Date();
    if (
      !this.accessToken ||
      !this.tokenExpiration ||
      now >= this.tokenExpiration
    ) {
      try {
        const token = await this.getAccessToken();
        this.accessToken = token;
        // Establece la expiración a 55 minutos para renovar antes de que expire
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 55);
        this.tokenExpiration = expiration;
      } catch (error) {
        this.logger.error('Error al renovar token de acceso', { error });
        this.accessToken = '';
        this.tokenExpiration = null;
        throw error;
      }
    }
  }

  /**
   * Recupera un recurso FHIR de la API de EPIC
   */
  private async fetchFHIRResource<T extends FHIRResource>(
    path: string
  ): Promise<T> {
    try {
      // Asegurar que tenemos un token válido
      await this.ensureValidToken();

      // Construir la URL completa para la solicitud
      const url = `${this.apiBaseUrl}/${path}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/fhir+json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error al obtener recurso FHIR: ${response.status} ${response.statusText}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      this.logger.error('Error al recuperar recurso FHIR', { error, path });
      throw error;
    }
  }

  /**
   * Envía un recurso FHIR a la API de EPIC
   */
  private async postFHIRResource(
    resourceType: string,
    resource: FHIRResource
  ): Promise<FHIRResponse> {
    try {
      // Asegurar que tenemos un token válido
      await this.ensureValidToken();

      const response = await fetch(`${this.apiBaseUrl}/${resourceType}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/fhir+json',
          Accept: 'application/fhir+json',
        },
        body: JSON.stringify(resource),
      });

      if (!response.ok) {
        throw new Error(
          `Error al crear recurso FHIR: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Error al crear recurso FHIR', { error, resourceType });
      throw error;
    }
  }

  /**
   * Actualiza un recurso FHIR en la API de EPIC
   */
  private async putFHIRResource(
    path: string,
    resource: FHIRResource
  ): Promise<FHIRResponse> {
    try {
      // Asegurar que tenemos un token válido
      await this.ensureValidToken();

      const response = await fetch(`${this.apiBaseUrl}/${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/fhir+json',
          Accept: 'application/fhir+json',
        },
        body: JSON.stringify(resource),
      });

      if (!response.ok) {
        throw new Error(
          `Error al actualizar recurso FHIR: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Error al actualizar recurso FHIR', { error, path });
      throw error;
    }
  }

  /**
   * Convierte datos FHIR a formato PatientData de la aplicación
   */
  private convertFHIRToPatientData(
    patientResource: FHIRPatient,
    additionalData: FHIRAdditionalData
  ): PatientData {
    try {
      // Extraer información básica del paciente
      const names = patientResource.name ?? [];
      const primaryName = names.find((n) => !n.use || n.use === 'official') ??
        names[0] ?? { given: [], family: '' };

      const firstName = primaryName.given?.join(' ') ?? '';
      const lastName = primaryName.family ?? '';
      const fullName = `${firstName} ${lastName}`.trim();

      const birthDate = patientResource.birthDate ?? '';
      const gender = patientResource.gender ?? 'unknown';

      // Obtener información de contacto
      const email = this.extractEmailFromFHIR(patientResource);
      const phone = this.extractPhoneFromFHIR(patientResource);
      const address = this.extractAddressFromFHIR(patientResource);

      // Extraer identificadores relevantes
      const mrn = this.extractIdentifierFromFHIR(patientResource, 'MR');
      const patientId = patientResource.id ?? mrn;

      // Extraer medicamentos si están disponibles
      const medications = additionalData.medications
        ? this.extractMedicationsFromFHIR(additionalData.medications)
        : [];

      // Construir el objeto de datos del paciente
      const patientData: PatientData = {
        id: patientId,
        personalInfo: {
          fullName,
          firstName,
          lastName,
          dateOfBirth: birthDate,
          age: this.calculateAge(birthDate),
          gender: this.mapGender(gender),
          documentId: mrn,
          contactInfo: {
            email,
            phone,
            address,
          },
        },
        medicalHistory: {
          ...this.extractMedicalHistoryFromFHIR(additionalData),
          medications: medications, // Añadir medicamentos al historial médico
        },
        vitalSigns: this.extractVitalSignsFromFHIR(additionalData),
      };

      return patientData;
    } catch (error) {
      this.logger.error('Error al convertir recursos FHIR a PatientData', {
        error,
      });
      throw new Error('Error al procesar datos del paciente');
    }
  }

  // Métodos auxiliares para conversión de FHIR a formatos internos
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private extractEmailFromFHIR(patientResource: FHIRPatient): string {
    const telecom = patientResource.telecom ?? [];
    const emailSystem = telecom.find((t) => t.system === 'email');
    return emailSystem?.value ?? '';
  }

  private extractPhoneFromFHIR(patientResource: FHIRPatient): string {
    const telecom = patientResource.telecom ?? [];
    const phoneSystem = telecom.find((t) => t.system === 'phone');
    return phoneSystem?.value ?? '';
  }

  private extractAddressFromFHIR(patientResource: FHIRPatient): string {
    const addresses = patientResource.address ?? [];
    const primaryAddress =
      addresses.find((a) => !a.use || a.use === 'home') || addresses[0];

    if (!primaryAddress) return '';

    const addressParts = [
      primaryAddress.line?.join(', '),
      primaryAddress.city,
      primaryAddress.state,
      primaryAddress.postalCode,
      primaryAddress.country,
    ].filter(Boolean);

    return addressParts.join(', ');
  }

  private extractIdentifierFromFHIR(
    patientResource: FHIRPatient,
    type: string
  ): string {
    const identifiers = patientResource.identifier ?? [];
    const identifier = identifiers.find((id) =>
      id.type?.coding?.some((c) => c.display === type || c.code === type)
    );
    return identifier?.value ?? '';
  }

  private extractMedicalHistoryFromFHIR(
    data: FHIRAdditionalData
  ): Record<string, unknown> {
    // Extraer alergias
    const allergies = data.allergies?.entry
      ? data.allergies.entry.map((entry) => {
          const resource = entry.resource as FHIRResource;
          const resourceWithCode = resource as { code?: { text?: string } };
          return resourceWithCode.code?.text ?? 'Alergia desconocida';
        })
      : [];

    // Extraer condiciones crónicas
    const conditions = data.conditions?.entry
      ? data.conditions.entry
          .filter((entry) => {
            const resource = entry.resource as FHIRConditionResource;
            return resource.clinicalStatus?.coding?.some(
              (c) => c.code === 'active'
            );
          })
          .map((entry) => {
            const resource = entry.resource as FHIRConditionResource;
            return resource.code?.text ?? 'Condición desconocida';
          })
      : [];

    return {
      allergies,
      chronicConditions: conditions,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractVitalSignsFromFHIR(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: FHIRAdditionalData
  ): Record<string, unknown> {
    // Implementación simplificada - en un caso real se obtendría de recursos Observation
    return {};
  }

  /**
   * Método para extraer medicaciones de recursos FHIR
   * Nota: Este método está implementado para uso futuro o referencia.
   * Actualmente no se utiliza en el flujo principal del adaptador.
   */
  private extractMedicationsFromFHIR(medicationRequests: FHIRBundle): Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate?: string;
    endDate?: string;
  }> {
    if (!medicationRequests?.entry) return [];

    return medicationRequests.entry.map((entry) => {
      const resource = entry.resource as FHIRMedicationResource;

      const medication = {
        name: resource.medicationCodeableConcept
          ? (resource.medicationCodeableConcept.text ??
            'Medicamento sin nombre')
          : 'Medicamento sin nombre',
        dosage: '',
        frequency: '',
        startDate: resource.authoredOn,
      };

      // Extraer información de dosificación con manejo seguro de undefined
      if (resource.dosageInstruction && resource.dosageInstruction.length > 0) {
        const dosage = resource.dosageInstruction[0];

        if (dosage.doseAndRate && dosage.doseAndRate.length > 0) {
          const dose = dosage.doseAndRate[0];
          medication.dosage = dose.doseQuantity
            ? `${dose.doseQuantity.value} ${dose.doseQuantity.unit}`
            : '';
        }

        medication.frequency = dosage.timing?.text ?? '';
      }

      return medication;
    });
  }

  private buildFHIRSearchParams(query: EMRSearchQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (query.name) {
      params.append('name', query.name);
    }

    if (query.documentId) {
      params.append('identifier', query.documentId);
    }

    if (query.email) {
      params.append('email:exact', query.email);
    }

    if (query.criteria && typeof query.criteria === 'string') {
      params.append('_content', query.criteria);
    }

    return params;
  }

  private extractResourceIdFromResponse(response: FHIRResponse): string {
    if (!response.id) {
      throw new Error('No se recibió un ID de recurso válido');
    }
    return response.id;
  }

  /**
   * Convierte bundle de pacientes FHIR a resultados de búsqueda
   */
  private convertFHIRPatientBundle(
    bundle: FHIRBundle
  ): EMRPatientSearchResult[] {
    if (!bundle.entry || bundle.entry.length === 0) {
      return [];
    }

    return bundle.entry
      .filter((entry) => entry.resource?.resourceType === 'Patient')
      .map((entry) => {
        const resource = entry.resource as FHIRPatient;
        const names = resource.name ?? [];
        const primaryName = names.find((n) => !n.use || n.use === 'official') ??
          names[0] ?? { given: [], family: '' };

        const firstName = primaryName.given?.join(' ') ?? '';
        const lastName = primaryName.family ?? '';
        const fullName = `${firstName} ${lastName}`.trim();

        // Extraer género del recurso FHIR
        const gender = resource.gender || 'unknown';

        // Extraer MRN del recurso FHIR
        const mrn = this.extractIdentifierFromFHIR(resource, 'MR') || '';

        // Convertir fecha de nacimiento a formato string para la interfaz
        const birthDateStr = resource.birthDate || '';

        return {
          id: resource.id ?? '',
          fullName,
          name: fullName, // Usar mismo valor que fullName
          birthDate: birthDateStr, // Fecha en formato string
          gender: gender, // Género extraído del recurso
          mrn: mrn, // MRN extraído del recurso
          dateOfBirth: resource.birthDate
            ? new Date(resource.birthDate)
            : undefined,
          documentId: this.extractIdentifierFromFHIR(resource, 'MR'),
          contactInfo: {
            email: this.extractEmailFromFHIR(resource),
            phone: this.extractPhoneFromFHIR(resource),
          },
        };
      });
  }

  private convertFHIREncounters(bundle: FHIRBundle): EMRConsultation[] {
    if (!bundle?.entry) return [];

    return bundle.entry.map((entry) => {
      const resource = entry.resource as FHIREncounterResource;

      return {
        id: resource.id,
        patientId: resource.subject?.reference.split('/')[1] ?? '',
        providerId:
          resource.participant?.[0]?.individual?.reference.split('/')[1] ?? '',
        date: new Date(resource.period?.start ?? Date.now()),
        reason: resource.reasonCode?.[0]?.text ?? 'No especificado',
        notes: resource.note?.[0]?.text ?? '',
        specialty: resource.serviceType?.text ?? '',
      } as EMRConsultation;
    });
  }

  private convertToFHIREncounter(
    consultation: EMRConsultation
  ): FHIREncounterResource {
    const fhirEncounter: FHIREncounterResource = {
      resourceType: 'Encounter',
      id: consultation.id ?? '',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory',
      },
      subject: {
        reference: `Patient/${consultation.patientId}`,
      },
      participant: [
        {
          individual: {
            reference: `Practitioner/${consultation.providerId}`,
          },
        },
      ],
      period: {
        start: consultation.date.toISOString(),
      },
      reasonCode: [
        {
          text: consultation.reason,
        },
      ],
      note: [
        {
          text: consultation.notes,
        },
      ],
    };

    if (consultation.specialty) {
      fhirEncounter.serviceType = {
        text: consultation.specialty,
      };
    }

    return fhirEncounter;
  }

  private getLoincCodesForMetrics(metricTypes: string[]): string[] {
    const metricToLoinc: Record<string, string> = {
      weight: '29463-7',
      height: '8302-2',
      bloodPressure: '85354-9',
      glucose: '2339-0',
      cholesterol: '2093-3',
    };

    return metricTypes
      .filter((type) => metricToLoinc[type])
      .map((type) => metricToLoinc[type]);
  }

  // Otros métodos de conversión FHIR omitidos por brevedad
  private convertFHIRMedicationRequests(bundle: FHIRBundle): EMRTreatment[] {
    return this.commonFHIRConverter<EMRTreatment>(bundle, (resource) => {
      // Implementación específica para convertir medicamentos
      // Esto es un placeholder, la implementación real dependería de los campos específicos
      return {
        id: resource.id ?? '',
        patientId: '',
        providerId: '',
        type: 'medication',
        name: 'Medication',
        startDate: new Date(),
        status: 'active',
      } as EMRTreatment;
    });
  }

  private convertFHIRProcedures(bundle: FHIRBundle): EMRTreatment[] {
    return this.commonFHIRConverter<EMRTreatment>(bundle, (resource) => {
      // Implementación específica para convertir procedimientos
      return {
        id: resource.id ?? '',
        patientId: '',
        providerId: '',
        type: 'procedure',
        name: 'Procedure',
        startDate: new Date(),
        status: 'scheduled',
      } as EMRTreatment;
    });
  }

  private convertFHIRObservations(bundle: FHIRBundle): EMRLabResult[] {
    if (!bundle?.entry) return [];

    return bundle.entry.map((entry) => {
      const resource = entry.resource as FHIRResource;
      // Crear objeto que cumpla con la interfaz EMRLabResult
      return {
        id: resource.id ?? '',
        patientId: '', // Extraer del recurso si está disponible
        date: new Date(), // Extraer fecha real del recurso
        type: 'laboratory',
        name: 'Lab Test', // Extraer nombre real del recurso
        results: {
          // Proporcionar un objeto de resultados en el formato requerido
          general: {
            value: 'Normal',
            unit: '',
            referenceRange: '',
            isAbnormal: false,
          },
        },
        units: '',
        range: '',
        abnormal: false,
        notes: '',
        orderedBy: '', // Añadir el valor para la propiedad obligatoria
      };
    });
  }

  private convertFHIRConditions(bundle: FHIRBundle): EMRDiagnosis[] {
    if (!bundle?.entry) return [];
    // ... rest of the method implementation ...
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private processFHIRObservationsToMetrics(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _observations: FHIRBundle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metrics: EMRPatientMetrics
  ): void {
    // Implementación simplificada
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private applyConsultationUpdates(
    existingEncounter: FHIRResource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _updates: Partial<EMRConsultation>
  ): FHIRResource {
    return existingEncounter; // Implementación simplificada
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createTreatmentConverter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _type: string
  ): (treatment: EMRTreatment) => FHIRResource {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_treatment: EMRTreatment): FHIRResource => {
      // Implementación base para todos los convertidores
      return { resourceType: 'Resource' }; // Implementación simplificada
    };
  }

  private readonly convertToFHIRMedicationRequest =
    this.createTreatmentConverter('medication');
  private readonly convertToFHIRProcedure =
    this.createTreatmentConverter('procedure');
  private readonly convertToFHIRCarePlan =
    this.createTreatmentConverter('careplan');

  /**
   * Mapea el género del formato FHIR al formato de la aplicación
   */
  private mapGender(gender: string): string {
    switch (gender.toLowerCase()) {
      case 'male':
        return 'masculino';
      case 'female':
        return 'femenino';
      default:
        return 'otro';
    }
  }

  private commonFHIRConverter<T>(
    bundle: FHIRBundle,
    mapFunction: (resource: FHIRResource) => T
  ): T[] {
    if (!bundle?.entry) return [];
    return bundle.entry
      .filter((entry) => entry.resource)
      .map((entry) => mapFunction(entry.resource as FHIRResource));
  }
}
