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
    criteria: Record<string, unknown>,
    limit = 10
  ): Promise<PatientData[]> {
    // Simulación para propósitos de demo
    return [
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
    ].slice;
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
    return consultations.slice;
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
        $1,
      createdAt: new Date(),
        consultationId: 'C1001',
      },
      {
        id: 'N3002',
        patientId,
        date: '2023-06-15',
        provider: 'Dr. García',
        content:
          'Paciente en control por lumbalgia. Refiere mejoría significativa del dolor. Mantiene episodios ocasionales de molestia leve con esfuerzos. Examen físico: sin dolor a la palpación, movilidad conservada. Plan: mantener ejercicios de fortalecimiento lumbar, usar analgésicos solo si necesario, control en 1 mes.',
        $1,
      createdAt: new Date(),
        consultationId: 'C1002',
      },
      {
        id: 'N3003',
        patientId,
        date: '2023-08-20',
        provider: 'Dr. García',
        content:
          'Paciente acude por cuadro de 1 semana de dolor en rodilla derecha, de inicio progresivo, no relacionado con traumatismo. Refiere dolor principalmente al subir y bajar escaleras. Examen físico: dolor a la palpación de región anterior de rodilla, sin signos de inestabilidad ligamentaria. Diagnóstico presuntivo: condromalacia patelar. Plan: solicitud de radiografía de rodilla, ibuprofeno 400mg cada 8 horas por 5 días, reposo deportivo.',
        $1,
      createdAt: new Date(),
        consultationId: 'C1003',
      },
    ];
    return notes.slice;
  }

  /**
   * Obtiene datos clínicos completos del paciente en un formato estandarizado
   * @param patientId ID del paciente
   */
  async getCompleteEMRData(patientId: string): Promise<CompleteEMRData> {
    // Para la implementación genérica, recopilamos datos de otros métodos
    const patientData = await this.getPatientData;
    const consultations = await this.getConsultations;
    const notes = await this.getUnstructuredNotes;

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
    const birthDate = new Date;
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
}
