import React, { useState, useEffect, useMemo } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Tab, Tabs, Button, useTheme, useMediaQuery } from '@mui/material';;;;;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';;;;;
import { ClinicalDashboardService } from '../../services/clinicalDashboard';;;;;
import { ClinicalDashboardData, ClinicalDashboardFilters } from '../../types/clinicalDashboard';;;;;
import CachePerformanceWidget from './CachePerformanceWidget';

// Componente funcional principal
const ClinicalDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estado del dashboard
  const [dashboardData, setDashboardData] = useState<ClinicalDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [filters, setFilters] = useState<ClinicalDashboardFilters>({});
  
  // Inicializar servicio
  const dashboardService = useMemo(() => ClinicalDashboardService.getInstance(), []);
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getDashboardData(filters);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Actualizar periódicamente si se configura un intervalo
    const interval = dashboardData?.config?.refreshInterval;
    let refreshTimer: NodeJS.Timeout | null = null;
    
    if (interval && interval > 0) {
      refreshTimer = setInterval(() => {
        fetchDashboardData();
      }, interval);
    }
    
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [dashboardService, filters]);
  
  // Cambiar de tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  // Función para aplicar filtros
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const applyFilters = (newFilters: Partial<ClinicalDashboardFilters>): void => {
    setFilters(current => ({...current, ...newFilters}));
  };
  
  // Si está cargando, mostrar indicador
  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando Dashboard Clínico...
        </Typography>
      </Box>
    );
  }
  
  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" sx={{ ml: 2 }} onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </Box>
    );
  }
  
  // Datos formateados para los gráficos
  const evidenceUsageData = dashboardData?.metrics?.evidenceUsageStats?.byCategory ?
    Object.entries(dashboardData.metrics.evidenceUsageStats.byCategory).map(([name, value]) => ({ name, value })) : [];
  
  // Renderizar contenido del dashboard
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard de Información Clínica
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Vista general del uso y rendimiento de la evidencia clínica
        </Typography>
        
        {/* Tarjetas de resumen */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total de búsquedas</Typography>
            <Typography variant="h3">{dashboardData?.metrics?.evidenceUsageStats?.totalEvidenceCount || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              Últimas 24 horas: +{dashboardData?.metrics?.evidenceUsageStats?.recentlyAccessedCount || 0}
            </Typography>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6">Evidencia utilizada</Typography>
            <Typography variant="h3">{dashboardData?.metrics?.evidenceUsageStats?.totalEvidenceCount || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tasa de uso: {Math.round((dashboardData?.metrics?.cachePerformance?.hitRate || 0) * 100) / 100}%
            </Typography>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6">Rendimiento de caché</Typography>
            <Typography variant="h3">{Math.round(dashboardData?.metrics?.cachePerformance?.hitRate || 0)}%</Typography>
            <Typography variant="body2" color="text.secondary">
              Tiempo medio: {dashboardData?.metrics?.cachePerformance?.avgLoadTime || 0}ms
            </Typography>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6">Evidencia disponible</Typography>
            <Typography variant="h3">{dashboardData?.metrics?.evidenceUsageStats?.totalEvidenceCount || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              Actualizado: {dashboardData?.lastUpdated || 'N/A'}
            </Typography>
          </Paper>
        </Box>
        
        {/* Pestañas para diferentes vistas */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            aria-label="clinical dashboard tabs"
          >
            <Tab label="Uso de Evidencia" />
            <Tab label="Rendimiento" />
            <Tab label="Análisis" />
            <Tab label="Tendencias" />
          </Tabs>
        </Box>
        
        {/* Contenido de las pestañas */}
        {activeTab === 0 && (
          <Box>
            {/* Gráfico de uso de evidencia */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Uso de Evidencia por Categoría</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={evidenceUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
            
            {/* Lista de evidencia reciente */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Evidencia Reciente</Typography>
              <Box>
                {dashboardData?.recentEvidence?.map((evidence) => (
                  <Box key={evidence.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle1">{evidence.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {evidence.date} - {evidence.type}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}
        
        {/* Contenido de la pestaña: Rendimiento */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Rendimiento de Caché</Typography>
                <CachePerformanceWidget height={300} />
              </Paper>
              
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Distribución de Evidencia</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={evidenceUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Box>
          </Box>
        )}
        
        {/* Contenido de la pestaña: Análisis */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="body1">Contenido de Análisis en desarrollo.</Typography>
          </Box>
        )}
        
        {/* Contenido de la pestaña: Tendencias */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="body1">Contenido de Tendencias en desarrollo.</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ClinicalDashboard; 