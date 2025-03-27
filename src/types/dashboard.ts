export interface DashboardMetrics {
  totalPatients: number;
  activePatients: number;
  pendingAppointments: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'patient_created' | 'appointment_scheduled' | 'assessment_completed';
  description: string;
  timestamp: string;
  patientId?: string;
  patientName?: string;
} 