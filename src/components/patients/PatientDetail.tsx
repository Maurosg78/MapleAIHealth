import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';;;;;
import { Box, Typography, Paper, Grid, Chip, Button, Tabs, Tab, IconButton, Avatar, CircularProgress, Card, CardContent, CardHeader, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';;;;;
import { Person as PersonIcon, Edit as EditIcon, Email as EmailIcon, Phone as PhoneIcon, Event as EventIcon, Assignment as NoteIcon } from '@mui/icons-material';;;;;
import { Patient, PatientVisit } from '../../models/Patient';;;;;
import PatientService from '../../services/PatientService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente para el panel de pestañas
const TabPanel = (props: TabPanelProps): void => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!id) return;

    const patientService = PatientService.getInstance();
    
    // Cargar datos del paciente
    Promise.all([
      patientService.getPatientById(id),
      patientService.getPatientVisits(id)
    ])
      .then(([patientData, visitsData]) => {
        setPatient(patientData);
        setVisits(visitsData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al cargar datos del paciente:', error);
        setLoading(false);
      });
  }, [id]);

  // Manejar cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  // Calcular edad a partir de la fecha de nacimiento
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Traducir género
  const translateGender = (gender: string): string => {
    switch (gender) {
      case 'male':
        return 'Masculino';
      case 'female':
        return 'Femenino';
      case 'other':
        return 'Otro';
      case 'prefer-not-to-say':
        return 'Prefiere no decir';
      default:
        return gender;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" color="text.secondary">
          Paciente no encontrado
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/patients')}
          sx={{ mt: 2 }}
        >
          Volver a la lista de pacientes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Encabezado con información básica del paciente */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {patient.firstName} {patient.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  icon={<CalendarIcon />}
                  label={`${calculateAge(patient.dateOfBirth)} años`}
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  icon={<PersonIcon />}
                  label={translateGender(patient.gender)}
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                {patient.medicalRecordNumber && (
                  <Chip 
                    icon={<MedicalIcon />}
                    label={`HC: ${patient.medicalRecordNumber}`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/patients/${id}/edit`)}
          >
            Editar Paciente
          </Button>
        </Box>
      </Paper>

      {/* Pestañas de navegación */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="patient tabs">
            <Tab label="Información General" id="patient-tab-0" aria-controls="patient-tabpanel-0" />
            <Tab label="Visitas" id="patient-tab-1" aria-controls="patient-tabpanel-1" />
            <Tab label="Documentos Clínicos" id="patient-tab-2" aria-controls="patient-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Panel de Información General */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Información de Contacto" />
                <CardContent>
                  <List>
                    {patient.email && (
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={patient.email} 
                        />
                      </ListItem>
                    )}
                    {patient.phone && (
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Teléfono" 
                          secondary={patient.phone} 
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Fecha de Nacimiento" 
                        secondary={formatDate(patient.dateOfBirth)} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {patient.address && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Dirección" />
                  <CardContent>
                    <Typography variant="body1">
                      {patient.address.street && `${patient.address.street}`}
                      {patient.address.city && `, ${patient.address.city}`}
                      {patient.address.state && `, ${patient.address.state}`}
                      {patient.address.zip && ` ${patient.address.zip}`}
                      {patient.address.country && `, ${patient.address.country}`}
                      {!patient.address.street && !patient.address.city && 
                       !patient.address.state && !patient.address.zip && 
                       !patient.address.country && 'No hay información de dirección disponible'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {patient.emergencyContact && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Contacto de Emergencia" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Nombre" 
                          secondary={patient.emergencyContact.name} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Teléfono" 
                          secondary={patient.emergencyContact.phone} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Relación" 
                          secondary={patient.emergencyContact.relationship} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {patient.insuranceInfo && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Información de Seguro" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <HospitalIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Proveedor" 
                          secondary={patient.insuranceInfo.provider} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Número de Póliza" 
                          secondary={patient.insuranceInfo.policyNumber} 
                        />
                      </ListItem>
                      {patient.insuranceInfo.groupNumber && (
                        <ListItem>
                          <ListItemText 
                            primary="Número de Grupo" 
                            secondary={patient.insuranceInfo.groupNumber} 
                          />
                        </ListItem>
                      )}
                      {patient.insuranceInfo.expirationDate && (
                        <ListItem>
                          <ListItemIcon>
                            <CalendarIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Fecha de Expiración" 
                            secondary={formatDate(patient.insuranceInfo.expirationDate)} 
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Panel de Visitas */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Historial de Visitas
            </Typography>
            <Button
              variant="contained"
              startIcon={<EventIcon />}
              onClick={() => navigate(`/patients/${id}/schedule`)}
            >
              Programar Nueva Visita
            </Button>
          </Box>

          {visits.length > 0 ? (
            <List>
              {visits.sort((a, b) => 
                new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
              ).map((visit, index) => (
                <React.Fragment key={visit.id}>
                  <Paper sx={{ mb: 2 }}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="view visit"
                          onClick={() => navigate(`/visits/${visit.id}`)}
                        >
                          <NoteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 
                          visit.status === 'completed' ? 'success.main' : 
                          visit.status === 'scheduled' ? 'info.main' : 
                          visit.status === 'cancelled' ? 'error.main' : 
                          'warning.main' 
                        }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {new Date(visit.visitDate).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                            <Chip
                              label={
                                visit.status === 'completed' ? 'Completada' :
                                visit.status === 'scheduled' ? 'Programada' :
                                visit.status === 'cancelled' ? 'Cancelada' :
                                visit.status === 'no-show' ? 'No Asistió' :
                                visit.status === 'in-progress' ? 'En Progreso' :
                                visit.status === 'checked-in' ? 'Registrado' :
                                visit.status
                              }
                              size="small"
                              color={
                                visit.status === 'completed' ? 'success' :
                                visit.status === 'scheduled' ? 'primary' :
                                visit.status === 'cancelled' ? 'error' :
                                visit.status === 'no-show' ? 'error' :
                                visit.status === 'in-progress' ? 'warning' :
                                visit.status === 'checked-in' ? 'info' :
                                'default'
                              }
                              sx={{ ml: 2 }}
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {visit.visitType === 'initial' ? 'Evaluación Inicial' :
                               visit.visitType === 'follow-up' ? 'Seguimiento' :
                               visit.visitType === 'evaluation' ? 'Evaluación' :
                               visit.visitType === 'treatment' ? 'Tratamiento' :
                               visit.visitType === 'discharge' ? 'Alta' :
                               visit.visitType === 'consultation' ? 'Consulta' :
                               visit.visitType}
                              {visit.specialty && ` - ${visit.specialty.charAt(0).toUpperCase() + visit.specialty.slice(1)}`}
                            </Typography>
                            {visit.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {visit.notes}
                              </Typography>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  </Paper>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="text.secondary">
                No hay visitas registradas para este paciente
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Panel de Documentos Clínicos */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="text.secondary">
              No hay documentos clínicos disponibles para este paciente
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Crear Nuevo Documento
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default PatientDetail; 