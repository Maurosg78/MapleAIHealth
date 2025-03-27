import { DashboardMetrics } from '@/types/dashboard';

// Datos de ejemplo para el desarrollo
const mockMetrics: DashboardMetrics = {
  totalPatients: 0,
  activePatients: 0,
  pendingAppointments: 0,
  recentActivities: [],
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // TODO: Implementar llamada a API real
  return mockMetrics;
}; 