import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar
} from '@mui/material';
import {
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { EMRAdapterFactory, emrConfigService } from '../../services/emr';
import {
  PatientData,
  EMRConsultation as EMRConsultationType,
  EMRMedication,
  EMRLabResult,
  EMRCondition,
  EMRSystem,
  EMRMedicalHistory
} from '../../services/emr/types';

// Interfaz de propiedades del componente
interface EMRPatientInfoProps {
  patientId: string;
  emrSystem?: EMRSystem;
  onError?: (error: string) => void;
  className?: string;
}

// Definimos un tipo personalizado para combinar datos de la historia con las consultas
interface MedicalData {
  patientId: string;
  medicalHistory: EMRMedicalHistory;
  consultations: EMRConsultationType[];
}

// Interfaz de panel de pestaña
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente para el panel de pestañas
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`emr-tabpanel-${index}`}
      aria-labelledby={`emr-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * Componente para mostrar información detallada de un paciente en EMR
 * Permite visualizar la información demográfica, historial médico, medicamentos, etc.
 */
const EMRPatientInfo: React.FC<EMRPatientInfoProps> = ({
  patientId,
  emrSystem,
  onError,
  className
}) => {
  // Estado para los datos del paciente
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  // Estado para historia clínica
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null);

  // Estado para indicar si está cargando
  const [loading, setLoading] = useState(true);

  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState(0);

  // Cargar datos del paciente
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determinar el sistema EMR a usar
        const system = emrSystem || emrConfigService.getCurrentSystem();
        const config = emrConfigService.getConfig(system);

        // Obtener adaptador
        const adapter = await EMRAdapterFactory.getAdapter(system, config);

        // Verificar conexión
        const connected = await adapter.testConnection();
        if (!connected) {
          throw new Error(`No se pudo conectar al sistema EMR ${system}`);
        }

        // Obtener datos del paciente
        const patient = await adapter.getPatientData(patientId);
        setPatientData(patient);

        // Obtener historial médico
        const history = await adapter.getPatientHistory(patientId);

        // Transformar los datos para usarlos en la interfaz
        const completeData: MedicalData = {
          patientId: history.patientId,
          // Convertimos los datos al formato esperado por la interfaz
          medicalHistory: {
            conditions: history.diagnoses?.map(d => ({
              name: d.description,
              status: (d.status === 'active' || d.status === 'inactive' || d.status === 'resolved')
                ? d.status
                : 'inactive',
              diagnosisDate: d.date?.toISOString().split('T')[0]
            })) || [],
            allergies: [], // No tenemos alergias en la historia del paciente
            medications: [], // No tenemos medicamentos en la historia del paciente
            procedures: [], // No tenemos procedimientos en la historia del paciente
            labResults: history.labResults?.map(lr => ({
              name: lr.name,
              date: lr.date?.toISOString().split('T')[0] || '',
              value: typeof lr.results === 'string' ? lr.results : JSON.stringify(lr.results),
              unit: lr.units,
              normalRange: lr.range,
              isAbnormal: lr.abnormal
            }))
          },
          consultations: history.consultations.map(c => ({
            id: c.id,
            patientId: c.patientId,
            date: c.date?.toISOString().split('T')[0] || '',
            notes: c.notes,
            status: 'completed' // Asumimos que las consultas están completadas
          }))
        };

        setMedicalData(completeData);
      } catch (err) {
        console.error('Error al cargar datos del paciente', err);
        const errorMsg = `Error al cargar datos del paciente: ${err instanceof Error ? err.message : 'Error desconocido'}`;
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadPatientData();
    }
  }, [patientId, emrSystem, onError]);

  // Manejar cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }} className={className}>
        <CircularProgress />
      </Box>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }} className={className}>
        {error}
      </Alert>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!patientData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }} className={className}>
        No se encontró información para el paciente con ID {patientId}
      </Alert>
    );
  }

  // Calcular edad
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }} className={className}>
      {/* Información básica del paciente */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h2">
              {patientData.firstName} {patientData.lastName}
            </Typography>
            <Box sx={{ display: 'flex', mt: 0.5, gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                ID: {patientData.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Edad: {calculateAge(patientData.dateOfBirth)} años
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Género: {patientData.gender === 'male' ? 'Masculino' : patientData.gender === 'female' ? 'Femenino' : patientData.gender}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha de nacimiento: {formatDate(patientData.dateOfBirth)}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Button variant="contained" startIcon={<MedicalIcon />}>
              Consulta
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Pestañas de información */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Pestañas de información del paciente"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Resumen" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Historia Clínica" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Medicamentos" icon={<MedicationIcon />} iconPosition="start" />
            <Tab label="Resultados" icon={<ScienceIcon />} iconPosition="start" />
            <Tab label="Consultas" icon={<HospitalIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Panel de Resumen */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información de Contacto
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    <strong>Email:</strong> {patientData.email || 'No disponible'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Teléfono:</strong> {patientData.phone || 'No disponible'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Dirección:</strong> {patientData.address || 'No disponible'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Condiciones Activas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {medicalData && medicalData.medicalHistory.conditions && medicalData.medicalHistory.conditions.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {medicalData.medicalHistory.conditions.map((condition: EMRCondition, index: number) => (
                        <Chip
                          key={index}
                          label={condition.name}
                          color={condition.status === 'active' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No hay condiciones registradas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Alergias
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {medicalData && medicalData.medicalHistory.allergies && medicalData.medicalHistory.allergies.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {medicalData.medicalHistory.allergies.map((allergy: string, index: number) => (
                        <Chip
                          key={index}
                          label={allergy}
                          color="error"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No hay alergias registradas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Panel de Historia Clínica */}
        <TabPanel value={activeTab} index={1}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial Médico
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {medicalData && medicalData.consultations && medicalData.consultations.length > 0 ? (
                <List>
                  {medicalData.consultations.map((consultation: EMRConsultationType, index) => (
                    <ListItem key={consultation.id || index} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <MedicalIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={formatDate(consultation.date)}
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {consultation.notes}
                          </Typography>
                        }
                      />
                      <Chip
                        label={consultation.status}
                        color={consultation.status === 'completed' ? 'success' : 'info'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No hay historial médico registrado
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Panel de Medicamentos */}
        <TabPanel value={activeTab} index={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medicamentos Actuales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {medicalData && medicalData.medicalHistory.medications && medicalData.medicalHistory.medications.length > 0 ? (
                <List>
                  {medicalData.medicalHistory.medications.map((medication: EMRMedication, index: number) => (
                    <ListItem key={index} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <MedicationIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={medication.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {medication.dosage}, {medication.frequency}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Desde: {formatDate(medication.startDate)}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={medication.active ? 'Activo' : 'Inactivo'}
                        color={medication.active ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No hay medicamentos registrados
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Panel de Resultados */}
        <TabPanel value={activeTab} index={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resultados de Laboratorio
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {medicalData && medicalData.medicalHistory.labResults && medicalData.medicalHistory.labResults.length > 0 ? (
                <Grid container spacing={2}>
                  {medicalData.medicalHistory.labResults.map((result: EMRLabResult, index: number) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {result.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Fecha: {formatDate(result.date)}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">
                              {result.value} {result.unit}
                            </Typography>
                            {result.isAbnormal && (
                              <Chip
                                label="Anormal"
                                color="warning"
                                size="small"
                              />
                            )}
                          </Box>
                          {result.normalRange && (
                            <Typography variant="body2" color="text.secondary">
                              Rango normal: {result.normalRange}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No hay resultados de laboratorio registrados
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Panel de Consultas */}
        <TabPanel value={activeTab} index={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial de Consultas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {medicalData && medicalData.consultations && medicalData.consultations.length > 0 ? (
                <List>
                  {medicalData.consultations.map((consultation: EMRConsultationType, index) => (
                    <ListItem key={consultation.id || index} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <HospitalIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {formatDate(consultation.date)}
                            </Typography>
                          </Box>
                        }
                        secondary={consultation.notes}
                      />
                      <Button variant="outlined" size="small">
                        Ver detalle
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No hay consultas registradas
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default EMRPatientInfo;
