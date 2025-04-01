import { api } from '../lib/api';
import { Appointment, AppointmentFilters, AppointmentListResponse } from '../types/appointment';

class AppointmentService {
    async getAppointments(filters: AppointmentFilters = {}): Promise<AppointmentListResponse> {
        try {
            const response = await api.get('/appointments', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }

    async getAppointment(id: string): Promise<Appointment> {
        try {
            const response = await api.get(`/appointments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment:', error);
            throw error;
        }
    }

    async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
        try {
            const response = await api.post('/appointments', appointment);
            return response.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
        try {
            const response = await api.put(`/appointments/${id}`, appointment);
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

    async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
        try {
            const response = await api.patch(`/appointments/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating appointment status:', error);
            throw error;
        }
    }
}

export const appointmentService = new AppointmentService();
