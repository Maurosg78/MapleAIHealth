
class PatientService {
  private static instance: PatientService;
  private readonly baseUrl = '/patients';

  private constructor() {}

  static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  async getPatients(
    filters: PatientFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PatientListResponse> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          ...filters,
          page,
          pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw new Error('Error al obtener la lista de pacientes');
    }
  }

  async getPatient(id: string): Promise<Patient> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw new Error('Error al obtener los datos del paciente');
    }
  }

  async createPatient(
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Patient> {
    try {
      const response = await api.post(this.baseUrl, patient);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Error al crear el paciente');
    }
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, patient);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Error al actualizar el paciente');
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Error al eliminar el paciente');
    }
  }

  async searchPatients(query: string): Promise<Patient[]> {
    try {
      const response = await api.get(`${this.baseUrl}/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Error al buscar pacientes');
    }
  }
}

export const patientService = PatientService.getInstance();
