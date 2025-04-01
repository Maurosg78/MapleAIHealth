export interface DashboardMetrics {
    totalPatients: number;
    activePatients: number;
    pendingAppointments: number;
    recentActivities: Activity[];
    appointmentsToday: number;
    pendingTasks: number;
    aiQueries: number;
}

export interface Activity {
    id: string;
    description: string;
    timestamp: string;
    type: 'appointment' | 'patient' | 'task' | 'ai_query';
}
