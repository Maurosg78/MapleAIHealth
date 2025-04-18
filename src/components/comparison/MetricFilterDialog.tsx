import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Box,
  Slider,
  Chip
} from '@mui/material';
import { ComparisonMetric } from './PatientComparisonTable';

interface MetricFilterDialogProps {
  open: boolean;
  onClose: () => void;
  metrics: ComparisonMetric[];
  onApplyFilters: (filters: MetricFilters) => void;
  initialFilters?: MetricFilters;
}

export interface MetricFilters {
  selectedMetrics: string[];
  valueRanges: {
    [metricId: string]: [number, number];
  };
  showOnlyImproving: boolean;
  minImprovementPercent: number;
  hideOutliers: boolean;
}

const MetricFilterDialog: React.FC<MetricFilterDialogProps> = ({
  open,
  onClose,
  metrics,
  onApplyFilters,
  initialFilters
}) => {
  const defaultFilters: MetricFilters = {
    selectedMetrics: metrics.map(m => m.id),
    valueRanges: Object.fromEntries(
      metrics.map(m => [m.id, m.normalRange || [0, 100]])
    ),
    showOnlyImproving: false,
    minImprovementPercent: 0,
    hideOutliers: false
  };

  const [filters, setFilters] = useState<MetricFilters>(initialFilters || defaultFilters);

  // Resetear filtros a los valores por defecto
  const handleReset = () => {
    setFilters(defaultFilters);
  };

  // Manejar cambios en métricas seleccionadas
  const handleMetricToggle = (metricId: string) => {
    setFilters(prev => {
      if (prev.selectedMetrics.includes(metricId)) {
        return {
          ...prev,
          selectedMetrics: prev.selectedMetrics.filter(id => id !== metricId)
        };
      } else {
        return {
          ...prev,
          selectedMetrics: [...prev.selectedMetrics, metricId]
        };
      }
    });
  };

  // Manejar cambios en rangos de valores
  const handleRangeChange = (metricId: string, newRange: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      valueRanges: {
        ...prev.valueRanges,
        [metricId]: newRange
      }
    }));
  };

  // Manejar cambio en la opción de mostrar solo pacientes que mejoran
  const handleImprovingToggle = () => {
    setFilters(prev => ({
      ...prev,
      showOnlyImproving: !prev.showOnlyImproving
    }));
  };

  // Manejar cambio en el porcentaje mínimo de mejora
  const handleMinImprovementChange = (_: Event, value: number | number[]) => {
    setFilters(prev => ({
      ...prev,
      minImprovementPercent: Array.isArray(value) ? value[0] : value
    }));
  };

  // Manejar cambio en la opción de ocultar outliers
  const handleOutliersToggle = () => {
    setFilters(prev => ({
      ...prev,
      hideOutliers: !prev.hideOutliers
    }));
  };

  // Aplicar filtros y cerrar
  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="metric-filter-dialog-title"
    >
      <DialogTitle id="metric-filter-dialog-title">
        Filtrar Métricas y Resultados
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          Seleccionar Métricas a Mostrar
        </Typography>
        <FormGroup row>
          {metrics.map(metric => (
            <FormControlLabel
              key={metric.id}
              control={
                <Checkbox 
                  checked={filters.selectedMetrics.includes(metric.id)} 
                  onChange={() => handleMetricToggle(metric.id)}
                />
              }
              label={
                <Chip 
                  label={metric.name}
                  size="small"
                  color={filters.selectedMetrics.includes(metric.id) ? "primary" : "default"}
                  variant={filters.selectedMetrics.includes(metric.id) ? "filled" : "outlined"}
                />
              }
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Rangos de Valores
        </Typography>
        <Box sx={{ mb: 2 }}>
          {metrics.filter(m => filters.selectedMetrics.includes(m.id)).map(metric => {
            // Asegurarnos que el rango existe para este métrico
            const valueRange = filters.valueRanges[metric.id] || [
              metric.normalRange?.[0] || 0,
              metric.normalRange?.[1] || 100
            ];
            
            return (
              <Box key={metric.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography sx={{ width: '25%' }}>{metric.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ width: '25%', textAlign: 'right' }}>
                    {valueRange[0]}{metric.unit} - {valueRange[1]}{metric.unit}
                  </Typography>
                </Box>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={valueRange}
                    onChange={(_, newValue) => handleRangeChange(metric.id, newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={metric.desiredTrend === 'down' ? 0 : metric.normalRange?.[0] || 0}
                    max={metric.desiredTrend === 'up' ? 150 : (metric.normalRange?.[1] || 100) * 1.5}
                    marks={[
                      { value: metric.normalRange?.[0] || 0, label: `${metric.normalRange?.[0] || 0}` },
                      { value: metric.normalRange?.[1] || 100, label: `${metric.normalRange?.[1] || 100}` }
                    ]}
                    valueLabelFormat={value => `${value}${metric.unit}`}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Opciones Adicionales
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox 
                checked={filters.showOnlyImproving} 
                onChange={handleImprovingToggle}
              />
            }
            label="Mostrar solo pacientes con mejora"
          />

          {filters.showOnlyImproving && (
            <Box sx={{ pl: 4, pr: 2, my: 2 }}>
              <Typography id="improvement-slider" gutterBottom>
                Mejora mínima: {filters.minImprovementPercent}%
              </Typography>
              <Slider
                value={filters.minImprovementPercent}
                onChange={handleMinImprovementChange}
                aria-labelledby="improvement-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={50}
                valueLabelFormat={value => `${value}%`}
              />
            </Box>
          )}

          <FormControlLabel
            control={
              <Checkbox 
                checked={filters.hideOutliers} 
                onChange={handleOutliersToggle}
              />
            }
            label="Ocultar valores atípicos"
          />
        </FormGroup>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button onClick={handleReset} color="secondary">
          Restablecer Filtros
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button onClick={handleApply} variant="contained">
            Aplicar Filtros
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default MetricFilterDialog; 