import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput, 
  Chip,
  Grid,
  TextField,
  Button,
  Divider,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import PatientComparisonChart, { PatientProgressData } from '../components/comparison/PatientComparisonChart';

// Simulamos la obtención de datos de pacientes
const getPatientsMockData = (): {patientsList: PatientBasicInfo[], metricsOptions: MetricOption[]} => {
  return {
    patientsList: [
      { id: '1', name: 'Juan Pérez', age: 45, diagnosis: 'Lumbalgia crónica' },
      { id: '2', name: 'María García', age: 38, diagnosis: 'Tendinitis de hombro' },
      { id: '3', name: 'Carlos Rodríguez', age: 52, diagnosis: 'Osteoartritis de rodilla' },
      { id: '4', name: 'Ana Martínez', age: 29, diagnosis: 'Cervicalgia' },
      { id: '5', name: 'Roberto Sánchez', age: 61, diagnosis: 'Síndrome del túnel carpiano' },
      { id: '6', name: 'Laura Gómez', age: 42, diagnosis: 'Lumbalgia crónica' },
      { id: '7', name: 'Pedro López', age: 55, diagnosis: 'Osteoartritis de rodilla' },
      { id: '8', name: 'Carmen Díaz', age: 40, diagnosis: 'Tendinitis de hombro' }
    ],
    metricsOptions: [
      { id: 'pain', name: 'Nivel de dolor', unit: 'puntos (0-10)', hasNormalRange: false, normalRange: null, targetValue: 0 },
      { id: 'rom_lumbar_flexion', name: 'Rango de movimiento - Flexión lumbar', unit: 'grados', hasNormalRange: true, normalRange: [0, 60], targetValue: 50 },
      { id: 'strength_quadriceps', name: 'Fuerza - Cuádriceps', unit: 'puntos (0-5)', hasNormalRange: true, normalRange: [4, 5], targetValue: 5 },
      { id: 'rom_shoulder_flexion', name: 'Rango de movimiento - Flexión de hombro', unit: 'grados', hasNormalRange: true, normalRange: [0, 180], targetValue: 170 },
      { id: 'functionality', name: 'Capacidad funcional', unit: '%', hasNormalRange: false, normalRange: null, targetValue: 100 },
      { id: 'walking_distance', name: 'Distancia de caminata', unit: 'metros', hasNormalRange: false, normalRange: null, targetValue: 500 }
    ]
  };
};

// Función para simular la carga de datos de progreso de un paciente
const getPatientProgressData = (patientId: string, metricId: string): Promise<PatientProgressData> => {
  // Datos ficticios de pacientes
  interface PatientDataEntry {
    patientId: string;
    patientName: string;
    diagnosis: string;
    age: number;
    metrics: Record<string, Array<{date: string; value: number}>>;
  }
  
  const patientData: Record<string, PatientDataEntry> = {
    '1': {
      patientId: '1',
      patientName: 'Juan Pérez',
      diagnosis: 'Lumbalgia crónica',
      age: 45,
      metrics: {
        'pain': [
          { date: '2023-01-15', value: 8 },
          { date: '2023-02-15', value: 6 },
          { date: '2023-03-15', value: 4 },
          { date: '2023-04-15', value: 3 }
        ],
        'rom_lumbar_flexion': [
          { date: '2023-01-15', value: 30 },
          { date: '2023-02-15', value: 35 },
          { date: '2023-03-15', value: 40 },
          { date: '2023-04-15', value: 45 }
        ],
        'functionality': [
          { date: '2023-01-15', value: 45 },
          { date: '2023-02-15', value: 55 },
          { date: '2023-03-15', value: 65 },
          { date: '2023-04-15', value: 75 }
        ]
      }
    },
    '2': {
      patientId: '2',
      patientName: 'María García',
      diagnosis: 'Tendinitis de hombro',
      age: 38,
      metrics: {
        'pain': [
          { date: '2023-01-10', value: 7 },
          { date: '2023-02-10', value: 5 },
          { date: '2023-03-10', value: 3 },
          { date: '2023-04-10', value: 2 }
        ],
        'rom_shoulder_flexion': [
          { date: '2023-01-10', value: 90 },
          { date: '2023-02-10', value: 120 },
          { date: '2023-03-10', value: 140 },
          { date: '2023-04-10', value: 160 }
        ],
        'functionality': [
          { date: '2023-01-10', value: 55 },
          { date: '2023-02-10', value: 65 },
          { date: '2023-03-10', value: 75 },
          { date: '2023-04-10', value: 85 }
        ]
      }
    },
    '3': {
      patientId: '3',
      patientName: 'Carlos Rodríguez',
      diagnosis: 'Osteoartritis de rodilla',
      age: 52,
      metrics: {
        'pain': [
          { date: '2023-01-05', value: 8 },
          { date: '2023-02-05', value: 7 },
          { date: '2023-03-05', value: 5 },
          { date: '2023-04-05', value: 4 }
        ],
        'strength_quadriceps': [
          { date: '2023-01-05', value: 3 },
          { date: '2023-02-05', value: 3.5 },
          { date: '2023-03-05', value: 4 },
          { date: '2023-04-05', value: 4.5 }
        ],
        'walking_distance': [
          { date: '2023-01-05', value: 200 },
          { date: '2023-02-05', value: 250 },
          { date: '2023-03-05', value: 300 },
          { date: '2023-04-05', value: 350 }
        ],
        'functionality': [
          { date: '2023-01-05', value: 40 },
          { date: '2023-02-05', value: 50 },
          { date: '2023-03-05', value: 60 },
          { date: '2023-04-05', value: 70 }
        ]
      }
    },
    '6': {
      patientId: '6',
      patientName: 'Laura Gómez',
      diagnosis: 'Lumbalgia crónica',
      age: 42,
      metrics: {
        'pain': [
          { date: '2023-01-20', value: 7 },
          { date: '2023-02-20', value: 5 },
          { date: '2023-03-20', value: 3 },
          { date: '2023-04-20', value: 3 }
        ],
        'rom_lumbar_flexion': [
          { date: '2023-01-20', value: 25 },
          { date: '2023-02-20', value: 35 },
          { date: '2023-03-20', value: 45 },
          { date: '2023-04-20', value: 52 }
        ],
        'functionality': [
          { date: '2023-01-20', value: 50 },
          { date: '2023-02-20', value: 60 },
          { date: '2023-03-20', value: 70 },
          { date: '2023-04-20', value: 80 }
        ]
      }
    },
    '7': {
      patientId: '7',
      patientName: 'Pedro López',
      diagnosis: 'Osteoartritis de rodilla',
      age: 55,
      metrics: {
        'pain': [
          { date: '2023-01-25', value: 9 },
          { date: '2023-02-25', value: 7 },
          { date: '2023-03-25', value: 6 },
          { date: '2023-04-25', value: 5 }
        ],
        'strength_quadriceps': [
          { date: '2023-01-25', value: 2.5 },
          { date: '2023-02-25', value: 3 },
          { date: '2023-03-25', value: 3.5 },
          { date: '2023-04-25', value: 4 }
        ],
        'walking_distance': [
          { date: '2023-01-25', value: 150 },
          { date: '2023-02-25', value: 200 },
          { date: '2023-03-25', value: 250 },
          { date: '2023-04-25', value: 300 }
        ],
        'functionality': [
          { date: '2023-01-25', value: 35 },
          { date: '2023-02-25', value: 45 },
          { date: '2023-03-25', value: 55 },
          { date: '2023-04-25', value: 65 }
        ]
      }
    }
  };

  // Colores para los pacientes
  const patientColors: Record<string, string> = {
    '1': '#8884d8',
    '2': '#82ca9d',
    '3': '#ff8042',
    '4': '#ffc658',
    '5': '#a4de6c',
    '6': '#d0ed57',
    '7': '#83a6ed'
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      const patient = patientData[patientId];
      if (!patient || !patient.metrics[metricId]) {
        resolve({
          patientId,
          patientName: "Paciente no encontrado",
          diagnosis: "",
          age: 0,
          color: patientColors[patientId] || '#cccccc',
          data: []
        });
        return;
      }

      resolve({
        patientId: patient.patientId,
        patientName: patient.patientName,
        diagnosis: patient.diagnosis,
        age: patient.age,
        color: patientColors[patientId] || '#cccccc',
        data: patient.metrics[metricId].map(item => ({
          date: new Date(item.date).getTime(), // Convertir string a timestamp
          value: item.value
        }))
      });
    }, 300); // Simulamos un retraso de carga
  });
};

// Interfaces para los datos
interface PatientBasicInfo {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
}

interface MetricOption {
  id: string;
  name: string;
  unit: string;
  hasNormalRange: boolean;
  normalRange: [number, number] | null;
  targetValue: number | null;
}

export const PatientComparisonPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [patientsData, setPatientsData] = useState<{ 
    patientsList: PatientBasicInfo[],
    metricsOptions: MetricOption[]
  }>({ patientsList: [], metricsOptions: [] });
  
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [chartData, setChartData] = useState<PatientProgressData[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<PatientBasicInfo[]>([]);
  const [diagnosisFilter, setDiagnosisFilter] = useState<string>('');

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // En un entorno real, aquí se cargarían los datos de una API
      const result = getPatientsMockData();
      setPatientsData(result);
      setFilteredPatients(result.patientsList);
      setLoading(false);
    };

    loadData();
  }, []);

  // Filtrar pacientes por diagnóstico
  useEffect(() => {
    if (diagnosisFilter) {
      const filtered = patientsData.patientsList.filter(patient => 
        patient.diagnosis.toLowerCase().includes(diagnosisFilter.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patientsData.patientsList);
    }
  }, [diagnosisFilter, patientsData.patientsList]);

  // Manejar cambio en selección de pacientes
  const handlePatientChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedPatients(typeof value === 'string' ? [value] : value);
  };

  // Manejar cambio en selección de métrica
  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value as string);
  };

  // Cargar datos para el gráfico
  const loadChartData = async () => {
    if (!selectedPatients.length || !selectedMetric) return;

    setLoadingChart(true);
    setChartData([]);

    try {
      const promises = selectedPatients.map(patientId => 
        getPatientProgressData(patientId, selectedMetric)
      );
      
      const results = await Promise.all(promises);
      setChartData(results.filter(data => data.data.length > 0));
    } catch (error) {
      console.error("Error al cargar datos para el gráfico:", error);
    } finally {
      setLoadingChart(false);
    }
  };

  // Obtener la métrica seleccionada
  const getSelectedMetricDetails = (): MetricOption | undefined => {
    return patientsData.metricsOptions.find(metric => metric.id === selectedMetric);
  };

  // Función auxiliar para obtener el valor objetivo seguro
  const getTargetValue = (): number | undefined => {
    const metric = getSelectedMetricDetails();
    return metric && typeof metric.targetValue === 'number' ? metric.targetValue : undefined;
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Comparación de Evolución de Pacientes
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Compare la evolución y progreso de diferentes pacientes para analizar patrones de recuperación y eficacia de tratamientos.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Filtrar pacientes por diagnóstico
                  </Typography>
                  <TextField
                    fullWidth
                    label="Diagnóstico"
                    variant="outlined"
                    value={diagnosisFilter}
                    onChange={(e) => setDiagnosisFilter(e.target.value)}
                    placeholder="Ej: Lumbalgia, Cervicalgia, etc."
                    sx={{ mb: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Seleccionar pacientes
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="patient-select-label">Pacientes</InputLabel>
                    <Select
                      labelId="patient-select-label"
                      multiple
                      value={selectedPatients}
                      onChange={handlePatientChange}
                      input={<OutlinedInput id="select-patients" label="Pacientes" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((patientId) => {
                            const patient = filteredPatients.find(p => p.id === patientId);
                            return (
                              <Chip key={patientId} label={patient?.name || patientId} />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {filteredPatients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.name} - {patient.diagnosis}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Seleccionar métricas de comparación
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="metric-select-label">Métricas</InputLabel>
                    <Select
                      labelId="metric-select-label"
                      value={selectedMetric}
                      onChange={handleMetricChange}
                      label="Métricas"
                    >
                      {patientsData.metricsOptions.map((metric) => (
                        <MenuItem key={metric.id} value={metric.id}>
                          {metric.name} ({metric.unit})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Generar comparación
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    disabled={selectedPatients.length === 0 || selectedMetric === '' || loadingChart} 
                    onClick={loadChartData}
                  >
                    {loadingChart ? <CircularProgress size={24} /> : 'Generar gráficos comparativos'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {loadingChart ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : chartData.length > 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comparación de {getSelectedMetricDetails()?.name || 'métricas'}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <PatientComparisonChart
                  data={chartData}
                  unit={getSelectedMetricDetails()?.unit || ''}
                  title={getSelectedMetricDetails()?.name || ''}
                  normalRange={getSelectedMetricDetails()?.hasNormalRange ? getSelectedMetricDetails()?.normalRange as [number, number] : undefined}
                  targetValue={getTargetValue()}
                />
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Los datos muestran la evolución a lo largo del tiempo para cada paciente seleccionado.
                    Puede observar tendencias, comparar velocidades de recuperación y evaluar respuestas al tratamiento.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : selectedPatients.length > 0 && selectedMetric && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Seleccione pacientes y una métrica, luego haga clic en "Generar Comparación" para visualizar los datos.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}; 