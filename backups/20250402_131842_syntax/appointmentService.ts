import {
  Appointment,
import { HttpService } from "../../../lib/api";  AppointmentFilters,
  AppointmentListResponse,
} from '../types/appointment';

class AppointmentService {
  async getAppointments(
    filters: AppointmentFilters = {}
  ): Promise<AppointmentListResponse> {
    try {

      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getAppointment(id: string): Promise<Appointment> {
    try {

      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  }

  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Appointment> {
    try {

      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(
    id: string,
    appointment: Partial<Appointment>
  ): Promise<Appointment> {
    try {

      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(
    id: string,
    status: Appointment['status']
  ): Promise<Appointment> {
    try {
      const response = await api.patch(`/appointments/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
}

export
