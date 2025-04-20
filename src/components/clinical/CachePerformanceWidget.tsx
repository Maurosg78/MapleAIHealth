import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Chip,
  Button,
  Tooltip as MuiTooltip
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { ClinicalDashboardService } from '../../services/clinicalDashboard';
import { CacheStats } from '../../services/cache/types';

// Interfaz mejorada para estadísticas de caché con todas las propiedades necesarias
interface EnhancedCacheStats extends CacheStats {
  hitRatio: number;
  averageAccessCount: number;
  topKeys: Array<{ key: string; accessCount: number }>;
  memoryUsageMB?: number;
}

interface CachePerformanceWidgetProps {
  refreshInterval?: number; // en ms
  showActions?: boolean;
  height?: string | number;
}

const CachePerformanceWidget: React.FC<CachePerformanceWidgetProps> = ({ 
  refreshInterval = 30000, // 30 segundos por defecto
  showActions = true,
  height = 'auto'
}) => {
  const [stats, setStats] = useState<EnhancedCacheStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Histórico de estadísticas para gráfico de tendencia
  const [historyStats, setHistoryStats] = useState<Array<{
    timestamp: number;
    hitRatio: number;
    size: number;
    memory?: number;
  }>>([]);
  
  // Colores para los gráficos
  const colors = ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0'];
  
  // Servicios
  const dashboardService = new ClinicalDashboardService();
  
  // Cargar estadísticas iniciales y configurar actualización periódica
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Obtener estadísticas mejoradas de caché
        const currentStats = dashboardService.getCacheStats() as EnhancedCacheStats;
        
        setStats(currentStats);
        
        // Actualizar historial de estadísticas (mantener últimas 10)
        setHistoryStats(prev => {
          const newHistory = [...prev, {
            timestamp: Date.now(),
            hitRatio: currentStats.hitRatio,
            size: currentStats.size,
            memory: currentStats.memoryUsageMB
          }];
          
          // Mantener solo las últimas 10 muestras
          return newHistory.slice(-10);
        });
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar estadísticas de caché:', err);
        setError('Error al cargar estadísticas de caché');
      } finally {
        setLoading(false);
      }
    };
    
    // Cargar datos iniciales
    fetchStats();
    
    // Configurar actualización periódica
    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [dashboardService, refreshInterval]);
  
  // Preparar datos para gráfico de rendimiento
  const preparePerformanceData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Aciertos', value: stats.hits },
      { name: 'Fallos', value: stats.misses }
    ];
  };
  
  // Preparar datos para gráfico de claves más usadas
  const prepareTopKeysData = () => {
    if (!stats || !stats.topKeys) return [];
    
    return stats.topKeys.map(item => ({
      name: item.key.substring(0, 20) + (item.key.length > 20 ? '...' : ''),
      value: item.accessCount
    }));
  };
  
  // Preparar datos históricos para gráfico de tendencia
  const prepareTrendData = () => {
    return historyStats.map((item, index) => ({
      name: index,
      hitRatio: Number((item.hitRatio * 100).toFixed(1)),
      size: item.size,
      memory: item.memory !== undefined ? Number(item.memory.toFixed(2)) : 0
    }));
  };
  
  // Manejar acción de limpiar caché
  const handleClearCache = () => {
    setLoading(true);
    
    try {
      // Limpiar caché del dashboard clínico
      dashboardService.invalidateCache();
      
      // Actualizar estadísticas
      setTimeout(() => {
        const currentStats = dashboardService.getCacheStats() as EnhancedCacheStats;
        setStats(currentStats);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error al limpiar caché:', err);
      setError('Error al limpiar la caché');
      setLoading(false);
    }
  };
  
  // Si está cargando y no hay datos previos
  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Cargando estadísticas...
        </Typography>
      </Box>
    );
  }
  
  // Si hay un error
  if (error) {
    return (
      <Box p={3}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }
  
  // Si no hay estadísticas
  if (!stats) {
    return (
      <Box p={3}>
        <Typography variant="body2">
          No hay estadísticas disponibles.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, height: height }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">
          Rendimiento de Caché
        </Typography>
        
        {showActions && (
          <Button 
            size="small" 
            variant="outlined" 
            color="primary" 
            onClick={handleClearCache}
            disabled={loading}
          >
            Limpiar caché
          </Button>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Indicadores clave */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
          <MuiTooltip title="Porcentaje de solicitudes que se resolvieron desde la caché">
            <Box>
              <Typography variant="body2" color="text.secondary">Tasa de aciertos</Typography>
              <Typography variant="h5">
                {(stats.hitRatio * 100).toFixed(1)}%
              </Typography>
            </Box>
          </MuiTooltip>
        </Box>
        
        <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
          <MuiTooltip title="Número de entradas en la caché">
            <Box>
              <Typography variant="body2" color="text.secondary">Entradas en caché</Typography>
              <Typography variant="h5">
                {stats.size}
              </Typography>
            </Box>
          </MuiTooltip>
        </Box>
        
        <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
          <MuiTooltip title="Memoria estimada utilizada por la caché">
            <Box>
              <Typography variant="body2" color="text.secondary">Memoria utilizada</Typography>
              <Typography variant="h5">
                {stats.memoryUsageMB !== undefined ? `${stats.memoryUsageMB.toFixed(2)} MB` : 'N/A'}
              </Typography>
            </Box>
          </MuiTooltip>
        </Box>
        
        <Box sx={{ width: { xs: '50%', md: '25%' }, p: 1 }}>
          <MuiTooltip title="Promedio de veces que se accede a una entrada">
            <Box>
              <Typography variant="body2" color="text.secondary">Accesos promedio</Typography>
              <Typography variant="h5">
                {stats.averageAccessCount.toFixed(1)}
              </Typography>
            </Box>
          </MuiTooltip>
        </Box>
      </Box>
      
      {/* Gráfico de rendimiento */}
      <Typography variant="subtitle2" gutterBottom>Distribución de peticiones</Typography>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={preparePerformanceData()}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {preparePerformanceData().map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Claves más usadas */}
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Claves más accedidas</Typography>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={prepareTopKeysData()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Bar dataKey="value" fill="#8884d8" name="Accesos" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Gráfico de tendencia */}
      {historyStats.length > 1 && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Tendencia de rendimiento</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={prepareTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <RechartsTooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="hitRatio" 
                stroke="#8884d8" 
                name="Tasa de aciertos (%)" 
                activeDot={{ r: 8 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="size" 
                stroke="#82ca9d" 
                name="Tamaño de caché" 
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
      
      {/* Última actualización */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Última limpieza: {new Date(stats.lastCleared).toLocaleString()}
        </Typography>
        <Chip 
          label={loading ? 'Actualizando...' : 'En vivo'} 
          color={loading ? 'default' : 'success'} 
          size="small" 
        />
      </Box>
    </Paper>
  );
};

export default CachePerformanceWidget; 