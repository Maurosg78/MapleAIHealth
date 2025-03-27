import { useDashboard } from '@/hooks/useDashboard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { metrics, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Link to="/patients/new">
          <Button>Nuevo Paciente</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total de Pacientes"
          value={metrics?.totalPatients || 0}
          icon={
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          description="Pacientes registrados en el sistema"
        />
        <MetricCard
          title="Pacientes Activos"
          value={metrics?.activePatients || 0}
          icon={
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          description="Pacientes con tratamientos en curso"
        />
        <MetricCard
          title="Citas Pendientes"
          value={metrics?.pendingAppointments || 0}
          icon={
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          description="Próximas citas programadas"
        />
      </div>

      <div className="mt-8">
        <RecentActivities activities={metrics?.recentActivities || []} />
      </div>
    </div>
  );
}; 