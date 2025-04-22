import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdvancedSearchPanel from './AdvancedSearchPanel';
import PatientService from '../../services/PatientService';
import { Patient } from '../../models/Patient';
import PatientList from './PatientList';

interface SearchFilters {
  query?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  lastVisitAfter?: string;
  lastVisitBefore?: string;
  orderBy?: 'name' | 'age' | 'lastVisit';
  orderDirection?: 'asc' | 'desc';
}

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const patientService = PatientService.getInstance();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (searchFilters: SearchFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Obtenemos el resumen de pacientes con la búsqueda avanzada
      const patientSummaries = await patientService.searchPatientsAdvanced(searchFilters);
      
      // Para cada resumen, cargamos los datos completos del paciente
      const patientDetailsPromises = patientSummaries.map(summary => 
        patientService.getPatientById(summary.id)
      );
      
      const patientDetails = await Promise.all(patientDetailsPromises);
      // Filtramos posibles nulos
      const validPatientDetails = patientDetails.filter(patient => patient !== null) as Patient[];
      
      setPatients(validPatientDetails);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError('No se pudieron cargar los pacientes. Por favor intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters: SearchFilters) => {
    fetchPatients(searchFilters);
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleEditPatient = (patient: Patient) => {
    navigate(`/patients/${patient.id}/edit`);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este paciente?')) {
      try {
        // Aquí implementaríamos la lógica para eliminar un paciente
        // Por ahora, actualizamos la lista filtrando el paciente eliminado
        setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));
      } catch (err) {
        console.error('Error al eliminar paciente:', err);
        setError('No se pudo eliminar el paciente. Por favor intente de nuevo.');
      }
    }
  };

  const handleCreatePatient = () => {
    navigate('/patients/create');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pacientes
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreatePatient}
        >
          Nuevo Paciente
        </Button>
      </Box>
      
      <AdvancedSearchPanel onSearch={handleSearch} loading={loading} />
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box sx={{ mt: 3 }}>
        <PatientList 
          patients={patients}
          loading={loading}
          onView={handleViewPatient}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
        />
      </Box>
    </Container>
  );
};

export default PatientListPage; 