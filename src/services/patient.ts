import { api } from './api';
import { Patient, PatientFilters, PatientListResponse } from '../types/patient';

class PatientService {
  static async getPatients(
    filters: PatientFilters = {}
  ): Promise<PatientListResponse> {
    try {
      const response = await api.get<PatientListResponse>('/patients', {
        params: filters,
      });
      return response.data;
    } catch {
      throw new Error('Error al obtener la lista de pacientes');
    }
  }

  static async getPatient(id: string): Promise<Patient> {
    try {
      const response = await api.get<Patient>(`/patients/${id}`);
      return response.data;
    } catch {
      throw new Error('Error al obtener los detalles del paciente');
    }
  }

  static async createPatient(
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Patient> {
    try {
      const response = await api.post<Patient>('/patients', patient);
      return response.data;
    } catch {
      throw new Error('Error al crear el paciente');
    }
  }

  static async updatePatient(
    id: string,
    patient: Partial<Patient>
  ): Promise<Patient> {
    try {
      const response = await api.put<Patient>(`/patients/${id}`, patient);
      return response.data;
    } catch {
      throw new Error('Error al actualizar el paciente');
    }
  }

  static async deletePatient(id: string): Promise<void> {
    try {
      await api.delete(`/patients/${id}`);
    } catch {
      throw new Error('Error al eliminar el paciente');
    }
  }
}

export default PatientService;
