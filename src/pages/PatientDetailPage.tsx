import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Divider, 
  CircularProgress, 
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import PatientService from '../services/PatientService';
import { Patient, PatientVisit } from '../models/Patient';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const patientService = PatientService.getInstance();

  useEffect(() => {
    if (id) {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId: string) => {
    setLoading(true);
    setError(null);

    try {
      const [patientData, visitsData] = await Promise.all([
        patientService.getPatientById(patientId),
        patientService.getPatientVisits(patientId)
      ]);

      if (patientData) {
        setPatient(patientData);
        setVisits(visitsData);
      } else {
        setError('No se pudo encontrar el paciente con el ID proporcionado.');
      }
    } catch (err) {
      console.error('Error al cargar datos del paciente:', err);
      setError('Ocurrió un error al cargar los datos del paciente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditPatient = () => {
    if (id) {
      navigate(`/pacientes/${id}/editar`);
    }
  };

  const handleBackToList = () => {
    navigate('/pacientes');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatVisitDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'male': return 'Masculino';
      case 'female': return 'Femenino';
      case 'other': return 'Otro';
      case 'prefer-not-to-say': return 'Prefiere no decir';
      default: return 'No especificado';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">No se encontró el paciente solicitado.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} sx={{ mt: 2 }}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          Volver a la lista
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<EditIcon />}
          onClick={handleEditPatient}
        >
          Editar
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4">
              {patient.firstName} {patient.lastName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                label={`${calculateAge(patient.dateOfBirth)} años`} 
                variant="outlined" 
              />
              <Chip 
                label={getGenderDisplay(patient.gender)} 
                variant="outlined" 
              />
              <Chip 
                label={`ID: ${patient.medicalRecordNumber || patient.id}`} 
                variant="outlined" 
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de nacimiento
            </Typography>
            <Typography variant="body1">
              {formatDate(patient.dateOfBirth)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Correo electrónico
            </Typography>
            <Typography variant="body1">
              {patient.email || 'No registrado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Teléfono
            </Typography>
            <Typography variant="body1">
              {patient.phone || 'No registrado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de registro
            </Typography>
            <Typography variant="body1">
              {formatDate(patient.createdAt)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="pestañas de información del paciente">
          <Tab label="Visitas" id="tab-0" />
          <Tab label="Historia clínica" id="tab-1" />
          <Tab label="Documentos" id="tab-2" />
        </Tabs>
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Historial de visitas</Typography>
            
            {visits.length > 0 ? (
              visits.map((visit) => (
                <Box 
                  key={visit.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fecha
                      </Typography>
                      <Typography variant="body1">
                        {formatVisitDate(visit.visitDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tipo
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {visit.visitType === 'initial' ? 'Inicial' :
                         visit.visitType === 'follow-up' ? 'Seguimiento' :
                         visit.visitType === 'evaluation' ? 'Evaluación' :
                         visit.visitType === 'treatment' ? 'Tratamiento' :
                         visit.visitType === 'discharge' ? 'Alta' : 
                         visit.visitType === 'consultation' ? 'Consulta' : visit.visitType}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Estado
                      </Typography>
                      <Chip 
                        label={
                          visit.status === 'scheduled' ? 'Programada' :
                          visit.status === 'checked-in' ? 'Registrado' :
                          visit.status === 'in-progress' ? 'En progreso' :
                          visit.status === 'completed' ? 'Completada' :
                          visit.status === 'cancelled' ? 'Cancelada' :
                          visit.status === 'no-show' ? 'No asistió' : visit.status
                        } 
                        color={
                          visit.status === 'completed' ? 'success' :
                          visit.status === 'in-progress' ? 'primary' :
                          visit.status === 'scheduled' ? 'info' :
                          visit.status === 'checked-in' ? 'secondary' :
                          visit.status === 'cancelled' || visit.status === 'no-show' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </Grid>
                    {visit.notes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Notas
                        </Typography>
                        <Typography variant="body2">
                          {visit.notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ))
            ) : (
              <Alert severity="info">
                No hay visitas registradas para este paciente.
              </Alert>
            )}
          </Paper>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Historia clínica</Typography>
            <Alert severity="info">
              La historia clínica completa estará disponible próximamente.
            </Alert>
          </Paper>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Documentos del paciente</Typography>
            <Alert severity="info">
              La sección de documentos estará disponible próximamente.
            </Alert>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default PatientDetailPage; 