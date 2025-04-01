import {
  EMRAdapter,
  EMRConsultation,
  EMRDiagnosis,
  EMRHistoryOptions,
  EMRPatientHistory,
  EMRPatientMetrics,
  EMRPatientSearchResult,
  EMRSearchQuery,
  EMRTreatment
} from '../EMRAdapter';
import { PatientData } from '../../ai/types';
import { Logger } from '../../../lib/logger';

// Definir alias de tipos para uniones
type EMRTreatmentType = 'medication' | 'procedure' | 'therapy' | 'lifestyle' | 'other';
type EMRTreatmentStatus = 'active' | 'completed' | 'cancelled' | 'scheduled';
type DiagnosisSystem = 'ICD-10' | 'ICD-11' | 'SNOMED-CT' | 'other';
type DiagnosisStatus = 'active' | 'resolved' | 'recurrent' | 'chronic' | 'suspected';
type GlucoseReadingType = 'fasting' | 'postprandial' | 'random';

// Tipos para datos mock
type MockPatient = Omit<PatientData, 'medicalHistory'> & {
  medicalHistory?: {
    allergies?: string[];
    chronicConditions?: string[];
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate?: string;
      endDate?: string;
    }>;
    surgeries?: Array<{
      procedure: string;
      date: string;
      notes?: string;
    }>;
    familyHistory?: Record<string, string[]>;
  };
};

type MockConsultation = {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  reason: string;
  notes: string;
  diagnoses?: Array<{
    code: string;
    system: string;
    description: string;
    date: string;
    status: string;
  }>;
  vitalSigns?: {
    date: string;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  treatmentPlan?: string;
  followUpDate?: string;
  specialty?: string;
};

type MockTreatment = {
  id: string;
  patientId: string;
  providerId: string;
  startDate: string;
  endDate?: string;
  name: string;
  type: string;
  description: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  status: string;
  consultationId?: string;
};

// Datos de ejemplo para demostración - importar como values que será completado en runtime
const mockPatientData: MockPatient[] = [];
const mockConsultations: MockConsultation[] = [];
const mockTreatments: MockTreatment[] = [];

/**
 * Implementación genérica del adaptador EMR para demostración
 * Esta implementación usa datos de ejemplo y no se conecta a un sistema real
 */
export class GenericEMRAdapter implements EMRAdapter {
  public readonly name = 'Generic EMR Adapter';
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger('GenericEMRAdapter');
    this.logger.info('Inicializado adaptador genérico EMR');

    // Cargar datos de ejemplo - en un caso real esto vendría de una API o base de datos
    this.loadMockData();
  }

  /**
   * Carga los datos de ejemplo
   * En un caso real, estos datos vendrían de una API o base de datos
   */
  private loadMockData(): void {
    // Datos simplificados para pasar la compilación de TypeScript
    // Paciente 1
    mockPatientData.push({
      id: "PAT-001",
      personalInfo: {
        fullName: "Juan Carlos Martínez",
        firstName: "Juan Carlos",
        lastName: "Martínez",
        dateOfBirth: "1975-06-12",
        age: 48,
        gender: "masculino",
        documentId: "27456789",
        contactInfo: {
          email: "jcmartinez@example.com",
          phone: "+34612345678",
          address: "Calle Libertad 123, Madrid"
        }
      },
      medicalHistory: {
        allergies: ["penicilina", "nueces"],
        chronicConditions: ["hipertensión", "diabetes tipo 2"],
        familyHistory: {
          "diabetes": ["padre", "abuela paterna"],
          "cardiopatías": ["madre"]
        }
      },
      vitalSigns: {
        bloodPressure: {
          systolic: 135,
          diastolic: 85
        }
      }
    });

    // Consulta de ejemplo
    mockConsultations.push({
      id: "CONS-001",
      patientId: "PAT-001",
      providerId: "PROV-001",
      date: "2023-10-15T10:30:00Z",
      reason: "Control rutinario diabetes",
      notes: "Paciente estable. Control glucémico mejorado.",
      diagnoses: [
        {
          code: "E11.9",
          system: "ICD-10",
          description: "Diabetes mellitus tipo 2 controlada",
          date: "2023-10-15T10:30:00Z",
          status: "active"
        }
      ]
    });

    // Tratamiento de ejemplo
    mockTreatments.push({
      id: "TREAT-001",
      patientId: "PAT-001",
      providerId: "PROV-001",
      startDate: "2020-03-15T00:00:00Z",
      name: "Metformina",
      type: "medication",
      description: "Tratamiento para control de glucemia en diabetes tipo 2",
      dosage: "850mg",
      frequency: "2 veces al día",
      status: "active"
    });
  }

  /**
   * Simula prueba de conexión siempre exitosa
   */
  public async testConnection(): Promise<boolean> {
    this.logger.info('Probando conexión');

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500));

    return true;
  }

  /**
   * Obtiene datos de paciente de ejemplo
   */
  public async getPatientData(patientId: string): Promise<PatientData> {
    this.logger.info('Obteniendo datos del paciente', { patientId });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Buscar paciente en datos de ejemplo
    const patient = mockPatientData.find(p => p.id === patientId);

    if (!patient) {
      this.logger.error('Paciente no encontrado', { patientId });
      throw new Error(`Paciente no encontrado: ${patientId}`);
    }

    // Convertimos explícitamente a PatientData
    return patient as unknown as PatientData;
  }

  /**
   * Busca pacientes en datos de ejemplo
   */
  public async searchPatients(query: EMRSearchQuery, limit = 10): Promise<EMRPatientSearchResult[]> {
    this.logger.info('Buscando pacientes', { query, limit });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 700));

    // Filtrar pacientes basados en criterios de búsqueda
    let results = mockPatientData
      .filter(patient => {
        if (query.name && patient.personalInfo.fullName.toLowerCase().includes(query.name.toLowerCase())) {
          return true;
        }

        if (query.documentId && patient.personalInfo.documentId === query.documentId) {
          return true;
        }

        if (query.email && patient.personalInfo.contactInfo?.email === query.email) {
          return true;
        }

        if (query.phone && patient.personalInfo.contactInfo?.phone === query.phone) {
          return true;
        }

        // Usar cadena opcional para la consulta
        if (Object.keys(query).length === 1 && query.criteria) {
          // Convertir criteria a string de forma segura
          const searchTermRaw = query.criteria;
          const searchTerm = typeof searchTermRaw === 'string'
            ? searchTermRaw.toLowerCase()
            : String(searchTermRaw).toLowerCase();

          return patient.personalInfo.fullName.toLowerCase().includes(searchTerm) ||
                (patient.personalInfo.documentId?.toLowerCase()?.includes(searchTerm) ?? false);
        }

        // Si no hay criterios, no incluir en los resultados
        return Object.keys(query).length === 0;
      })
      .map(patient => {
        const lastDate = patient.consultations?.length
          ? patient.consultations[patient.consultations.length - 1].date
          : undefined;

        return {
          id: patient.id,
          fullName: patient.personalInfo.fullName,
          dateOfBirth: new Date(patient.personalInfo.dateOfBirth),
          documentId: patient.personalInfo.documentId,
          contactInfo: patient.personalInfo.contactInfo,
          lastVisit: lastDate ? new Date(lastDate) : undefined
        };
      });

    // Limitar resultados
    if (results.length > limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * Obtiene historial del paciente
   */
  public async getPatientHistory(patientId: string, options?: EMRHistoryOptions): Promise<EMRPatientHistory> {
    this.logger.info('Obteniendo historial del paciente', { patientId, options });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Filtrar consultas por paciente
    const consultations = mockConsultations
      .filter(c => c.patientId === patientId)
      .filter(c => {
        if (!options) return true;

        let include = true;

        if (options.startDate && new Date(c.date) < options.startDate) {
          include = false;
        }

        if (options.endDate && new Date(c.date) > options.endDate) {
          include = false;
        }

        if (options.specialty && c.specialty !== options.specialty) {
          include = false;
        }

        return include;
      })
      .map(c => this.convertToEMRConsultation(c));

    // Filtrar tratamientos por paciente
    const treatments = mockTreatments
      .filter(t => t.patientId === patientId)
      .filter(t => {
        if (!options) return true;

        let include = true;

        if (options.startDate && new Date(t.startDate) < options.startDate) {
          include = false;
        }

        if (options.endDate && t.endDate && new Date(t.endDate) > options.endDate) {
          include = false;
        }

        return include;
      })
      .map(t => this.convertToEMRTreatment(t));

    // Extraer diagnósticos de las consultas
    const allDiagnoses = consultations
      .filter(c => c.diagnoses && c.diagnoses.length > 0)
      .flatMap(c => c.diagnoses as EMRDiagnosis[]);

    return {
      patientId,
      consultations,
      treatments,
      diagnoses: allDiagnoses,
      allergies: this.getPatientAllergies(patientId)
    };
  }

  /**
   * Guarda una nueva consulta
   */
  public async saveConsultation(consultation: EMRConsultation): Promise<string> {
    this.logger.info('Guardando consulta', { consultation });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 600));

    // Generar ID para la consulta
    const consultationId = `consult-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // En un caso real, aquí guardaríamos en la base de datos
    this.logger.info('Consulta guardada con éxito', { consultationId });

    return consultationId;
  }

  /**
   * Actualiza una consulta existente
   */
  public async updateConsultation(consultationId: string, updates: Partial<EMRConsultation>): Promise<boolean> {
    this.logger.info('Actualizando consulta', { consultationId, updates });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // En un caso real, aquí actualizaríamos en la base de datos
    this.logger.info('Consulta actualizada con éxito', { consultationId });

    return true;
  }

  /**
   * Registra un nuevo tratamiento
   */
  public async registerTreatment(treatment: EMRTreatment): Promise<string> {
    this.logger.info('Registrando tratamiento', { treatment });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 700));

    // Generar ID para el tratamiento
    const treatmentId = `treat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // En un caso real, aquí guardaríamos en la base de datos
    this.logger.info('Tratamiento registrado con éxito', { treatmentId });

    return treatmentId;
  }

  /**
   * Obtiene métricas de salud del paciente
   */
  public async getPatientMetrics(patientId: string, metricTypes: string[]): Promise<EMRPatientMetrics> {
    this.logger.info('Obteniendo métricas del paciente', { patientId, metricTypes });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 900));

    // Generar datos de ejemplo para las métricas solicitadas
    const metrics: EMRPatientMetrics = {
      patientId
    };

    // Obtener paciente para acceder a datos base
    const patient = mockPatientData.find(p => p.id === patientId);

    if (!patient) {
      throw new Error(`Paciente no encontrado: ${patientId}`);
    }

    // Generar historial de peso si se solicita
    if (metricTypes.includes('weight')) {
      metrics.weightHistory = this.generateWeightHistory(patient);
    }

    // Generar historial de presión arterial si se solicita
    if (metricTypes.includes('bloodPressure')) {
      metrics.bloodPressureHistory = this.generateBloodPressureHistory(patient);
    }

    // Generar historial de glucosa si se solicita
    if (metricTypes.includes('glucose')) {
      metrics.glucoseHistory = this.generateGlucoseHistory(patient);
    }

    return metrics;
  }

  /**
   * Obtiene las alergias de un paciente de los datos de ejemplo
   */
  private getPatientAllergies(patientId: string): string[] {
    return mockPatientData.find(p => p.id === patientId)?.medicalHistory?.allergies ?? [];
  }

  /**
   * Convierte una consulta mock a formato EMRConsultation
   */
  private convertToEMRConsultation(mockConsultation: MockConsultation): EMRConsultation {
    return {
      id: mockConsultation.id,
      patientId: mockConsultation.patientId,
      providerId: mockConsultation.providerId,
      date: new Date(mockConsultation.date),
      reason: mockConsultation.reason,
      notes: mockConsultation.notes,
      diagnoses: mockConsultation.diagnoses?.map(d => ({
        code: d.code,
        system: d.system as DiagnosisSystem,
        description: d.description,
        date: new Date(d.date),
        status: d.status as DiagnosisStatus,
      })),
      vitalSigns: mockConsultation.vitalSigns ? {
        date: new Date(mockConsultation.vitalSigns.date),
        temperature: mockConsultation.vitalSigns.temperature,
        heartRate: mockConsultation.vitalSigns.heartRate,
        respiratoryRate: mockConsultation.vitalSigns.respiratoryRate,
        bloodPressureSystolic: mockConsultation.vitalSigns.bloodPressureSystolic,
        bloodPressureDiastolic: mockConsultation.vitalSigns.bloodPressureDiastolic,
        oxygenSaturation: mockConsultation.vitalSigns.oxygenSaturation,
        weight: mockConsultation.vitalSigns.weight,
        height: mockConsultation.vitalSigns.height,
        bmi: mockConsultation.vitalSigns.bmi
      } : undefined,
      treatmentPlan: mockConsultation.treatmentPlan,
      followUpDate: mockConsultation.followUpDate ? new Date(mockConsultation.followUpDate) : undefined,
      specialty: mockConsultation.specialty
    };
  }

  /**
   * Convierte un tratamiento mock a formato EMRTreatment
   */
  private convertToEMRTreatment(mockTreatment: MockTreatment): EMRTreatment {
    return {
      id: mockTreatment.id,
      patientId: mockTreatment.patientId,
      providerId: mockTreatment.providerId,
      startDate: new Date(mockTreatment.startDate),
      endDate: mockTreatment.endDate ? new Date(mockTreatment.endDate) : undefined,
      name: mockTreatment.name,
      type: mockTreatment.type as EMRTreatmentType,
      description: mockTreatment.description,
      dosage: mockTreatment.dosage,
      frequency: mockTreatment.frequency,
      instructions: mockTreatment.instructions,
      status: mockTreatment.status as EMRTreatmentStatus,
      consultationId: mockTreatment.consultationId
    };
  }

  /**
   * Genera un historial de peso de ejemplo
   */
  private generateWeightHistory(patient: MockPatient): Array<{date: Date, value: number}> {
    const baseWeight = patient.vitalSigns?.weight ?? 70;
    const history: Array<{date: Date, value: number}> = [];

    // Generar datos para los últimos 6 meses
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);

      // Variar el peso ligeramente
      const variation = (Math.random() * 2 - 1) * 2; // Entre -2 y +2 kg
      const weight = baseWeight + variation;

      history.push({
        date,
        value: Number(weight.toFixed(1))
      });
    }

    return history.reverse(); // Orden cronológico
  }

  /**
   * Genera un historial de presión arterial de ejemplo
   */
  private generateBloodPressureHistory(patient: MockPatient): Array<{date: Date, systolic: number, diastolic: number}> {
    const baseSystolic = patient.vitalSigns?.bloodPressure?.systolic ?? 120;
    const baseDiastolic = patient.vitalSigns?.bloodPressure?.diastolic ?? 80;
    const history: Array<{date: Date, systolic: number, diastolic: number}> = [];

    // Generar datos para los últimos 6 meses
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);

      // Variar la presión ligeramente
      const systolicVar = (Math.random() * 10 - 5); // Entre -5 y +5
      const diastolicVar = (Math.random() * 6 - 3); // Entre -3 y +3

      history.push({
        date,
        systolic: Math.round(baseSystolic + systolicVar),
        diastolic: Math.round(baseDiastolic + diastolicVar)
      });
    }

    return history.reverse(); // Orden cronológico
  }

  /**
   * Genera un historial de glucosa de ejemplo
   */
  private generateGlucoseHistory(patient: MockPatient): Array<{date: Date, value: number, type: GlucoseReadingType}> {
    const history: Array<{date: Date, value: number, type: GlucoseReadingType}> = [];
    const types: GlucoseReadingType[] = ['fasting', 'postprandial', 'random'];

    // Determinar si el paciente tiene diabetes (para ajustar los valores)
    const hasDiabetes = patient.medicalHistory?.chronicConditions?.some(
      (c: string) => c.toLowerCase().includes('diabetes')
    ) ?? false;

    // Valores base según condición
    const baseValue = hasDiabetes ? 140 : 90;
    const variation = hasDiabetes ? 40 : 15;

    // Generar datos para los últimos 10 días
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);

      // Elegir tipo aleatorio
      const type = types[Math.floor(Math.random() * types.length)];

      // Ajustar valor base según tipo
      let typeBaseValue = baseValue;
      if (type === 'postprandial') {
        typeBaseValue += 30; // Más alto después de comer
      } else if (type === 'fasting') {
        typeBaseValue -= 10; // Más bajo en ayunas
      }

      // Variar la glucosa
      const valueVar = (Math.random() * variation * 2 - variation);

      history.push({
        date,
        value: Math.round(typeBaseValue + valueVar),
        type
      });
    }

    return history.reverse(); // Orden cronológico
  }

  /**
   * Finaliza la consulta actual
   */
  public endConsultation(
    consultationId: string,
    summary?: string
  ): boolean {
    this.logger.info('Consulta finalizada', {
      consultationId,
      summary: summary ?? 'No summary provided'
    });
    return true;
  }
}
