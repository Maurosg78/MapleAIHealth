import { Patient, PatientVisit, PatientSummary, PatientBasicInfo } from '../models/Patient';;;;;

/**
 * Servicio para gestionar pacientes
 */
class PatientService {
  private static instance: PatientService;
  
  // Estos datos simulados serán reemplazados por llamadas a la API
  private mockPatients: Patient[] = [
    {
      id: 'patient1',
      firstName: 'María',
      lastName: 'García',
      dateOfBirth: '1978-05-15',
      age: 45,
      gender: 'female',
      identificationNumber: '12345678-9',
      email: 'maria.garcia@example.com',
      phone: '+56912345678',
      medicalRecordNumber: 'MRN123456',
      active: true,
      createdAt: '2023-01-10T14:30:00Z',
      updatedAt: '2023-03-15T09:45:00Z'
    },
    {
      id: 'patient2',
      firstName: 'Juan',
      lastName: 'Pérez',
      dateOfBirth: '1970-08-22',
      age: 53,
      gender: 'male',
      identificationNumber: '87654321-1',
      email: 'juan.perez@example.com',
      phone: '+56987654321',
      medicalRecordNumber: 'MRN654321',
      active: true,
      createdAt: '2023-01-12T10:15:00Z',
      updatedAt: '2023-02-28T16:20:00Z'
    },
    {
      id: 'patient3',
      firstName: 'Laura',
      lastName: 'Martínez',
      dateOfBirth: '1985-11-30',
      age: 38,
      gender: 'female',
      identificationNumber: '23456789-0',
      email: 'laura.martinez@example.com',
      phone: '+56945678123',
      medicalRecordNumber: 'MRN789123',
      active: false,
      createdAt: '2023-01-15T09:00:00Z',
      updatedAt: '2023-03-10T11:30:00Z'
    }
  ];

  private mockVisits: PatientVisit[] = [
    {
      id: 'visit1',
      patientId: 'patient1',
      visitDate: '2023-02-14T10:00:00Z',
      visitType: 'follow-up',
      clinicianId: 'clinician1',
      specialty: 'physiotherapy',
      status: 'completed',
      duration: 45,
      createdAt: '2023-02-10T14:30:00Z',
      updatedAt: '2023-02-14T11:00:00Z'
    },
    {
      id: 'visit2',
      patientId: 'patient2',
      visitDate: '2023-02-10T11:30:00Z',
      visitType: 'follow-up',
      clinicianId: 'clinician2',
      specialty: 'physiotherapy',
      status: 'completed',
      duration: 60,
      createdAt: '2023-02-05T09:15:00Z',
      updatedAt: '2023-02-10T12:45:00Z'
    },
    {
      id: 'visit3',
      patientId: 'patient3',
      visitDate: '2023-02-14T15:00:00Z',
      visitType: 'evaluation',
      clinicianId: 'clinician1',
      specialty: 'physiotherapy',
      status: 'completed',
      duration: 90,
      createdAt: '2023-02-10T10:00:00Z',
      updatedAt: '2023-02-14T16:45:00Z'
    }
  ];

  private constructor() {
    // Constructor privado para Singleton
  }

  /**
   * Obtener la instancia única del servicio
   */
  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  /**
   * Obtener lista de pacientes
   */
  public async getPatients(): Promise<PatientSummary[]> {
    // Simulando una llamada asíncrona a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        const patientSummaries = this.mockPatients.map(patient => {
          // Calcular edad basado en la fecha de nacimiento
          const birthDate = new Date(patient.dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          // Obtener última visita
          const patientVisits = this.mockVisits.filter(visit => visit.patientId === patient.id);
          const lastVisit = patientVisits.length > 0 ? 
            patientVisits.sort((a, b) => 
              new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
            )[0].visitDate : undefined;

          return {
            id: patient.id,
            name: `${patient.firstName} ${patient.lastName}`,
            age: patient.age || age,
            gender: patient.gender,
            diagnosis: 'Pending', // En una implementación real, se obtendría del historial médico
            lastVisit,
            status: patient.active ? 'active' : 'on-hold'
          } as PatientSummary;
        });

        resolve(patientSummaries);
      }, 200); // Simulando latencia de red
    });
  }

  /**
   * Obtener un paciente por ID
   */
  public async getPatientById(id: string): Promise<Patient | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = this.mockPatients.find(p => p.id === id) || null;
        resolve(patient);
      }, 100);
    });
  }

  /**
   * Obtener información básica de un paciente
   */
  public async getPatientBasicInfo(id: string): Promise<PatientBasicInfo | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = this.mockPatients.find(p => p.id === id);
        if (!patient) {
          resolve(null);
          return;
        }

        const basicInfo: PatientBasicInfo = {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender
        };

        resolve(basicInfo);
      }, 100);
    });
  }

  /**
   * Obtener visitas de un paciente
   */
  public async getPatientVisits(patientId: string): Promise<PatientVisit[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visits = this.mockVisits.filter(visit => visit.patientId === patientId);
        resolve(visits);
      }, 150);
    });
  }

  /**
   * Crear un nuevo paciente
   */
  public async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString();
        const newPatient: Patient = {
          ...patientData,
          id: `patient${this.mockPatients.length + 1}`,
          createdAt: now,
          updatedAt: now
        };

        this.mockPatients.push(newPatient);
        resolve(newPatient);
      }, 200);
    });
  }

  /**
   * Actualizar un paciente existente
   */
  public async updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patientIndex = this.mockPatients.findIndex(p => p.id === id);
        if (patientIndex === -1) {
          resolve(null);
          return;
        }

        const updatedPatient: Patient = {
          ...this.mockPatients[patientIndex],
          ...patientData,
          updatedAt: new Date().toISOString()
        };

        this.mockPatients[patientIndex] = updatedPatient;
        resolve(updatedPatient);
      }, 200);
    });
  }

  /**
   * Programar una nueva visita
   */
  public async scheduleVisit(visitData: Omit<PatientVisit, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientVisit> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString();
        const newVisit: PatientVisit = {
          ...visitData,
          id: `visit${this.mockVisits.length + 1}`,
          createdAt: now,
          updatedAt: now
        };

        this.mockVisits.push(newVisit);
        resolve(newVisit);
      }, 200);
    });
  }

  /**
   * Buscar pacientes con filtros avanzados
   * @param filters Opciones de filtrado para la búsqueda
   */
  public async searchPatientsAdvanced(filters: {
    query?: string;               // Buscar en nombre, email, teléfono
    gender?: string;              // Filtrar por género
    ageMin?: number;              // Edad mínima
    ageMax?: number;              // Edad máxima
    lastVisitAfter?: string;      // Visitas posteriores a esta fecha
    lastVisitBefore?: string;     // Visitas anteriores a esta fecha
    orderBy?: 'name' | 'age' | 'lastVisit';  // Campo para ordenar
    orderDirection?: 'asc' | 'desc';         // Dirección de ordenamiento
    limit?: number;               // Límite de resultados
  }): Promise<PatientSummary[]> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Obtener todos los pacientes
        const allPatients = await this.getPatients();
        
        // Aplicar filtros
        let filteredPatients = allPatients;

        // Filtro por texto
        if (filters.query) {
          const query = filters.query.toLowerCase();
          filteredPatients = filteredPatients.filter(patient => 
            patient.name.toLowerCase().includes(query) ||
            patient.id.toLowerCase().includes(query)
          );
        }

        // Filtro por género
        if (filters.gender) {
          filteredPatients = filteredPatients.filter(patient => 
            patient.gender === filters.gender
          );
        }

        // Filtro por edad
        if (filters.ageMin !== undefined) {
          filteredPatients = filteredPatients.filter(patient => 
            patient.age >= filters.ageMin ?? undefined
          );
        }

        if (filters.ageMax !== undefined) {
          filteredPatients = filteredPatients.filter(patient => 
            patient.age <= filters.ageMax ?? undefined
          );
        }

        // Filtro por fecha de última visita
        if (filters.lastVisitAfter) {
          const afterDate = new Date(filters.lastVisitAfter);
          filteredPatients = filteredPatients.filter(patient => 
            patient.lastVisit ? new Date(patient.lastVisit) >= afterDate : false
          );
        }

        if (filters.lastVisitBefore) {
          const beforeDate = new Date(filters.lastVisitBefore);
          filteredPatients = filteredPatients.filter(patient => 
            patient.lastVisit ? new Date(patient.lastVisit) <= beforeDate : false
          );
        }

        // Ordenamiento
        if (filters.orderBy) {
          const direction = filters.orderDirection === 'desc' ? -1 : 1;
          
          filteredPatients.sort((a, b) => {
            switch (filters.orderBy) {
              case 'name':
                return direction * a.name.localeCompare(b.name);
              case 'age':
                return direction * (a.age - b.age);
              case 'lastVisit':
                // Manejar casos donde lastVisit puede ser undefined
                if (!a.lastVisit) return direction;
                if (!b.lastVisit) return -direction;
                return direction * (new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime());
              default:
                return 0;
            }
          });
        }

        // Aplicar límite si se especifica
        if (filters.limit && filters.limit > 0) {
          filteredPatients = filteredPatients.slice(0, filters.limit);
        }

        resolve(filteredPatients);
      }, 300); // Simulando latencia
    });
  }

  /**
   * Buscar pacientes por nombre
   */
  public async searchPatients(query: string): Promise<PatientSummary[]> {
    return this.searchPatientsAdvanced({ query });
  }
}

export default PatientService; 