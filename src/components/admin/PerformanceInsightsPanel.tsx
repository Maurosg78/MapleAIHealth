import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';;;;;
import { Speed as SpeedIcon, Warning as WarningIcon, CheckCircle as CheckCircleIcon, Refresh as RefreshIcon, ExpandMore as ExpandMoreIcon, Api as ApiIcon, Memory as MemoryIcon, Build as BuildIcon, DataObject as DataObjectIcon } from '@mui/icons-material';;;;;
import { PerformanceMonitor } from '../../services/performance/PerformanceMonitor';;;;;
import { AIHealthService } from '../../services/AIHealthService';;;;;

/**
 * Componente para mostrar información sobre el rendimiento del sistema
 */
export const PerformanceInsightsPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{
    slowestOperations: Array<{ id: string, avgDuration: number, count: number, type: string }>;
    recommendations: string[];
  } | null>(null);

  // Cargar los datos de rendimiento
  const loadPerformanceData = (): void => {
    setLoading(true);
    try {
      // Obtener instancia pero no se usa directamente
      PerformanceMonitor.getInstance();
      const aiService = AIHealthService.getInstance();
      
      // También podemos obtener las recomendaciones específicas para el servicio AIHealth
      const aiServiceInsights = aiService.getPerformanceInsights();
      
      setInsights(aiServiceInsights);
    } catch (error) {
      console.error('Error al cargar datos de rendimiento:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar los datos al montar el componente
  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  // Renderizar un icono según el tipo de operación
  const getOperationIcon = (type: string): void => {
    switch (type) {
      case 'api':
        return <ApiIcon color="primary" />;
      case 'render':
        return <BuildIcon color="secondary" />;
      case 'calculation':
        return <MemoryIcon color="warning" />;
      default:
        return <DataObjectIcon color="action" />;
    }
  };

  // Obtener el color para el chip de duración
  const getDurationColor = (duration: number, type: string): 'success' | 'warning' | 'error' => {
    const config = { 
      api: 500,
      render: 100,
      calculation: 50,
      loading: 300
    };
    
    const threshold = config[type as keyof typeof config] || 100;
    
    if (duration < threshold) {
      return 'success';
    } else if (duration < threshold * 2) {
      return 'warning';
    } else {
      return 'error';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          <SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Insights de Rendimiento
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={loadPerformanceData}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Actualizar'}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && insights && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Panel de operaciones más lentas */}
          <Box sx={{ width: { xs: '100%', md: '50%' }, alignSelf: 'stretch' }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top 5 Operaciones Más Lentas
              </Typography>
              {insights.slowestOperations.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Operación</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Duración Promedio</TableCell>
                        <TableCell align="right">Muestras</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {insights.slowestOperations.map((operation) => (
                        <TableRow key={operation.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getOperationIcon(operation.type)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {operation.id.split('_')[1] || operation.id}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{operation.type}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${operation.avgDuration.toFixed(2)}ms`}
                              size="small"
                              color={getDurationColor(operation.avgDuration, operation.type)}
                            />
                          </TableCell>
                          <TableCell align="right">{operation.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No hay suficientes datos de operaciones para mostrar estadísticas.
                </Alert>
              )}
            </Paper>
          </Box>

          {/* Panel de recomendaciones */}
          <Box sx={{ width: { xs: '100%', md: '50%' }, alignSelf: 'stretch' }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recomendaciones de Optimización
              </Typography>
              {insights.recommendations.length > 0 ? (
                <List>
                  {insights.recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  No se han detectado problemas de rendimiento críticos.
                </Alert>
              )}
            </Paper>
          </Box>

          {/* Panel de detalles avanzados */}
          <Box sx={{ width: '100%' }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Detalles técnicos avanzados</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  El sistema está monitorizando el rendimiento de diferentes operaciones en tiempo real. Las métricas 
                  recolectadas se utilizan para identificar cuellos de botella y generar recomendaciones de optimización.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Umbrales de alerta:</strong>
                </Typography>
                <ul>
                  <li>API Calls: 500ms</li>
                  <li>Renderizado de componentes: 100ms</li>
                  <li>Cálculos complejos: 50ms</li>
                  <li>Tiempo de carga: 300ms</li>
                </ul>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      )}

      {!loading && !insights && (
        <Alert severity="warning">
          No se han podido cargar los datos de rendimiento. Intente actualizar la página.
        </Alert>
      )}
    </Box>
  );
}; 