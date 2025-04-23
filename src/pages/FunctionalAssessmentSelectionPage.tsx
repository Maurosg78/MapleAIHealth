import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';;;;;
import { Box, Typography, Card, CardContent, TextField, InputAdornment, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from '@mui/material';;;;;

// Interfaz para los datos de paciente
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  lastAssessment: string;
  assessmentCount: number;
  adherenceRate: number;
}

// Datos de ejemplo
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    age: 45,
    gender: 'Masculino',
    diagnosis: 'Lumbalgia crónica',
    lastAssessment: '2023-04-15',
    assessmentCount: 8,
    adherenceRate: 85,
  },
  {
    id: '2',
    name: 'María García',
    age: 38,
    gender: 'Femenino',
    diagnosis: 'Tendinitis de hombro',
    lastAssessment: '2023-03-22',
    assessmentCount: 6,
    adherenceRate: 92,
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    age: 52,
    gender: 'Masculino',
    diagnosis: 'Osteoartritis de rodilla',
    lastAssessment: '2023-04-10',
    assessmentCount: 12,
    adherenceRate: 78,
  },
  {
    id: '4',
    name: 'Ana Martínez',
    age: 29,
    gender: 'Femenino',
    diagnosis: 'Cervicalgia',
    lastAssessment: '2023-04-05',
    assessmentCount: 4,
    adherenceRate: 90,
  },
  {
    id: '5',
    name: 'Roberto Sánchez',
    age: 61,
    gender: 'Masculino',
    diagnosis: 'Síndrome del túnel carpiano',
    lastAssessment: '2023-03-15',
    assessmentCount: 7,
    adherenceRate: 65,
  }
];

// Función para obtener el color de la adherencia
const getAdherenceColor = (rate: number): void => {
  if (rate >= 85) return 'success';
  if (rate >= 70) return 'warning';
  return 'error';
};

export const FunctionalAssessmentSelectionPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulamos la carga de datos
    const fetchPatients = async () => {
      setLoading(true);
      // En un entorno real, aquí se cargarían los datos de una API
      setTimeout(() => {
        setPatients(mockPatients);
        setLoading(false);
      }, 800);
    };

    fetchPatients();
  }, []);

  // Filtrar pacientes por término de búsqueda
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Evaluación Funcional de Pacientes
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Seleccione un paciente para visualizar su evaluación funcional detallada y seguimiento de evolución.
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Buscar paciente..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '100%', maxWidth: 500 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    🔍
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell>Nombre del paciente</TableCell>
                    <TableCell>Edad</TableCell>
                    <TableCell>Diagnóstico</TableCell>
                    <TableCell>Última evaluación</TableCell>
                    <TableCell>Evaluaciones</TableCell>
                    <TableCell>Adherencia</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No se encontraron pacientes con los criterios de búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.gender}
                          </Typography>
                        </TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.diagnosis}</TableCell>
                        <TableCell>
                          {new Date(patient.lastAssessment).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{patient.assessmentCount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${patient.adherenceRate}%`} 
                            size="small"
                            color={getAdherenceColor(patient.adherenceRate) as 'success' | 'warning' | 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            to={`/evaluacion-funcional/${patient.id}`}
                            variant="contained"
                            color="primary"
                            size="small"
                          >
                            📊 Ver evaluación
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}; 