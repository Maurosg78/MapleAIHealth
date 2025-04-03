import crypto from 'crypto';
import {
  EMRAdapter,
  EMRConsultation,
  EMRPatientHistory,
  EMRPatientMetrics,
  EMRPatientSearchResult,
  EMRSearchQuery,
  EMRTreatment,
  LabResult,
  EMRAllergy,
  EMREncounter,
} from '../types';
import { Logger } from '../../../lib/logger';
import { PatientData } from '../types';

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
  subject?: {
    reference?: string;
  };
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
  subject?: {
    reference?: string;
  };
  requester?: {
    reference?: string;
  };
  status?: string;
}

interface FHIREncounterResource extends FHIRResource {
  resourceType: 'Encounter';
  subject?: {
    reference?: string;
  };
  participant?: Array<{
    individual?: {
      reference?: string;
    };
  }>;
  period?: {
    start?: string;
    end?: string;
  };
  reasonCode?: Array<{
    text?: string;
  }>;
  text?: {
    div?: string;
  };
  type?: Array<{
    coding?: Array<{
      code?: string;
    }>;
  }>;
  diagnosis?: Array<{
    condition?: {
      reference?: string;
      display?: string;
    };
  }>;
  status?: string;
  class?: {
    system?: string;
    code?: string;
    display?: string;
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
    suffix?: string;
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

interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
}

interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

interface FHIRAllergyIntolerance extends FHIRResource {
  patient: {
    reference: string;
  };
  code?: FHIRCodeableConcept;
  type?: string;
  clinicalStatus?: {
    coding?: Array<{
      code?: string;
    }>;
  };
  criticality?: string;
  onsetDateTime?: string;
  recordedDate?: string;
  note?: Array<{
    text?: string;
  }>;
  reaction?: Array<{
    manifestation?: Array<{
      coding?: Array<{
        code?: string;
        display?: string;
      }>;
    }>;
    severity?: string;
  }>;
}

interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  subject: {
    reference: string;
  };
  category?: Array<{
    coding?: Array<{
      code?: string;
    }>;
  }>;
  code?: FHIRCodeableConcept;
  valueQuantity?: {
    value?: number;
    unit?: string;
  };
  effectiveDateTime?: string;
  status?: string;
  referenceRange?: Array<{
    text?: string;
  }>;
  interpretation?: Array<{
    coding?: Array<{
      code?: string;
    }>;
  }>;
  note?: Array<{
    text?: string;
  }>;
  performer?: Array<{
    reference?: string;
  }>;
}

interface FHIRMedicationRequest extends FHIRResource {
  requester?: {
    reference?: string;
  };
  medicationCodeableConcept?: {
    text?: string;
  };
  authoredOn?: string;
  status?: string;
}

interface FHIRProcedure extends FHIRResource {
  performer?: Array<{
    actor?: {
      reference?: string;
    };
  }>;
  code?: {
    text?: string;
  };
  performedDateTime?: string;
  status?: string;
}

interface FHIRCarePlan extends FHIRResource {
  activity?: Array<{
    detail?: {
      code?: {
        text?: string;
      };
      scheduledString?: string;
      status?: string;
    };
  }>;
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
    this.apiKey = config.apiKey;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;

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
      export const patientResource = await this.fetchFHIRResource<FHIRPatient>(
        `Patient/${patientId}`
      );

      // Obtener información adicional como alergias, condiciones, etc.
      export const allergies = await this.fetchFHIRResource<FHIRBundle>(
        `AllergyIntolerance?patient=${patientId}`
      );
      export const conditions = await this.fetchFHIRResource<FHIRBundle>(
        `Condition?patient=${patientId}`
      );
      export const medications = await this.fetchFHIRResource<FHIRBundle>(
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
      export const searchParams = new URLSearchParams();
      searchParams.append('_count', limit.toString());

      // Ejecutar la búsqueda
      export const searchResults = await this.fetchFHIRResource<FHIRBundle>(
        `Patient?${searchParams.toString()}`
      );

      // Convertir resultados FHIR a formato de la aplicación
      return this.mapSearchResults(searchResults);
    } catch (error) {
      this.logger.error('Error al buscar pacientes en EPIC', { error, query });
      throw new Error(`Error al buscar pacientes: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene el historial médico del paciente de EPIC
   */
  public async getPatientHistory(
    patientId: string
  ): Promise<EMRPatientHistory> {
    try {
      console.log('Obteniendo historial del paciente desde EPIC');

      const [encounters, medications, allergies, labResults] =
        await Promise.all([
          this.fetchFHIRResource<FHIRBundle>(`Encounter?patient=${patientId}`),
          this.fetchFHIRResource<FHIRBundle>(
            `MedicationRequest?patient=${patientId}`
          ),
          this.fetchFHIRResource<FHIRBundle>(
            `AllergyIntolerance?patient=${patientId}`
          ),
          this.fetchFHIRResource<FHIRBundle>(
            `Observation?patient=${patientId}&category=laboratory`
          ),
        ]);

      const patientHistory: EMRPatientHistory = {
        patientId,
        encounters: this.convertFHIREncounters(encounters),
        medications: this.convertFHIRMedicationRequests(medications),
        allergies: this.convertFHIRAllergyIntolerances(allergies),
        labResults: this.convertFHIRObservations(labResults),
        diagnoses: [],
        consultations: [],
        treatments: [],
      };

      return patientHistory;
    } catch (error) {
      console.error('Error al obtener historial del paciente:', error);
      throw new Error('Error al obtener historial del paciente');
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
      export const encounterResource =
        this.convertToFHIREncounter(consultation);

      // Enviar la consulta a EPIC
      export const response = await this.postFHIRResource(
        'Encounter',
        encounterResource
      );

      // Extraer el ID del recurso creado
      export const resourceId = this.extractResourceIdFromResponse(response);

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
      export const existingEncounter =
        await this.fetchFHIRResource<FHIRResource>(
          `Encounter/${consultationId}`
        );

      // Aplicar actualizaciones al recurso FHIR
      export const updatedEncounter = this.applyConsultationUpdates(
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
      export const response = await this.postFHIRResource(
        resourceType,
        fhirResource
      );

      // Extraer el ID del recurso creado
      export const resourceId = this.extractResourceIdFromResponse(response);

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
      export const loincCodes = this.getLoincCodesForMetrics(metricTypes);

      if (loincCodes.length > 0) {
        // Obtener las observaciones para los códigos seleccionados
        export const observations = await this.fetchFHIRResource<FHIRBundle>(
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
      export const authParams = new URLSearchParams();
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
    if (
      !this.accessToken ||
      !this.tokenExpiration ||
      new Date() >= this.tokenExpiration
    ) {
      try {
        export const token = await this.getAccessToken();
        this.accessToken = token;
        // Establece la expiración a 55 minutos para renovar antes de que expire
        export const expiration = new Date(this.tokenExpiration || Date.now());
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
      export const url = `${this.apiBaseUrl}/${path}`;

      export const response = await fetch(url, {
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

      export const response = await fetch(
        `${this.apiBaseUrl}/${resourceType}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/fhir+json',
            Accept: 'application/fhir+json',
          },
          body: JSON.stringify(resource),
        }
      );

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

      export const response = await fetch(`${this.apiBaseUrl}/${path}`, {
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
    export const primaryName = patientResource.name?.[0];
    export const givenNames = primaryName?.given || [];
    export const familyName = primaryName?.family || '';
    export const fullName = `${givenNames.join(' ')} ${familyName}`.trim();

    return {
      id: patientResource.id || '',
      fullName,
      birthDate: patientResource.birthDate || '',
      gender: this.mapGender(patientResource.gender || ''),
      mrn: this.extractIdentifierFromFHIR(patientResource, 'MRN'),
      documentId: this.extractIdentifierFromFHIR(patientResource, 'SSN'),
      contactInfo: {
        email: this.extractEmailFromFHIR(patientResource),
        phone: this.extractPhoneFromFHIR(patientResource),
        address: this.extractAddressFromFHIR(patientResource),
      },
      lastVisit: undefined,
      vitalSigns: [],
      labResults: this.convertFHIRObservations(
        additionalData.observations || {
          resourceType: 'Bundle',
          type: 'searchset',
        }
      ),
      medications: [],
      allergies: [],
      diagnoses: [],
    };
  }

  // Métodos auxiliares para conversión de FHIR a formatos internos
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;

    export const birthDate = new Date(dateOfBirth);
    export const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    export const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private extractEmailFromFHIR(patientResource: FHIRPatient): string {
    export const email = patientResource.telecom?.find(
      (t) => t.system === 'email'
    );
    return email?.value ?? '';
  }

  private extractPhoneFromFHIR(patientResource: FHIRPatient): string {
    export const phone = patientResource.telecom?.find(
      (t) => t.system === 'phone'
    );
    return phone?.value ?? '';
  }

  private extractAddressFromFHIR(patientResource: FHIRPatient): string {
    const primaryAddress =
      patientResource.address?.find((a) => !a.use || a.use === 'home') ||
      patientResource.address?.[0];

    if (!primaryAddress) return '';

    export const addressParts = [
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
    export const identifier = patientResource.identifier?.find(
      (id) => id.type?.coding?.[0]?.code === type
    );
    return identifier?.value || '';
  }

  private extractMedicalHistoryFromFHIR(
    data: FHIRAdditionalData
  ): Record<string, unknown> {
    // Extraer alergias
    export const allergies = data.allergies?.entry
      ? data.allergies.entry.map((entry) => {
          export const resource = entry.resource as FHIRConditionResource;
          return resource.code?.text ?? 'Alergia desconocida';
        })
      : [];

    // Extraer condiciones crónicas
    export const conditions = data.conditions?.entry
      ? data.conditions.entry
          .filter((entry) => {
            export const resource = entry.resource as FHIRConditionResource;
            return resource.clinicalStatus?.coding?.some(
              (c) => c.code === 'active'
            );
          })
          .map((entry) => {
            export const resource = entry.resource as FHIRConditionResource;
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
      export const resource = entry.resource as FHIRMedicationResource;
      export const medication = {
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
        export const dosage = resource.dosageInstruction[0];
        if (dosage.doseAndRate && dosage.doseAndRate.length > 0) {
          export const dose = dosage.doseAndRate[0];
          medication.dosage = dose.doseQuantity
            ? `${dose.doseQuantity.value} ${dose.doseQuantity.unit}`
            : '';
        }

        medication.frequency = dosage.timing?.text ?? '';
      }

      return medication;
    });
  }

  private buildSearchUrl(query: EMRSearchQuery): string {
    export const params = new URLSearchParams();

    if (query.name) {
      params.append('name', query.name);
    }
    if (query.documentId) {
      params.append('identifier', query.documentId);
    }
    if (query.email) {
      params.append('email', query.email);
    }
    if (query.phone) {
      params.append('phone', query.phone);
    }

    return `${this.apiBaseUrl}/Patient?${params.toString()}`;
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
  private mapSearchResults(bundle: FHIRBundle): EMRPatientSearchResult[] {
    if (!bundle.entry) return [];

    return bundle.entry
      .filter((entry) => entry.resource?.resourceType === 'Patient')
      .map((entry) => {
        export const resource = entry.resource as FHIRPatient;
        export const primaryName = resource.name?.find(
          (n) => !n.use || n.use === 'official'
        ) ??
          resource.name?.[0] ?? { given: [], family: '' };

        export const givenNames = primaryName.given || [];
        export const fullName = primaryName.family
          ? `${givenNames.join(' ')} ${primaryName.family}`
          : givenNames.join(' ');

        return {
          id: resource.id ?? '',
          fullName,
          name: fullName,
          birthDate: resource.birthDate ?? '',
          gender: resource.gender ?? '',
          mrn: this.extractIdentifierFromFHIR(resource, 'MR'),
          documentId: this.extractIdentifierFromFHIR(resource, 'MR'),
          contactInfo: {
            email: this.extractEmailFromFHIR(resource),
            phone: this.extractPhoneFromFHIR(resource),
            address: this.extractAddressFromFHIR(resource),
          },
        };
      });
  }

  private convertFHIREncounters(bundle: FHIRBundle): EMREncounter[] {
    if (!bundle.entry) return [];

    return bundle.entry.map((entry) => {
      export const encounter = entry.resource as FHIREncounterResource;
      export const id = encounter.id || crypto.randomUUID();
      return {
        id,
        patientId: encounter.subject?.reference?.split('/')[1] || '',
        date: new Date(encounter.period?.start || new Date()),
        type: encounter.class?.code || 'unknown',
        status: this.mapEncounterStatus(encounter.status || 'unknown'),
        providerId:
          encounter.participant?.[0]?.individual?.reference?.split('/')[1],
        notes: encounter.text?.div,
        reason: encounter.reasonCode?.[0]?.text,
        diagnoses: encounter.diagnosis?.map((diagnosis) => ({
          id:
            diagnosis.condition?.reference?.split('/')[1] ||
            crypto.randomUUID(),
          patientId: encounter.subject?.reference?.split('/')[1] || '',
          date: new Date(encounter.period?.start || new Date()),
          code: diagnosis.condition?.reference?.split('/')[1] || '',
          system: 'http://snomed.info/sct',
          description: diagnosis.condition?.display || 'Unknown diagnosis',
          status: 'active',
          type: 'encounter-diagnosis',
          recordedDate: new Date(encounter.period?.start || new Date()),
        })),
      };
    });
  }

  private mapEncounterStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'planned':
        return 'planned';
      case 'arrived':
        return 'arrived';
      case 'triaged':
        return 'triaged';
      case 'in-progress':
        return 'in-progress';
      case 'onleave':
        return 'onleave';
      case 'finished':
        return 'finished';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'unknown';
    }
  }

  private mapAllergyStatus(
    status?: string
  ): 'active' | 'inactive' | 'resolved' {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'active';
      case 'resolved':
        return 'resolved';
      default:
        return 'inactive';
    }
  }

  private mapAllergySeverity(
    severity?: string
  ): 'mild' | 'moderate' | 'severe' {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'severe';
      case 'low':
        return 'mild';
      default:
        return 'moderate';
    }
  }

  private convertFHIRAllergyIntolerances(bundle: FHIRBundle): EMRAllergy[] {
    if (!bundle.entry) return [];

    return bundle.entry.map((entry) => {
      export const allergy = entry.resource as FHIRAllergyIntolerance;
      export const id = allergy.id || crypto.randomUUID();
      return {
        id,
        patientId: allergy.patient.reference.split('/')[1],
        name:
          allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown',
        type: allergy.type || 'allergy',
        status: this.mapAllergyStatus(
          allergy.clinicalStatus?.coding?.[0]?.code
        ),
        severity: this.mapAllergySeverity(allergy.criticality),
        onsetDate: allergy.onsetDateTime
          ? new Date(allergy.onsetDateTime)
          : undefined,
        endDate: allergy.recordedDate
          ? new Date(allergy.recordedDate)
          : undefined,
        notes: allergy.note?.[0]?.text,
        reactions: allergy.reaction?.map((reaction) => ({
          manifestation:
            reaction.manifestation?.[0]?.coding?.[0]?.display || 'Unknown',
          severity: this.mapAllergySeverity(reaction.severity),
        })),
      };
    });
  }

  private convertFHIRObservations(bundle: FHIRBundle): LabResult[] {
    if (!bundle.entry) return [];

    return bundle.entry.map((entry) => {
      export const observation = entry.resource as FHIRObservation;
      export const id = observation.id || crypto.randomUUID();
      export const resultValue =
        observation.valueQuantity?.value?.toString() || '';
      export const resultUnit = observation.valueQuantity?.unit || '';
      export const resultRange = observation.referenceRange?.[0]?.text || '';
      export const isAbnormal =
        observation.interpretation?.[0]?.coding?.[0]?.code === 'H' || false;
      export const observationCode =
        observation.code?.coding?.[0]?.code || 'unknown';

      return {
        id,
        patientId: observation.subject?.reference?.split('/')[1] || '',
        date: new Date(observation.effectiveDateTime || new Date()),
        type: observationCode,
        name:
          observation.code?.text ||
          observation.code?.coding?.[0]?.display ||
          '',
        results: {
          [observationCode]: {
            value: resultValue,
            unit: resultUnit,
            referenceRange: resultRange,
            isAbnormal,
          },
        },
        status: this.mapObservationStatus(observation.status || 'final'),
        performingLab: observation.performer?.[0]?.reference?.split('/')[1],
        notes: observation.note?.[0]?.text,
      } as LabResult;
    });
  }

  private mapObservationStatus(
    status: string
  ): 'final' | 'preliminary' | 'amended' | 'corrected' {
    switch (status.toLowerCase()) {
      case 'preliminary':
        return 'preliminary';
      case 'amended':
        return 'amended';
      case 'corrected':
        return 'corrected';
      default:
        return 'final';
    }
  }

  private convertToFHIREncounter(
    consultation: EMRConsultation
  ): FHIREncounterResource {
    return {
      resourceType: 'Encounter',
      id: consultation.id || crypto.randomUUID(),
      status: consultation.status || 'planned',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: consultation.type || 'AMB',
        display: consultation.type || 'ambulatory',
      },
      subject: {
        reference: `Patient/${consultation.patientId}`,
      },
      participant: consultation.providerId
        ? [
            {
              individual: {
                reference: `Practitioner/${consultation.providerId}`,
              },
            },
          ]
        : undefined,
      period: {
        start: consultation.date.toISOString(),
      },
      reasonCode: consultation.reason
        ? [
            {
              text: consultation.reason,
            },
          ]
        : undefined,
      text: consultation.notes
        ? {
            div: consultation.notes,
          }
        : undefined,
    };
  }

  private applyConsultationUpdates(
    existingEncounter: FHIRResource,
    updates: Partial<EMRConsultation>
  ): FHIRResource {
    export const encounter = existingEncounter as FHIREncounterResource;

    if (updates.status) {
      encounter.status = updates.status;
    }

    if (updates.type) {
      encounter.class = {
        ...encounter.class,
        code: updates.type,
        display: updates.type,
      };
    }

    if (updates.reason) {
      encounter.reasonCode = [
        {
          text: updates.reason,
        },
      ];
    }

    if (updates.notes) {
      encounter.text = {
        div: updates.notes,
      };
    }

    return encounter;
  }

  private getLoincCodesForMetrics(metricTypes: string[]): string[] {
    const metricToLoinc: Record<string, string> = {
      weight: '29463-7',
      height: '8302-2',
      bloodPressure: '85354-9',
      glucose: '2339-0',
    };

    return metricTypes
      .filter((type) => metricToLoinc[type])
      .map((type) => metricToLoinc[type]);
  }

  private processFHIRObservationsToMetrics(
    observations: FHIRBundle,
    metrics: EMRPatientMetrics
  ): void {
    if (!observations.entry) return;

    observations.entry.forEach((entry) => {
      export const observation = entry.resource as FHIRObservation;
      export const code = observation.code?.coding?.[0]?.code;
      export const value = observation.valueQuantity?.value;
      export const unit = observation.valueQuantity?.unit;
      export const date = observation.effectiveDateTime
        ? new Date(observation.effectiveDateTime)
        : new Date();

      if (!code || value === undefined) return;

      switch (code) {
        case '29463-7': // weight
          metrics.weight?.push({ date, value, unit: unit || 'kg' });
          break;
        case '8302-2': // height
          metrics.height?.push({ date, value, unit: unit || 'cm' });
          break;
        case '85354-9': // blood pressure
          metrics.bloodPressure?.push({
            date,
            systolic: value,
            diastolic: value,
            unit: unit || 'mmHg',
          });
          break;
        case '2339-0': // glucose
          metrics.glucose?.push({
            date,
            value,
            unit: unit || 'mg/dL',
            type: 'random',
          });
          break;
      }
    });
  }

  private mapGender(gender: string): string {
    switch (gender.toLowerCase()) {
      case 'male':
        return 'M';
      case 'female':
        return 'F';
      case 'other':
        return 'O';
      default:
        return 'U';
    }
  }

  private convertFHIRMedicationRequests(bundle: FHIRBundle): EMRTreatment[] {
    if (!bundle.entry) return [];

    return bundle.entry.map((entry) => {
      export const medication = entry.resource as FHIRMedicationResource;
      export const id = medication.id || crypto.randomUUID();
      return {
        id,
        patientId: medication.subject?.reference?.split('/')[1] || '',
        type: 'medication',
        status: this.mapMedicationStatus(medication.status || 'active'),
        startDate: new Date(medication.authoredOn || new Date()),
        providerId: medication.requester?.reference?.split('/')[1],
        details: {
          name:
            medication.medicationCodeableConcept?.text || 'Unknown medication',
        },
      };
    });
  }

  private mapMedicationStatus(
    status: string
  ): 'active' | 'completed' | 'cancelled' | 'scheduled' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'scheduled';
    }
  }

  private convertToFHIRMedicationRequest(
    treatment: EMRTreatment
  ): FHIRMedicationRequest {
    return {
      resourceType: 'MedicationRequest',
      id: treatment.id || crypto.randomUUID(),
      subject: {
        reference: `Patient/${treatment.patientId}`,
      },
      requester: treatment.providerId
        ? {
            reference: `Practitioner/${treatment.providerId}`,
          }
        : undefined,
      medicationCodeableConcept: {
        text:
          (treatment.details as { name?: string })?.name ||
          'Unknown medication',
      },
      authoredOn: treatment.startDate.toISOString(),
      status: treatment.status,
    };
  }

  private convertToFHIRProcedure(treatment: EMRTreatment): FHIRProcedure {
    return {
      resourceType: 'Procedure',
      id: treatment.id || crypto.randomUUID(),
      subject: {
        reference: `Patient/${treatment.patientId}`,
      },
      performer: treatment.providerId
        ? [
            {
              actor: {
                reference: `Practitioner/${treatment.providerId}`,
              },
            },
          ]
        : undefined,
      code: {
        text:
          (treatment.details as { name?: string })?.name || 'Unknown procedure',
      },
      performedDateTime: treatment.startDate.toISOString(),
      status: treatment.status,
    };
  }

  private convertToFHIRCarePlan(treatment: EMRTreatment): FHIRCarePlan {
    return {
      resourceType: 'CarePlan',
      id: treatment.id || crypto.randomUUID(),
      subject: {
        reference: `Patient/${treatment.patientId}`,
      },
      activity: [
        {
          detail: {
            code: {
              text:
                (treatment.details as { name?: string })?.name ||
                'Unknown care plan',
            },
            scheduledString: treatment.startDate.toISOString(),
            status: treatment.status,
          },
        },
      ],
    };
  }
}
