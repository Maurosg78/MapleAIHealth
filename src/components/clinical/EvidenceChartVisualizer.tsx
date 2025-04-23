import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';;;;;
import { useTheme } from '@mui/material/styles';;;;;
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';;;;;
import { ClinicalEvidence, EvidenceLevelData, EvidenceVisualization } from '../../types/clinicalDashboard';;;;;
import { CacheManagerFactory } from '../../services/cache/CacheManagerFactory';;;;;
import { ClinicalDashboardService } from '../../services/clinicalDashboard';;;;;

// Tipos de visualización disponibles
type ChartType = 'bar' | 'pie' | 'line' | 'area' | 'comparison';

// Tipo para los datos procesados para gráficos
interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
  reliability?: number;
  description?: string;
  date?: string;
  [key: string]: unknown;
}

interface EvidenceChartVisualizerProps {
  data: Array<ClinicalEvidence> | EvidenceLevelData[] | Record<string, number>;
  title: string;
  description?: string;
  defaultChartType?: ChartType;
  height?: number;
  colors?: string[];
  patientId?: string;
  categoryKey?: string;
  valueKey?: string;
  isMobile?: boolean;
}

interface ChartMetadata {
  lastAccess: number;
  accessCount: number;
  size: number;
  patientId?: string;
  section: string;
}

const transformDataForChart = (evidenceData: ClinicalEvidence[], colorConfig: Record<string, string>): ChartDataItem[] => {
  return evidenceData.map((item, index) => ({
    name: item.title,
    value: item.relevanceScore,
    reliability: item.reliability,
    date: new Date(item.lastUpdated).toLocaleDateString(),
    color: colorConfig[`color-${index % Object.keys(colorConfig).length + 1}`]
  }));
};

export const EvidenceChartVisualizer: React.FC<EvidenceChartVisualizerProps> = ({
  data,
  title,
  description,
  defaultChartType = 'bar',
  height = 300,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8'],
  patientId,
  categoryKey = 'name',
  valueKey = 'value',
  isMobile = false
}) => {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const theme = useTheme();
  const cacheManager = CacheManagerFactory.getInstance<EvidenceVisualization>('evidence-charts');
  const [processedChartData, setProcessedChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clinicalService = useMemo(() => ClinicalDashboardService.getInstance(), []);

  // Memorizar la configuración de los colores para evitar recálculos
  const colorConfig = useMemo(() => {
    return colors.reduce((acc, color, index) => {
      acc[`color-${index + 1}`] = color;
      return acc;
    }, {} as Record<string, string>);
  }, [colors]);

  useEffect(() => {
    if (!data) {
      fetchEvidenceData();
    } else {
      processEvidenceData(data);
    }
  }, [patientId, data]);

  const fetchEvidenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar datos de ejemplo ya que fetchRecentEvidence es privado
      const mockData = clinicalService.getDashboardData({patientId: patientId || ''})
        .then(data => data.evidence);
      const fetchedData = await mockData;
      processEvidenceData(fetchedData);
    } catch (err) {
      console.error('Error fetching evidence data:', err);
      setError('No se pudieron cargar los datos de evidencia clínica');
      setLoading(false);
    }
  };

  const processEvidenceData = (evidenceData: ClinicalEvidence[] | EvidenceLevelData[] | Record<string, number>): void => {
    try {
      // Verificar si es un array de ClinicalEvidence
      if (Array.isArray(evidenceData) && evidenceData.length > 0 && 'id' in evidenceData[0]) {
        const processed = transformDataForChart(evidenceData as ClinicalEvidence[], colorConfig);
        setProcessedChartData(processed);
      } 
      // Para otros tipos de datos, utilizamos chartData del useMemo
      else {
        // No establecemos los datos procesados, se usará chartData
      }
      setLoading(false);
    } catch (err) {
      console.error('Error processing evidence data:', err);
      setError('Error al procesar los datos de evidencia');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Limpiar al desmontar
    return () => {
      // Cualquier limpieza necesaria
    };
  }, []);

  // Procesamiento de datos para gráficos
  const chartData = useMemo<ChartDataItem[]>(() => {
    if (Array.isArray(data)) {
      // Si los datos son un array de objetos, los usamos directamente
      if (typeof data[0] === 'object') {
        // Si son datos de nivel de evidencia
        if ('level' in (data[0] as EvidenceLevelData)) {
          return (data as EvidenceLevelData[]).map(item => ({
            name: item.level,
            value: item.count,
            color: item.color,
            description: item.description
          }));
        }
        // Si son evidencias clínicas
        else if ('id' in (data[0] as ClinicalEvidence)) {
          return (data as ClinicalEvidence[]).map(item => ({
            name: item.title,
            value: item.relevanceScore,
            reliability: item.reliability,
            date: new Date(item.lastUpdated).toLocaleDateString()
          }));
        }
        // Otros arrays de objetos
        return (data as unknown) as ChartDataItem[];
      }
      // Si son datos primitivos, los convertimos a objetos
      return data.map((value, index) => ({
        name: `Item ${index + 1}`,
        value: Number(value)
      }));
    }
    // Si los datos son un objeto, lo convertimos a array
    else if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value]) => ({
        name: key,
        value: Number(value)
      }));
    }
    
    return processedChartData.length > 0 ? processedChartData : [];
  }, [data, processedChartData]);

  // Verificar si los datos tienen cierta propiedad
  const hasProperty = (prop: string): boolean => {
    return chartData.length > 0 && prop in chartData[0];
  };

  // Cachear la configuración de visualización
  useEffect(() => {
    const cacheVisualizationConfig = async () => {
      if (chartData.length === 0) return;
      
      const cacheKey = `${title}-${chartType}`;
      const config = {
        chartType,
        title,
        description,
        height,
        colors,
        lastRendered: new Date().toISOString()
      };
      
      const metadata: ChartMetadata = {
        lastAccess: Date.now(),
        accessCount: 1,
        size: JSON.stringify(config).length,
        patientId,
        section: 'evidence-charts'
      };
      
      await cacheManager.set(cacheKey, { 
        id: cacheKey,
        title,
        evidenceId: cacheKey,
        type: chartType === 'comparison' ? 'comparison' : 'chart',
        config,
        lastRendered: new Date().toISOString()
      }, metadata);
    };
    
    cacheVisualizationConfig();
  }, [chartType, title, chartData, cacheManager, colors, description, height, patientId]);

  // Renderizar el gráfico según el tipo seleccionado
  const renderChart = (): void => {
    if (chartData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <Typography variant="body1" color="text.secondary">
            No hay datos disponibles para visualizar
          </Typography>
        </Box>
      );
    }

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={isMobile ? 60 : 80}
                fill="#8884d8"
                dataKey={valueKey}
                nameKey={categoryKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={hasProperty('color') && entry.color ? entry.color : colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Valor']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={valueKey} 
                stroke={theme.palette.primary.main} 
                activeDot={{ r: 8 }} 
                name="Valor"
              />
              {hasProperty('reliability') && (
                <Line 
                  type="monotone" 
                  dataKey="reliability" 
                  stroke={theme.palette.secondary.main} 
                  name="Fiabilidad"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={valueKey} 
                fill={theme.palette.primary.light} 
                stroke={theme.palette.primary.main} 
                name="Valor"
              />
              {hasProperty('reliability') && (
                <Area 
                  type="monotone" 
                  dataKey="reliability" 
                  fill={theme.palette.secondary.light} 
                  stroke={theme.palette.secondary.main} 
                  name="Fiabilidad"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'comparison':
        // Gráfico de comparación especial para evidencias
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey={categoryKey} type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey={valueKey} fill={theme.palette.primary.main} name="Relevancia" />
              {hasProperty('reliability') && (
                <Bar dataKey="reliability" fill={theme.palette.secondary.main} name="Fiabilidad" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={valueKey} 
                fill={theme.palette.primary.main} 
                name="Valor"
              />
              {hasProperty('reliability') && (
                <Bar 
                  dataKey="reliability" 
                  fill={theme.palette.secondary.main} 
                  name="Fiabilidad"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2
        }
      }}
      role="region"
      aria-labelledby="chart-title"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography 
            id="chart-title" 
            variant="h6" 
            component="h3" 
            gutterBottom
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {description}
            </Typography>
          )}
        </Box>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="chart-type-label">Tipo</InputLabel>
          <Select
            labelId="chart-type-label"
            id="chart-type-select"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            label="Tipo"
          >
            <MenuItem value="bar">Barras</MenuItem>
            <MenuItem value="pie">Circular</MenuItem>
            <MenuItem value="line">Línea</MenuItem>
            <MenuItem value="area">Área</MenuItem>
            <MenuItem value="comparison">Comparación</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <CircularProgress aria-label="Cargando datos" />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error" align="center">
          {error}
        </Typography>
      ) : (
        renderChart()
      )}
    </Paper>
  );
}; 