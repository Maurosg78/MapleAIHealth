import { Logger } from '../../../lib/logger';
import {
  EMRAdapter,
  PatientData,
  Encounter,
  Medication,
  Allergy,
  LabResult,
} from '../types';

// Tipos para datos mock
interface MockPatient
  extends Omit<PatientData, 'labResults' | 'medications' | 'allergies'> {
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
}

interface MockEncounter extends Omit<Encounter, 'date'> {
  date: string;
  providerId: string;
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
}

interface MockMedication extends Omit<Medication, 'startDate' | 'endDate'> {
  startDate: string;
  endDate?: string;
  providerId: string;
  description: string;
  instructions?: string;
  consultationId?: string;
  patientId: string;
}

// Datos de ejemplo para demostración
const mockPatientData: MockPatient[] = [];
const mockEncounters: MockEncounter[] = [];
const mockMedications: MockMedication[] = [];

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
      id: 'PAT-001',
      fullName: 'Juan Carlos Martínez',
      birthDate: '1975-06-12',
      gender: 'masculino',
      mrn: '27456789',
      documentId: 'DNI27456789',
      contactInfo: {
        email: 'jcmartinez@example.com',
        phone: '+34612345678',
        address: 'Calle Libertad 123, Madrid',
      },
      lastVisit: new Date('2023-10-15'),
      vitalSigns: [
        {
          date: new Date('2023-10-15'),
          bloodPressure: {
            systolic: 135,
            diastolic: 85,
          },
        },
      ],
    });

    // Consulta de ejemplo
    mockEncounters.push({
      id: 'CONS-001',
      patientId: 'PAT-001',
      providerId: 'PROV-001',
      date: '2023-10-15T10:30:00Z',
      type: 'Control rutinario',
      status: 'completed',
      reason: 'Control rutinario diabetes',
      notes: 'Paciente estable. Control glucémico mejorado.',
      diagnoses: [
        {
          code: 'E11.9',
          system: 'ICD-10',
          description: 'Diabetes mellitus tipo 2 controlada',
          date: '2023-10-15T10:30:00Z',
          status: 'active',
        },
      ],
    });

    // Tratamiento de ejemplo
    mockMedications.push({
      id: 'TREAT-001',
      patientId: 'PAT-001',
      providerId: 'PROV-001',
      startDate: '2020-03-15T00:00:00Z',
      name: 'Metformina',
      dosage: '850mg',
      frequency: '2 veces al día',
      status: 'active',
      description: 'Tratamiento para control de glucemia en diabetes tipo 2',
    });
  }

  /**
   * Simula prueba de conexión siempre exitosa
   */
  public async testConnection(): Promise<boolean> {
    this.logger.info('Probando conexión');

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    return true;
  }

  /**
   * Obtiene datos de paciente de ejemplo
   */
  public async getPatientData(patientId: string): Promise<PatientData> {
    this.logger.info('Obteniendo datos del paciente', { patientId });

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Buscar paciente en datos de ejemplo
    const patient = mockPatientData.find((p) => p.id === patientId);

    if (!patient) {
      this.logger.error('Paciente no encontrado', { patientId });
      throw new Error(`Paciente no encontrado: ${patientId}`);
    }

    // Convertir fechas de string a Date
    return {
      ...patient,
      lastVisit: patient.lastVisit ? new Date(patient.lastVisit) : undefined,
      vitalSigns: patient.vitalSigns?.map((vs) => ({
        ...vs,
        date: new Date(vs.date),
      })),
    };
  }

  /**
   * Busca pacientes en datos de ejemplo
   */
  public async searchPatients(query: string): Promise<PatientData[]> {
    this.logger.info('Buscando pacientes', { query });

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Filtrar pacientes basados en criterios de búsqueda
    const results = mockPatientData
      .filter((patient) => {
        const searchTerm = query.toLowerCase();
        return (
          patient.fullName.toLowerCase().includes(searchTerm) ||
          patient.mrn.toLowerCase().includes(searchTerm) ||
          patient.documentId?.toLowerCase().includes(searchTerm)
        );
      })
      .map((patient) => ({
        ...patient,
        lastVisit: patient.lastVisit ? new Date(patient.lastVisit) : undefined,
        vitalSigns: patient.vitalSigns?.map((vs) => ({
          ...vs,
          date: new Date(vs.date),
        })),
      }));

    return results;
  }

  /**
   * Obtiene encuentros del paciente
   */
  public async getPatientEncounters(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Encounter[]> {
    this.logger.info('Obteniendo encuentros del paciente', {
      patientId,
      startDate,
      endDate,
    });

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Filtrar encuentros del paciente
    const encounters = mockEncounters
      .filter((encounter) => {
        if (encounter.patientId !== patientId) return false;
        const encounterDate = new Date(encounter.date);
        if (startDate && encounterDate < startDate) return false;
        if (endDate && encounterDate > endDate) return false;
        return true;
      })
      .map((encounter) => ({
        ...encounter,
        date: new Date(encounter.date),
      }));

    return encounters;
  }

  /**
   * Obtiene medicamentos del paciente
   */
  public async getPatientMedications(patientId: string): Promise<Medication[]> {
    this.logger.info('Obteniendo medicamentos del paciente', { patientId });

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Filtrar medicamentos del paciente
    const medications = mockMedications
      .filter((med) => med.patientId === patientId)
      .map((med) => ({
        ...med,
        startDate: new Date(med.startDate),
        endDate: med.endDate ? new Date(med.endDate) : undefined,
      }));

    return medications;
  }

  /**
   * Obtiene alergias del paciente
   */
  public async getPatientAllergies(patientId: string): Promise<Allergy[]> {
    this.logger.info('Obteniendo alergias del paciente', { patientId });

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 600));

    // En esta implementación de ejemplo, las alergias están en el historial médico
    const patient = mockPatientData.find((p) => p.id === patientId);
    if (!patient?.medicalHistory?.allergies) {
      return [];
    }

    return patient.medicalHistory.allergies.map((allergen, index) => ({
      id: `ALL-${patientId}-${index}`,
      allergen,
      severity: 'moderate',
      status: 'active',
      recordedDate: new Date(),
    }));
  }

  /**
   * Obtiene resultados de laboratorio del paciente
   */
  public async getPatientLabResults(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<LabResult[]> {
    this.logger.info('Obteniendo resultados de laboratorio del paciente', {
      patientId,
      startDate,
      endDate,
    });

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 600));

    // En esta implementación de ejemplo, no hay resultados de laboratorio
    return [];
  }
}
