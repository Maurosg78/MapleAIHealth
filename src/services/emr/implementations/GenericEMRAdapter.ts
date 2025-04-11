import { EMRAdapter } from '../EMRAdapter';
import {
  PatientData,
  EMRConsultation,
  EMRTreatment,
  EMRUnstructuredNote,
  CompleteEMRData,
} from '../types';
import { EMRAdapterConfig } from '../EMRAdapterFactory';

/**
 * Adaptador genérico para sistemas EMR
 * Sirve como implementación básica y para propósitos de demo
 */
export class GenericEMRAdapter implements EMRAdapter {
  protected config: EMRAdapterConfig;

  constructor(config: EMRAdapterConfig) {
    this.config = config;
  }

  /**
   * Obtiene datos del paciente
   * @param patientId ID del paciente
   */
  async getPatientData(patientId: string): Promise<PatientData> {
    // Simulación para propósitos de demo
    return {
      id: patientId,
      firstName: 'Juan',
      lastName: 'Ejemplo',
      dateOfBirth: '1978-05-15',
      gender: 'male',
      email: 'juan.ejemplo@example.com',
      phone: '+56 9 1234 5678',
      address: 'Av. Ejemplo 123, Santiago, Chile',
    };
  }

  /**
   * Busca pacientes según criterios
   * @param criteria Criterios de búsqueda
   * @param limit Límite de resultados
   */
  async searchPatients(
    _criteria: Record<string, unknown>,
    limit = 10
  ): Promise<PatientData[]> {
    // Simulación para propósitos de demo
    const patients: PatientData[] = [
      {
        id: 'P12345',
        firstName: 'Juan',
        lastName: 'Ejemplo',
        dateOfBirth: '1978-05-15',
        gender: 'male',
      },
      {
        id: 'P12346',
        firstName: 'María',
        lastName: 'Modelo',
        dateOfBirth: '1985-10-20',
        gender: 'female',
      },
    ];
    return patients.slice(0, limit);
  }

  /**
   * Obtiene consultas médicas del paciente
   * @param patientId ID del paciente
   * @param limit Límite de resultados
   */
  async getConsultations(
    patientId: string,
    limit = 10
  ): Promise<EMRConsultation[]> {
    // Simulación para propósitos de demo
    const consultations: EMRConsultation[] = [
      {
        id: 'C1001',
        patientId,
        date: '2023-05-10',
        notes:
          'Paciente acude por dolor lumbar. Se recomienda reposo y analgésicos.',
        status: 'completed',
      },
      {
        id: 'C1002',
        patientId,
        date: '2023-06-15',
        notes:
          'Control. Paciente refiere mejoría del dolor. Se mantiene tratamiento.',
        status: 'completed',
      },
      {
        id: 'C1003',
        patientId,
        date: '2023-08-20',
        notes:
          'Paciente presenta dolor en rodilla derecha. Se solicita radiografía.',
        status: 'active',
      },
    ];
    return consultations.slice(0, limit);
  }

  /**
   * Obtiene tratamientos asociados a una consulta
   * @param consultationId ID de la consulta
   */
  async getTreatments(consultationId: string): Promise<EMRTreatment[]> {
    // Simulación para propósitos de demo
    return [
      {
        id: 'T2001',
        consultationId,
        description: 'Ibuprofeno 400mg cada 8 horas por 5 días',
        status: 'completed',
      },
      {
        id: 'T2002',
        consultationId,
        description: 'Fisioterapia 2 veces por semana por 3 semanas',
        status: 'active',
      },
    ];
  }

  /**
   * Verifica si la conexión con el EMR está activa
   */
  async testConnection(): Promise<boolean> {
    // Simulación para propósitos de demo
    return true;
  }

  /**
   * Obtiene notas médicas no estructuradas del paciente
   * @param patientId ID del paciente
   * @param limit Límite de resultados
   */
  async getUnstructuredNotes(
    patientId: string,
    limit = 10
  ): Promise<EMRUnstructuredNote[]> {
    // Simulación para propósitos de demo
    const notes: EMRUnstructuredNote[] = [
      {
        id: 'N3001',
        patientId,
        date: '2023-05-10',
        provider: 'Dr. García',
        content:
          'Paciente masculino de 45 años acude por dolor en región lumbar de 2 semanas de evolución. Refiere que empeora con el movimiento y mejora parcialmente con antiinflamatorios. No refiere traumatismo previo. Examen físico: dolor a la palpación de musculatura paravertebral lumbar, sin signos radiculares. Diagnóstico presuntivo: lumbalgia mecánica. Plan: reposo relativo, ibuprofeno 400mg cada 8 horas por 5 días, control en 10 días.',
        createdAt: new Date(),
        consultationId: 'C1001',
        type: 'consultation',
      },
      {
        id: 'N3002',
        patientId,
        date: '2023-06-15',
        provider: 'Dr. García',
        content:
          'Paciente en control por lumbalgia. Refiere mejoría significativa del dolor. Mantiene episodios ocasionales de molestia leve con esfuerzos. Examen físico: sin dolor a la palpación, movilidad conservada. Plan: mantener ejercicios de fortalecimiento lumbar, usar analgésicos solo si necesario, control en 1 mes.',
        createdAt: new Date(),
        consultationId: 'C1002',
        type: 'consultation',
      },
      {
        id: 'N3003',
        patientId,
        date: '2023-08-20',
        provider: 'Dr. García',
        content:
          'Paciente acude por cuadro de 1 semana de dolor en rodilla derecha, de inicio progresivo, no relacionado con traumatismo. Refiere dolor principalmente al subir y bajar escaleras. Examen físico: dolor a la palpación de región anterior de rodilla, sin signos de inestabilidad ligamentaria. Diagnóstico presuntivo: condromalacia patelar. Plan: solicitud de radiografía de rodilla, ibuprofeno 400mg cada 8 horas por 5 días, reposo deportivo.',
        createdAt: new Date(),
        consultationId: 'C1003',
        type: 'consultation',
      },
    ];
    return notes.slice(0, limit);
  }

  /**
   * Obtiene datos clínicos completos del paciente en un formato estandarizado
   * @param patientId ID del paciente
   */
  async getCompleteEMRData(patientId: string): Promise<CompleteEMRData> {
    // Para la implementación genérica, recopilamos datos de otros métodos
    const patientData = await this.getPatientData(patientId);
    const consultations = await this.getConsultations(patientId);
    const notes = await this.getUnstructuredNotes(patientId);

    // Crear formato estandarizado para IA
    return {
      patientId,
      demographics: {
        name: `${patientData.firstName} ${patientData.lastName}`,
        age: this.calculateAge(patientData.dateOfBirth),
        sex:
          patientData.gender === 'male'
            ? 'male'
            : patientData.gender === 'female'
              ? 'female'
              : 'other',
        dob: patientData.dateOfBirth,
      },
      medicalHistory: {
        conditions: [
          {
            name: 'Hipertensión',
            diagnosisDate: '2020-03-15',
            status: 'active',
          },
          {
            name: 'Diabetes tipo 2',
            diagnosisDate: '2021-05-10',
            status: 'active',
          },
          {
            name: 'Obesidad',
            diagnosisDate: '2019-07-22',
            status: 'active',
          },
        ],
        allergies: ['Penicilina', 'Sulfamidas'],
        medications: [
          {
            name: 'Metformina',
            dosage: '850mg',
            frequency: 'BID',
            startDate: '2021-05-10',
            active: true,
          },
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'QD',
            startDate: '2020-03-15',
            active: true,
          },
        ],
        procedures: [
          {
            name: 'Colonoscopía',
            date: '2022-11-15',
            provider: 'Dr. García',
            notes: 'Sin hallazgos significativos',
          },
        ],
        labResults: [
          {
            name: 'Glucosa en ayunas',
            date: '2023-01-15',
            value: '126',
            unit: 'mg/dL',
            normalRange: '70-100',
            isAbnormal: true,
          },
          {
            name: 'HbA1c',
            date: '2023-01-15',
            value: '7.2',
            unit: '%',
            normalRange: '4.0-5.6',
            isAbnormal: true,
          },
          {
            name: 'Colesterol total',
            date: '2023-01-15',
            value: '210',
            unit: 'mg/dL',
            normalRange: '<200',
            isAbnormal: true,
          },
        ],
      },
      vitalSigns: [
        {
          date: '2023-08-20',
          bloodPressure: '138/85',
          heartRate: 78,
          respiratoryRate: 16,
          temperature: 36.7,
          oxygenSaturation: 98,
        },
        {
          date: '2023-06-15',
          bloodPressure: '142/88',
          heartRate: 82,
          respiratoryRate: 18,
          temperature: 36.5,
          oxygenSaturation: 97,
        },
      ],
      consultations,
      unstructuredNotes: notes,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Calcula la edad basada en la fecha de nacimiento
   * @param dob Fecha de nacimiento (YYYY-MM-DD)
   * @returns Edad calculada
   */
  protected calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Inicializa el adaptador con opciones de configuración
   * @param options Opciones de inicialización
   */
  async initialize(options?: EMRAdapterConfig): Promise<void> {
    if (options) {
      this.config = { ...this.config, ...options };
    }
  }

  /**
   * Nombre del adaptador
   */
  get name(): string {
    return 'GenericEMR';
  }

  /**
   * Descripción del adaptador
   */
  get description(): string {
    return 'Adaptador genérico para propósitos de demostración';
  }

  /**
   * Obtiene el historial médico completo de un paciente
   * @param patientId Identificador del paciente
   * @param options Opciones para filtrar el historial
   * @returns Promise con el historial médico del paciente
   */
  async getPatientHistory(
    patientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Simulación para propósitos de demo
    return {
      patientId,
      consultations: await this.getConsultations(patientId),
      treatments: [],
      labResults: [],
      diagnoses: []
    };
  }

  /**
   * Guarda una nueva consulta médica
   * @param consultation Datos de la consulta a guardar
   * @returns Promise con el ID de la consulta guardada
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async saveConsultation(_consultation: Record<string, unknown>): Promise<string> {
    // Simulación para propósitos de demo
    return 'C' + Math.floor(Math.random() * 10000);
  }

  /**
   * Actualiza una consulta médica existente
   * @param consultationId ID de la consulta a actualizar
   * @param updates Datos a actualizar
   * @returns Promise que resuelve a true si la actualización fue exitosa
   */
  async updateConsultation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _consultationId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _updates: Record<string, unknown>
  ): Promise<boolean> {
    // Simulación para propósitos de demo
    return true;
  }

  /**
   * Registra un nuevo tratamiento médico
   * @param treatment Datos del tratamiento a registrar
   * @returns Promise con el ID del tratamiento registrado
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerTreatment(_treatment: Record<string, unknown>): Promise<string> {
    // Simulación para propósitos de demo
    return 'T' + Math.floor(Math.random() * 10000);
  }

  /**
   * Obtiene métricas específicas del paciente
   * @param patientId Identificador del paciente
   * @param metricTypes Tipos de métricas a obtener
   * @returns Promise con las métricas del paciente
   */
  async getPatientMetrics(
    patientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metricTypes: string[]
  ): Promise<Record<string, unknown>> {
    // Simulación para propósitos de demo
    return {
      patientId,
      weight: [],
      height: [],
      bloodPressure: [],
      glucose: [],
      cholesterol: []
    };
  }
}
