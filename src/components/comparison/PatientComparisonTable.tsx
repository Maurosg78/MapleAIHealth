import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box, 
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Collapse
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  TrendingFlat as TrendingFlatIcon,
  InfoOutlined as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { PatientProgressData } from './PatientComparisonChart';

interface MetricSummary {
  initial: number;
  final: number;
  change: number;
  percentChange: number;
  trend: 'up' | 'down' | 'flat';
  sessions: number;
  lastChange: number;
}

export interface ComparisonMetric {
  id: string;
  name: string;
  unit: string;
  desiredTrend: 'up' | 'down'; // Indica si es mejor que suba o que baje
  normalRange?: [number, number];
  targetValue?: number;
}

interface CalculatedData {
  [metricId: string]: MetricSummary;
}

interface PatientData {
  patient: PatientProgressData;
  metrics: CalculatedData;
  averageImprovement: number;
  sessionCount: number;
  treatmentDuration: number; // en días
  color: string;
}

interface PatientComparisonTableProps {
  patients: PatientProgressData[];
  metrics: ComparisonMetric[];
  metricData: {
    [patientId: string]: {
      [metricId: string]: { date: string; value: number }[];
    };
  };
}

export const PatientComparisonTable: React.FC<PatientComparisonTableProps> = ({
  patients,
  metrics,
  metricData
}) => {
  const theme = useTheme();
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  
  // Colores para los pacientes
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042'
  ];

  // Calcular todos los datos de los pacientes
  const patientsData: PatientData[] = useMemo(() => {
    return patients.map((patient, index) => {
      const patientMetrics: CalculatedData = {};
      let totalImprovement = 0;
      let metricCount = 0;
      let maxSessions = 0;
      
      // Para cada métrica, calculamos los datos
      metrics.forEach(metric => {
        const metricValues = metricData[patient.patientId]?.[metric.id] || [];
        
        if (metricValues.length >= 2) {
          const initial = metricValues[0].value;
          const final = metricValues[metricValues.length - 1].value;
          const change = final - initial;
          const percentChange = (change / Math.abs(initial)) * 100;
          
          // Determinar la tendencia en base a si el cambio es positivo y qué es deseable
          let trend: 'up' | 'down' | 'flat';
          if (Math.abs(percentChange) < 1) {
            trend = 'flat';
          } else if ((change > 0 && metric.desiredTrend === 'up') || 
                     (change < 0 && metric.desiredTrend === 'down')) {
            trend = 'up'; // Mejora (positiva)
            totalImprovement += Math.abs(percentChange);
          } else {
            trend = 'down'; // Empeoramiento
            totalImprovement -= Math.abs(percentChange);
          }
          
          metricCount++;
          maxSessions = Math.max(maxSessions, metricValues.length);
          
          // Últimos cambios
          const lastChange = metricValues.length > 1 
            ? metricValues[metricValues.length - 1].value - metricValues[metricValues.length - 2].value 
            : 0;
          
          patientMetrics[metric.id] = {
            initial,
            final,
            change,
            percentChange,
            trend,
            sessions: metricValues.length,
            lastChange
          };
        }
      });
      
      // Calcular duración del tratamiento
      const allDates = Object.values(metricData[patient.patientId] || {})
        .flatMap(values => values.map(v => new Date(v.date).getTime()));
      
      const minDate = Math.min(...allDates);
      const maxDate = Math.max(...allDates);
      const treatmentDuration = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 0;
      
      return {
        patient,
        metrics: patientMetrics,
        averageImprovement: metricCount > 0 ? totalImprovement / metricCount : 0,
        sessionCount: maxSessions,
        treatmentDuration,
        color: patient.color || defaultColors[index % defaultColors.length]
      };
    });
  }, [patients, metrics, metricData]);

  // Ordenar pacientes por mejora promedio
  const sortedPatients = [...patientsData].sort((a, b) => b.averageImprovement - a.averageImprovement);

  const getTrendIcon = (trend: 'up' | 'down' | 'flat', desiredTrend: 'up' | 'down') => {
    const isPositive = 
      (trend === 'up' && desiredTrend === 'up') || 
      (trend === 'down' && desiredTrend === 'down');
    
    const isNeutral = trend === 'flat';
    
    const color = isPositive 
      ? theme.palette.success.main 
      : isNeutral 
        ? theme.palette.grey[500] 
        : theme.palette.error.main;
    
    if (trend === 'up') return <TrendingUpIcon sx={{ color }} />;
    if (trend === 'down') return <TrendingDownIcon sx={{ color }} />;
    return <TrendingFlatIcon sx={{ color }} />;
  };

  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };

  const formatPercent = (value: number) => {
    const formatted = value.toFixed(1);
    return value > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const getStatusChip = (percentChange: number) => {
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    let label = 'Sin cambios';
    
    if (percentChange > 15) {
      color = 'success';
      label = 'Mejora significativa';
    } else if (percentChange > 5) {
      color = 'success';
      label = 'Mejora moderada';
    } else if (percentChange > 0) {
      color = 'success';
      label = 'Mejora leve';
    } else if (percentChange < -15) {
      color = 'error';
      label = 'Deterioro significativo';
    } else if (percentChange < -5) {
      color = 'error';
      label = 'Deterioro moderado';
    } else if (percentChange < 0) {
      color = 'error';
      label = 'Deterioro leve';
    }
    
    return <Chip size="small" color={color} label={label} />;
  };

  const toggleExpand = (patientId: string) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Comparativa de Evolución de Pacientes
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell>Paciente</TableCell>
              <TableCell align="center">Diagnóstico</TableCell>
              <TableCell align="center">Edad</TableCell>
              <TableCell align="center">Sesiones</TableCell>
              <TableCell align="center">Duración (días)</TableCell>
              <TableCell align="center">Mejora Promedio</TableCell>
              <TableCell align="center">Detalles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPatients.map((patientData) => (
              <React.Fragment key={patientData.patient.patientId}>
                <TableRow 
                  sx={{ 
                    '&:hover': { backgroundColor: alpha(patientData.color, 0.1) },
                    borderLeft: `4px solid ${patientData.color}`
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {patientData.patient.patientName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{patientData.patient.diagnosis}</TableCell>
                  <TableCell align="center">{patientData.patient.age}</TableCell>
                  <TableCell align="center">{patientData.sessionCount}</TableCell>
                  <TableCell align="center">{patientData.treatmentDuration}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {patientData.averageImprovement > 0 
                        ? <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                        : patientData.averageImprovement < 0 
                          ? <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                          : <TrendingFlatIcon sx={{ mr: 0.5, color: theme.palette.grey[500] }} />
                      }
                      <Typography 
                        color={
                          patientData.averageImprovement > 0 
                            ? 'success.main' 
                            : patientData.averageImprovement < 0 
                              ? 'error.main' 
                              : 'text.secondary'
                        }
                      >
                        {formatPercent(patientData.averageImprovement)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => toggleExpand(patientData.patient.patientId)}
                    >
                      {expandedPatient === patientData.patient.patientId 
                        ? <ExpandLessIcon /> 
                        : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    colSpan={7} 
                    sx={{ 
                      p: 0, 
                      borderBottom: expandedPatient === patientData.patient.patientId ? '1px solid' : 'none',
                      borderBottomColor: theme.palette.divider
                    }}
                  >
                    <Collapse 
                      in={expandedPatient === patientData.patient.patientId} 
                      timeout="auto" 
                      unmountOnExit
                    >
                      <Box sx={{ p: 2, backgroundColor: alpha(patientData.color, 0.05) }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Detalle por métricas
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {metrics.map(metric => {
                            const metricData = patientData.metrics[metric.id];
                            if (!metricData) return null;
                            
                            return (
                              <Box key={metric.id} sx={{ width: { xs: '100%', sm: '47%', md: '31%' } }}>
                                <Paper sx={{ p: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    {metric.name} ({metric.unit})
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption">
                                      Inicial: {formatValue(metricData.initial, metric.unit)}
                                    </Typography>
                                    <Typography variant="caption">
                                      Final: {formatValue(metricData.final, metric.unit)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                      Cambio: {formatValue(metricData.change, metric.unit)} ({formatPercent(metricData.percentChange)})
                                    </Typography>
                                    {getTrendIcon(metricData.trend, metric.desiredTrend)}
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {getStatusChip(metricData.percentChange)}
                                    <Tooltip title={`Normal: ${metric.normalRange?.[0] || '?'}-${metric.normalRange?.[1] || '?'} ${metric.unit}`}>
                                      <IconButton size="small">
                                        <InfoIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Paper>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 