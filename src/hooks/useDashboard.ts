import { useState, useEffect } from 'react';
import { DashboardMetrics } from '@/types/dashboard';
import { getDashboardMetrics } from '@/services/dashboard';

export const useDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, isLoading, error };
}; 