import React, { useState, useEffect } from 'react';
import { ClinicalDashboardData } from '../../types/dashboard';
import { dashboardService } from '../../services/dashboard';
import EvidenceSummaryCard from './EvidenceSummaryCard';
import RecentEvaluationsCard from './RecentEvaluationsCard';
import TopMedicalTopicsCard from './TopMedicalTopicsCard';
import SourceVerificationsCard from './SourceVerificationsCard';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

/**
 * Dashboard de Información Clínica
 * Muestra información relacionada con la evaluación de evidencia clínica
 */
const ClinicalDashboard: React.FC = () => {
  const [data, setData] = useState<ClinicalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clinicalData = await dashboardService.getClinicalDashboardData();
        setData(clinicalData);
      } catch (err) {
        console.error('Error al cargar datos del dashboard clínico', err);
        setError('No se pudieron cargar los datos clínicos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-800">Error</h3>
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-4">
        <p className="text-gray-500">No hay datos disponibles</p>
      </Card>
    );
  }

  return (
    <div className="clinical-dashboard space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard de Información Clínica</h2>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EvidenceSummaryCard summary={data.evidenceSummary} />
        <SourceVerificationsCard stats={data.sourceVerifications} />
      </div>

      {/* Evaluaciones recientes */}
      <RecentEvaluationsCard evaluations={data.recentEvaluations} />

      {/* Temas médicos principales */}
      <TopMedicalTopicsCard topics={data.topMedicalTopics} />
    </div>
  );
};

export default ClinicalDashboard;
