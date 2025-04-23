import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { CacheMetrics, Recommendation, CacheAnalytics } from '../services/cache/utils/CacheAnalytics';
import { AIHealthService } from '../services/AIHealthService';
import type { CacheStats as AnalyticsCacheStats } from '../services/cache/utils/CacheAnalytics';

interface CacheMonitorProps {
  updateInterval?: number;
}

const CacheMonitor: React.FC<CacheMonitorProps> = ({ updateInterval = 5000 }) => {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async (): Promise<void> => {
    try {
      const service = AIHealthService.getInstance();
      const rawStats = service.getCacheStats();
      const analytics = CacheAnalytics.getInstance();
      const analyticsStats: AnalyticsCacheStats = {
        hitRatio: rawStats.hitRate ?? 0,
        size: rawStats.size,
        maxSize: rawStats.currentSize ?? rawStats.size,
        accessTime: rawStats.avgAccessTime,
        memoryUsage: rawStats.currentSize ?? rawStats.size
      };
      const metrics = analytics.analyzeCache('general', analyticsStats, {
        maxSize: rawStats.currentSize ?? rawStats.size,
        ttlMs: 3600000 // 1 hora por defecto
      });
      setMetrics(metrics);
    } catch (error) {
      console.error('Error al obtener métricas de caché:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, updateInterval);
    return (): void => clearInterval(interval);
  }, [updateInterval]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <Typography>Cargando métricas...</Typography>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box p={2}>
        <Typography color="error">
          Error al cargar las métricas de caché
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Estadísticas de Caché
      </Typography>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
        <Box>
          <Typography variant="subtitle2">Ratio de Aciertos</Typography>
          <Typography>{(metrics.hitRatio * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Ratio de Fallos</Typography>
          <Typography>{(metrics.missRatio * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Tasa de Evicción</Typography>
          <Typography>{metrics.evictionRate.toFixed(3)}/s</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Tiempo Promedio de Acceso</Typography>
          <Typography>{metrics.avgAccessTime.toFixed(2)}ms</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Tamaño Promedio de Entrada</Typography>
          <Typography>{metrics.avgEntrySize.toFixed(2)} bytes</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Uso de Memoria</Typography>
          <Typography>{metrics.memoryUsageMB.toFixed(2)} MB</Typography>
        </Box>
      </Box>

      {metrics.recommendedOptimizations.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Recomendaciones de Optimización
          </Typography>
          {metrics.recommendedOptimizations.map((rec: Recommendation, index: number) => (
            <Box key={index} mb={1}>
              <Typography variant="subtitle2" color={rec.impact === 'high' ? 'error' : 'primary'}>
                {rec.message}
              </Typography>
              <Typography variant="body2">
                Valor actual: {rec.currentValue}, Recomendado: {rec.recommendedValue}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CacheMonitor;