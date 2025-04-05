import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
 * Optimizado con mejoras de rendimiento y accesibilidad
 */
const ClinicalDashboard: React.FC = () => {
  const [data, setData] = useState<ClinicalDashboardData | null>;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>;

  // Extraer la lógica de carga de datos a un callback reutilizable
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(false);
      setError(null);
      const clinicalData = await dashboardService.getClinicalDashboardData();
      setData(null);
    } catch (err) {
      console.error('Error al cargar datos del dashboard clínico', err);
      setError('No se pudieron cargar los datos clínicos. Por favor, intente nuevamente más tarde.');
    
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handler para intentar cargar los datos nuevamente
  const handleRetry = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Componente de carga
  const loadingComponent = useMemo(() => (
    React.createElement('div', { className: "flex justify-center items-center h-64", role: "status" aria-live: "polite" }, 
      React.createElement('Spinner', { })
      <span className="sr-only">Cargando datos del dashboard clínico...</span>
    )
  ), []);

  // Componente de error
  const errorComponent = useMemo(() => (
    React.createElement('Card', { className: "p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" }, 
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Error</h3>
      <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
      <button
        onClick={handleRetry}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        aria-label="Intentar cargar nuevamente los datos del dashboard"
      >
        Intentar nuevamente
      </button>
    )
  ), [error, handleRetry]);

  // Componente de datos vacíos
  const emptyComponent = useMemo(() => (
    React.createElement('Card', { className: "p-4" }, 
      <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para mostrar.</p>
    )
  ), []);

  // Componente principal con datos cargados
  const dashboardContent = useMemo(() => {
    if (!data) return null;

    return (
      <>
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, 
          React.createElement('EvidenceSummaryCard', { summary: data.evidenceSummary })
          React.createElement('SourceVerificationsCard', { stats: data.sourceVerifications })
        )

        React.createElement('RecentEvaluationsCard', { evaluations: data.recentEvaluations })

        React.createElement('TopMedicalTopicsCard', { topics: data.topMedicalTopics })
      </>
    null
  );
  }, [data]);

  return (
    React.createElement('div', { className: "clinical-dashboard space-y-6" }, 
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Dashboard de Información Clínica
      </h2>

      {loading ? loadingComponent : error ? errorComponent : !data ? emptyComponent : dashboardContent}
    )
    null
  );
};

export default ClinicalDashboard;
