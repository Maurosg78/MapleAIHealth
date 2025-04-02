import React from 'react';
import { useState, useEffect } from 'react';
export const DashboardPage: React.FC = () => {
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetrics(data);
      } catch (err) {
        setError('Error al cargar las métricas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Total Pacientes</h3>
          <p className="text-2xl font-semibold">
            {metrics?.totalPatients ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Citas Hoy</h3>
          <p className="text-2xl font-semibold">
            {metrics?.appointmentsToday ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Pendientes</h3>
          <p className="text-2xl font-semibold">{metrics?.pendingTasks ?? 0}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Consultas IA</h3>
          <p className="text-2xl font-semibold">{metrics?.aiQueries ?? 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
          {/* Aquí irá el componente de actividad reciente */}
        </Card>

        <AIMedicalWidget />
      </div>
    </div>
  );
};
