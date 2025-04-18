import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  People as PeopleIcon,
  FilterList as FilterIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import PatientComparisonChart, { PatientProgressData } from './PatientComparisonChart';
import { PatientComparisonTable, ComparisonMetric } from './PatientComparisonTable';
import PatientSelectionModal from './PatientSelectionModal';
import MetricFilterDialog, { MetricFilters } from './MetricFilterDialog';
import SaveComparisonDialog from './SaveComparisonDialog';
import comparisonStorageService, { NewComparisonData } from '../../services/comparisonStorage';

// Define interfaces
interface MetricDataPoint {
  date: string;
  value: number;
}

// Definición de los datos de pacientes mockeados
const mockPatients: PatientProgressData[] = [
  {
    patientId: 'patient1',
    patientName: 'María García',
    age: 45,
    diagnosis: 'Lumbalgia crónica',
    color: '#8884d8',
    data: [] // Este campo se llenará dinámicamente con createChartData
  },
  {
    patientId: 'patient2',
    patientName: 'Juan Pérez',
    age: 52,
    diagnosis: 'Artritis reumatoide',
    color: '#82ca9d',
    data: [] // Este campo se llenará dinámicamente con createChartData
  },
  {
    patientId: 'patient3',
    patientName: 'Laura Martínez',
    age: 37,
    diagnosis: 'Lesión LCA',
    color: '#ffc658',
    data: [] // Este campo se llenará dinámicamente con createChartData
  }
];

// Definición de las métricas de comparación
const mockMetrics: ComparisonMetric[] = [
  {
    id: 'pain',
    name: 'Dolor',
    unit: '/10',
    desiredTrend: 'down',
    normalRange: [0, 3],
    targetValue: 2
  },
  {
    id: 'mobility',
    name: 'Movilidad',
    unit: '°',
    desiredTrend: 'up',
    normalRange: [80, 120],
    targetValue: 90
  },
  {
    id: 'strength',
    name: 'Fuerza',
    unit: 'kg',
    desiredTrend: 'up',
    normalRange: [15, 30],
    targetValue: 25
  },
  {
    id: 'function',
    name: 'Funcionalidad',
    unit: '/100',
    desiredTrend: 'up',
    normalRange: [70, 100],
    targetValue: 80
  },
  {
    id: 'disability',
    name: 'Discapacidad',
    unit: '%',
    desiredTrend: 'down',
    normalRange: [0, 30],
    targetValue: 20
  }
];

// Definición de los datos de las métricas
const mockMetricData: {
  [patientId: string]: {
    [metricId: string]: MetricDataPoint[];
  };
} = {
  'patient1': {
    'pain': [
      { date: '2023-01-03', value: 8 },
      { date: '2023-01-17', value: 6 },
      { date: '2023-01-31', value: 5 },
      { date: '2023-02-14', value: 4 }
    ],
    'mobility': [
      { date: '2023-01-03', value: 70 },
      { date: '2023-01-17', value: 75 },
      { date: '2023-01-31', value: 80 },
      { date: '2023-02-14', value: 85 }
    ],
    'strength': [
      { date: '2023-01-03', value: 12 },
      { date: '2023-01-17', value: 15 },
      { date: '2023-01-31', value: 18 },
      { date: '2023-02-14', value: 20 }
    ],
    'function': [
      { date: '2023-01-03', value: 60 },
      { date: '2023-01-17', value: 65 },
      { date: '2023-01-31', value: 70 },
      { date: '2023-02-14', value: 75 }
    ],
    'disability': [
      { date: '2023-01-03', value: 50 },
      { date: '2023-01-17', value: 45 },
      { date: '2023-01-31', value: 40 },
      { date: '2023-02-14', value: 35 }
    ]
  },
  'patient2': {
    'pain': [
      { date: '2023-01-03', value: 7 },
      { date: '2023-01-17', value: 7 },
      { date: '2023-01-31', value: 6 },
      { date: '2023-02-14', value: 5 }
    ],
    'mobility': [
      { date: '2023-01-03', value: 65 },
      { date: '2023-01-17', value: 68 },
      { date: '2023-01-31', value: 70 },
      { date: '2023-02-14', value: 75 }
    ],
    'strength': [
      { date: '2023-01-03', value: 10 },
      { date: '2023-01-17', value: 12 },
      { date: '2023-01-31', value: 14 },
      { date: '2023-02-14', value: 16 }
    ],
    'function': [
      { date: '2023-01-03', value: 50 },
      { date: '2023-01-17', value: 55 },
      { date: '2023-01-31', value: 60 },
      { date: '2023-02-14', value: 65 }
    ],
    'disability': [
      { date: '2023-01-03', value: 60 },
      { date: '2023-01-17', value: 55 },
      { date: '2023-01-31', value: 52 },
      { date: '2023-02-14', value: 48 }
    ]
  },
  'patient3': {
    'pain': [
      { date: '2023-01-03', value: 6 },
      { date: '2023-01-17', value: 4 },
      { date: '2023-01-31', value: 3 },
      { date: '2023-02-14', value: 2 }
    ],
    'mobility': [
      { date: '2023-01-03', value: 60 },
      { date: '2023-01-17', value: 70 },
      { date: '2023-01-31', value: 80 },
      { date: '2023-02-14', value: 90 }
    ],
    'strength': [
      { date: '2023-01-03', value: 8 },
      { date: '2023-01-17', value: 12 },
      { date: '2023-01-31', value: 16 },
      { date: '2023-02-14', value: 20 }
    ],
    'function': [
      { date: '2023-01-03', value: 40 },
      { date: '2023-01-17', value: 50 },
      { date: '2023-01-31', value: 60 },
      { date: '2023-02-14', value: 70 }
    ],
    'disability': [
      { date: '2023-01-03', value: 70 },
      { date: '2023-01-17', value: 60 },
      { date: '2023-01-31', value: 50 },
      { date: '2023-02-14', value: 40 }
    ]
  }
};

// Función para preparar los datos para el gráfico de comparación de pacientes
const createChartData = (patients: PatientProgressData[], metricId: string): PatientProgressData[] => {
  return patients.map(patient => {
    // Obtenemos los datos específicos para la métrica seleccionada
    const patientIdKey = patient.patientId;
    const metricDataPoints = mockMetricData[patientIdKey]?.[metricId] || [];
    
    // Convertimos los datos al formato esperado por el componente PatientComparisonChart
    const formattedData = metricDataPoints.map((point: MetricDataPoint) => ({
      date: new Date(point.date).getTime(), // Convertimos la fecha a timestamp
      value: point.value
    }));
    
    // Devolvemos un nuevo objeto con los datos formateados
    return {
      ...patient,
      data: formattedData
    };
  });
};

interface PatientComparisonDashboardProps {
  // En un caso real, estas props vendrían del componente padre o de un servicio
  onAddPatient?: () => void;
  onSaveComparison?: () => void;
}

const PatientComparisonDashboard: React.FC<PatientComparisonDashboardProps> = ({
  onAddPatient,
  onSaveComparison
}) => {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState(0);
  // Estado para la métrica seleccionada
  const [selectedMetric, setSelectedMetric] = useState<string>(mockMetrics[0].id);
  // Estado para manejar los pacientes seleccionados
  const [selectedPatients, setSelectedPatients] = useState<PatientProgressData[]>(mockPatients);
  // Estado para mostrar/ocultar el modal de selección de pacientes
  const [showPatientSelection, setShowPatientSelection] = useState(false);
  // Estado para mostrar/ocultar el diálogo de filtros
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  // Estado para mostrar/ocultar el diálogo de guardar comparación
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  // Estado para almacenar los filtros aplicados
  const [activeFilters, setActiveFilters] = useState<MetricFilters | null>(null);
  // Estado para mostrar notificaciones
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    show: false,
    message: '',
    severity: 'success'
  });
  
  // Variables derivadas para la visualización
  // Métricas filtradas según la selección
  const [filteredMetrics, setFilteredMetrics] = useState<ComparisonMetric[]>(mockMetrics);
  
  // Efecto para aplicar los filtros cuando cambien
  useEffect(() => {
    if (!activeFilters) {
      setFilteredMetrics(mockMetrics);
      return;
    }
    
    // Filtrar las métricas según la selección
    const newFilteredMetrics = mockMetrics.filter(metric => 
      activeFilters.selectedMetrics.includes(metric.id)
    );
    
    setFilteredMetrics(newFilteredMetrics);
    
    // Si la métrica seleccionada ya no está disponible, cambiar a la primera disponible
    if (newFilteredMetrics.length > 0 && !activeFilters.selectedMetrics.includes(selectedMetric)) {
      setSelectedMetric(newFilteredMetrics[0].id);
    }
  }, [activeFilters, selectedMetric]);
  
  // Aplicar filtros a los datos de los pacientes
  const getFilteredChartData = () => {
    if (!activeFilters) {
      return createChartData(selectedPatients, selectedMetric);
    }
    
    // Filtrar los pacientes
    let filteredPatients = [...selectedPatients];
    
    // Si está habilitada la opción de mostrar solo pacientes con mejora
    if (activeFilters.showOnlyImproving) {
      filteredPatients = filteredPatients.filter(patient => {
        const patientData = mockMetricData[patient.patientId]?.[selectedMetric];
        if (!patientData || patientData.length < 2) return false;
        
        // Calcular el porcentaje de mejora
        const firstValue = patientData[0].value;
        const lastValue = patientData[patientData.length - 1].value;
        
        // Determinar si ha mejorado según la tendencia deseada
        const metric = mockMetrics.find(m => m.id === selectedMetric);
        if (!metric) return false;
        
        let improvementPercent = 0;
        
        if (metric.desiredTrend === 'up') {
          // Para métricas donde más es mejor (fuerza, movilidad)
          improvementPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
          return improvementPercent >= activeFilters.minImprovementPercent;
        } else {
          // Para métricas donde menos es mejor (dolor, discapacidad)
          improvementPercent = firstValue > 0 ? ((firstValue - lastValue) / firstValue) * 100 : 0;
          return improvementPercent >= activeFilters.minImprovementPercent;
        }
      });
    }
    
    // Obtener los datos formateados con los rangos aplicados
    let chartData = createChartData(filteredPatients, selectedMetric);
    
    // Aplicar filtro de rango de valores
    if (activeFilters.valueRanges[selectedMetric]) {
      const [minValue, maxValue] = activeFilters.valueRanges[selectedMetric];
      
      // Filtrar los datos fuera del rango seleccionado
      chartData = chartData.map(patient => ({
        ...patient,
        data: patient.data.filter(point => 
          point.value >= minValue && point.value <= maxValue
        )
      }));
      
      // Eliminar pacientes que quedaron sin datos después del filtrado
      chartData = chartData.filter(patient => patient.data.length > 0);
    }
    
    return chartData;
  };
  
  // Obtenemos los datos formatados para el gráfico según la métrica seleccionada
  const chartData = getFilteredChartData();
  
  // Función para manejar el cambio de pestaña
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Función para manejar el cambio de métrica
  const handleMetricChange = (metricId: string) => {
    setSelectedMetric(metricId);
  };
  
  // Función para manejar la eliminación de un paciente
  const handleDeletePatient = (patientId: string) => {
    setSelectedPatients(prevPatients => 
      prevPatients.filter(patient => patient.patientId !== patientId)
    );
  };
  
  // Función para manejar la adición de un paciente
  const handleAddPatient = () => {
    // Si hay un handler externo, lo llamamos
    if (onAddPatient) {
      onAddPatient();
    } else {
      // Mostramos nuestro propio modal de selección
      setShowPatientSelection(true);
    }
  };
  
  // Función para manejar la selección de pacientes del modal
  const handlePatientSelection = (selectedPatientIds: string[]) => {
    // Filtrar pacientes ya seleccionados
    const currentPatientIds = selectedPatients.map(p => p.patientId);
    
    // Obtener nuevos pacientes seleccionados (que no estaban antes)
    const newPatientIds = selectedPatientIds.filter(id => !currentPatientIds.includes(id));
    
    // Crear una lista de pacientes actualizada manteniendo los existentes
    // y añadiendo los nuevos
    const updatedPatients = [
      // Mantener solo los pacientes que siguen seleccionados
      ...selectedPatients.filter(p => selectedPatientIds.includes(p.patientId)),
      // Añadir los nuevos pacientes
      ...mockPatients.filter(p => newPatientIds.includes(p.patientId))
    ];
    
    setSelectedPatients(updatedPatients);
  };
  
  // Función para abrir el diálogo de filtros
  const handleOpenFilterDialog = () => {
    setShowFilterDialog(true);
  };
  
  // Función para aplicar los filtros seleccionados
  const handleApplyFilters = (filters: MetricFilters) => {
    setActiveFilters(filters);
  };
  
  // Función para manejar el guardado de comparaciones
  const handleSaveComparison = () => {
    // Si hay un handler externo, lo llamamos y retornamos
    if (onSaveComparison) {
      onSaveComparison();
      return;
    }
    
    // Si no hay pacientes seleccionados, mostrar error
    if (selectedPatients.length === 0) {
      setNotification({
        show: true,
        message: 'No hay pacientes seleccionados para guardar',
        severity: 'warning'
      });
      return;
    }
    
    // Mostrar el diálogo de guardado
    setShowSaveDialog(true);
  };
  
  // Función para guardar la comparación en el almacenamiento local
  const saveComparisonToStorage = (data: NewComparisonData) => {
    try {
      // Guardar la comparación
      const savedComparison = comparisonStorageService.saveComparison(data);
      
      // Mostrar notificación de éxito
      setNotification({
        show: true,
        message: `Comparación "${savedComparison.name}" guardada correctamente`,
        severity: 'success'
      });
    } catch (error) {
      // Mostrar notificación de error
      setNotification({
        show: true,
        message: 'Error al guardar la comparación',
        severity: 'error'
      });
      console.error('Error al guardar la comparación:', error);
    }
  };
  
  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Encontrar la métrica seleccionada para acceder a sus propiedades
  const selectedMetricData = mockMetrics.find(metric => metric.id === selectedMetric);
  
  // Crear un objeto con nombres de pacientes para mostrar en el diálogo de guardado
  const patientNamesMap = selectedPatients.reduce((acc, patient) => {
    acc[patient.patientId] = patient.patientName;
    return acc;
  }, {} as Record<string, string>);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <CompareIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ flexGrow: 1 }}>
          Comparación de Pacientes
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<PeopleIcon />}
          onClick={handleAddPatient}
          sx={{ mr: 2 }}
        >
          Añadir Paciente
        </Button>
        <Button 
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveComparison}
          disabled={selectedPatients.length === 0}
        >
          Guardar Comparación
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Pacientes en Comparación ({selectedPatients.length})
          </Typography>
          <Button 
            size="small" 
            startIcon={<FilterIcon />}
            onClick={handleOpenFilterDialog}
            disabled={selectedPatients.length === 0}
            color={activeFilters ? "primary" : "inherit"}
            variant={activeFilters ? "contained" : "outlined"}
          >
            {activeFilters ? "Filtros Activos" : "Filtrar"}
          </Button>
        </Box>
        {selectedPatients.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {chartData.map((patient) => (
              <Chip 
                key={patient.patientId}
                label={`${patient.patientName}, ${patient.age} años - ${patient.diagnosis}`}
                onDelete={() => handleDeletePatient(patient.patientId)}
                sx={{ 
                  backgroundColor: `${patient.color}20`, // 20% opacidad
                  borderColor: patient.color,
                  borderWidth: 1,
                  borderStyle: 'solid'
                }}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay pacientes seleccionados. Haga clic en "Añadir Paciente" para comenzar.
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Tabs 
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Gráfico de Progreso" />
        <Tab label="Tabla Comparativa" />
      </Tabs>
      
      {selectedPatients.length === 0 ? (
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay datos para mostrar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Añada pacientes a la comparación para visualizar sus datos.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PeopleIcon />}
            onClick={handleAddPatient}
            sx={{ mt: 2 }}
          >
            Añadir Paciente
          </Button>
        </Paper>
      ) : (
        <>
          {activeTab === 0 && (
            <Paper sx={{ p: 0, height: 500, mb: 4 }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">
                      Progreso de {selectedMetricData?.name || 'Métrica'}
                    </Typography>
                    {activeFilters && (
                      <Typography variant="caption" color="text.secondary">
                        Filtros aplicados: {activeFilters.selectedMetrics.length} métricas, 
                        {activeFilters.showOnlyImproving ? ` mejora mínima ${activeFilters.minImprovementPercent}%,` : ''} 
                        {activeFilters.hideOutliers ? ' sin valores atípicos' : ''}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {filteredMetrics.map((metric) => (
                        <Chip 
                          key={metric.id}
                          label={metric.name}
                          onClick={() => handleMetricChange(metric.id)}
                          variant={selectedMetric === metric.id ? 'filled' : 'outlined'}
                          color={selectedMetric === metric.id ? 'primary' : 'default'}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ p: 2, height: 'calc(100% - 60px)' }}>
                {chartData.length > 0 ? (
                  <PatientComparisonChart
                    data={chartData}
                    normalRange={selectedMetricData?.normalRange}
                    targetValue={selectedMetricData?.targetValue}
                    unit={selectedMetricData?.unit || ''}
                    title={`Progreso de ${selectedMetricData?.name || 'Pacientes'}`}
                  />
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      No hay datos disponibles con los filtros actuales
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
          
          {activeTab === 1 && (
            <Paper sx={{ p: 0, mb: 4 }}>
              <PatientComparisonTable 
                patients={chartData}
                metrics={filteredMetrics}
                metricData={mockMetricData}
              />
            </Paper>
          )}
        </>
      )}
      
      {/* Modal de selección de pacientes */}
      {showPatientSelection && (
        <PatientSelectionModal 
          open={showPatientSelection}
          onClose={() => setShowPatientSelection(false)}
          onSelectPatients={handlePatientSelection}
          currentPatientIds={selectedPatients.map(p => p.patientId)}
        />
      )}
      
      {/* Diálogo de filtros */}
      {showFilterDialog && (
        <MetricFilterDialog
          open={showFilterDialog}
          onClose={() => setShowFilterDialog(false)}
          metrics={mockMetrics}
          onApplyFilters={handleApplyFilters}
          initialFilters={activeFilters || undefined}
        />
      )}
      
      {/* Diálogo para guardar comparación */}
      {showSaveDialog && (
        <SaveComparisonDialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSave={saveComparisonToStorage}
          patientIds={selectedPatients.map(p => p.patientId)}
          patientNames={patientNamesMap}
          selectedMetricId={selectedMetric}
          selectedMetricName={selectedMetricData?.name || 'Métrica sin nombre'}
          activeFilters={activeFilters}
          suggestedTags={['fisioterapia', 'rehabilitación', 'seguimiento', 'artritis', 'dolor', 'movilidad']}
        />
      )}
      
      {/* Notificaciones */}
      <Snackbar 
        open={notification.show} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientComparisonDashboard; 