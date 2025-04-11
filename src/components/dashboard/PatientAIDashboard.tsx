import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Divider,
  useTheme,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { RecommendationsList } from '../recommendations';
import { EMRSystem, CompleteEMRData } from '../../services/emr';
import { emrAIIntegrationService } from '../../services/integration/EMRAIIntegrationService';
import { ClinicalSuggestion, UrgencyLevel } from '../../services/ai/ClinicalCopilotService';
import { ClinicalRecommendationCardProps, RecommendationType, EvidenceLevel } from '../recommendations/ClinicalRecommendationCard';

// Propiedades para el dashboard
interface PatientAIDashboardProps {
  patientId: string;
  emrSystem?: EMRSystem;
}

// Interfaz para panel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente TabPanel
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`clinical-tabpanel-${index}`}
      aria-labelledby={`clinical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Función para propiedades de accesibilidad de tabs
function a11yProps(index: number) {
  return {
    id: `clinical-tab-${index}`,
    'aria-controls': `clinical-tabpanel-${index}`,
  };
}

// Componente principal del dashboard
const PatientAIDashboard: React.FC<PatientAIDashboardProps> = ({
  patientId,
  emrSystem
}) => {
  const theme = useTheme();

  // Estados
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<CompleteEMRData | null>(null);
  const [recommendations, setRecommendations] = useState<ClinicalRecommendationCardProps[]>([]);

  // Manejador para cambio de tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Transformar sugerencias a formato de componente
  const transformSuggestions = useCallback((suggestions: ClinicalSuggestion[]): ClinicalRecommendationCardProps[] => {
    return suggestions.map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description || '',
      type: suggestion.type as RecommendationType,
      urgency: suggestion.urgency as UrgencyLevel,
      confidence: suggestion.confidence,
      evidenceLevel: suggestion.evidenceLevel as EvidenceLevel,
      sources: suggestion.sources?.map(source => ({
        id: source.id,
        title: source.title,
        publication: source.publication,
        year: source.year,
        verified: source.verified
      })),
      contraindications: suggestion.contraindications?.map(c => ({
        id: c.id || `c-${Math.random().toString(36).substr(2, 9)}`,
        description: c.description,
        severity: c.severity
      }))
    }));
  }, []);

  // Cargar datos del paciente
  const loadPatientData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener datos del EMR
      const emrData = await emrAIIntegrationService.getPatientEMRData(patientId, emrSystem);
      setPatientData(emrData);

      // Obtener recomendaciones
      const suggestions = await emrAIIntegrationService.generatePatientRecommendations(
        patientId,
        {
          emrSystem,
          includeEvidence: true,
          includeContraindications: true,
          maxSuggestions: 10,
          minConfidence: 0.7
        }
      );

      setRecommendations(transformSuggestions(suggestions));
    } catch (err) {
      setError(`Error cargando datos del paciente: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading patient data:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, emrSystem, transformSuggestions]);

  // Efecto para cargar datos al inicio
  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Manejador para acciones en recomendaciones
  const handleRecommendationAction = (action: string, id: string) => {
    console.log(`Action: ${action}, Recommendation ID: ${id}`);
    // Aquí se implementarían acciones reales como marcar como aplicada,
    // rechazar, solicitar más información, etc.
  };

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular edad
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Renderiza los datos del paciente
  const renderPatientInfo = () => {
    if (!patientData) return null;

    const { demographics, patientId } = patientData;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Información Personal</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Nombre completo</Typography>
                <Typography variant="body1" gutterBottom>
                  {demographics.name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Identificación</Typography>
                <Typography variant="body1" gutterBottom>
                  {patientId}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Edad</Typography>
                <Typography variant="body1" gutterBottom>
                  {calculateAge(demographics.dob)} años
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Sexo</Typography>
                <Typography variant="body1" gutterBottom>
                  {demographics.sex === 'male' ? 'Masculino' :
                   demographics.sex === 'female' ? 'Femenino' : 'Otro'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Fecha de Nacimiento</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(demographics.dob)}
                </Typography>
              </Grid>

              {demographics.language && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Idioma</Typography>
                  <Typography variant="body1" gutterBottom>
                    {demographics.language}
                  </Typography>
                </Grid>
              )}

              {demographics.ethnicity && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Etnia</Typography>
                  <Typography variant="body1" gutterBottom>
                    {demographics.ethnicity}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospitalIcon sx={{ mr: 1, color: theme.palette.error.main }} />
              <Typography variant="h6">Resumen Médico</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2">Condiciones activas</Typography>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {patientData.medicalHistory.conditions
                .filter(c => c.status === 'active')
                .map((condition, index) => (
                  <Chip
                    key={`condition-${index}`}
                    label={condition.name}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              {patientData.medicalHistory.conditions.filter(c => c.status === 'active').length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hay condiciones activas registradas
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle2">Alergias</Typography>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {patientData.medicalHistory.allergies.map((allergy, index) => (
                <Chip
                  key={`allergy-${index}`}
                  label={allergy}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              ))}
              {patientData.medicalHistory.allergies.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No se registran alergias
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle2">Medicación Actual</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {patientData.medicalHistory.medications
                .filter(m => m.active)
                .map((medication, index) => (
                  <Chip
                    key={`med-${index}`}
                    label={`${medication.name} ${medication.dosage}`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                ))}
              {patientData.medicalHistory.medications.filter(m => m.active).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hay medicamentos activos registrados
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Renderiza el historial médico
  const renderMedicalHistory = () => {
    if (!patientData) return null;

    const { medicalHistory } = patientData;

    return (
      <Grid container spacing={3}>
        {/* Procedimientos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="h6">Procedimientos</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {medicalHistory.procedures.length > 0 ? (
                medicalHistory.procedures.map((procedure, index) => (
                  <Paper
                    key={`procedure-${index}`}
                    elevation={1}
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Typography variant="subtitle1">
                      {procedure.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {formatDate(procedure.date)}
                    </Typography>
                    {procedure.provider && (
                      <Typography variant="body2" color="text.secondary">
                        Proveedor: {procedure.provider}
                      </Typography>
                    )}
                    {procedure.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {procedure.notes}
                      </Typography>
                    )}
                    {procedure.status && (
                      <Chip
                        size="small"
                        label={procedure.status}
                        color={
                          procedure.status === 'completed' ? 'success' :
                          procedure.status === 'active' ? 'primary' :
                          procedure.status === 'cancelled' ? 'error' : 'default'
                        }
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay procedimientos registrados
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resultados de laboratorio */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                <Typography variant="h6">Resultados de Laboratorio</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {medicalHistory.labResults && medicalHistory.labResults.length > 0 ? (
                medicalHistory.labResults.map((lab, index) => (
                  <Paper
                    key={`lab-${index}`}
                    elevation={1}
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Typography variant="subtitle1">
                      {lab.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {formatDate(lab.date)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: lab.isAbnormal ? theme.palette.error.main : 'inherit',
                          fontWeight: lab.isAbnormal ? 'bold' : 'normal'
                        }}
                      >
                        Valor: {lab.value} {lab.unit}
                      </Typography>

                      {lab.isAbnormal && (
                        <Chip
                          size="small"
                          label="Anormal"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>

                    {lab.normalRange && (
                      <Typography variant="body2" color="text.secondary">
                        Rango normal: {lab.normalRange}
                      </Typography>
                    )}

                    {lab.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {lab.notes}
                      </Typography>
                    )}
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay resultados de laboratorio registrados
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Consultas médicas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="h6">Consultas Médicas</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {patientData.consultations && patientData.consultations.length > 0 ? (
                patientData.consultations.map((consultation, index) => (
                  <Paper
                    key={`consultation-${index}`}
                    elevation={1}
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Consulta del {formatDate(consultation.date)}
                      </Typography>
                      <Chip
                        size="small"
                        label={consultation.status}
                        color={
                          consultation.status === 'completed' ? 'success' :
                          consultation.status === 'active' ? 'primary' :
                          consultation.status === 'cancelled' ? 'error' : 'default'
                        }
                      />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {consultation.notes}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay consultas registradas
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Vista principal
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabecera */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard Clínico
            {patientData && (
              <Typography
                component="span"
                variant="h4"
                color="text.secondary"
                sx={{ ml: 1, fontWeight: 'normal' }}
              >
                - {patientData.demographics.name}
              </Typography>
            )}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadPatientData()}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>

        {/* Estado de carga o error */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Tabs de navegación */}
        {!loading && !error && patientData && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="dashboard tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Información del Paciente" {...a11yProps(0)} />
                <Tab label="Historial Médico" {...a11yProps(1)} />
                <Tab label="Recomendaciones" {...a11yProps(2)} />
              </Tabs>
            </Box>

            {/* Contenido de las tabs */}
            <TabPanel value={tabValue} index={0}>
              {renderPatientInfo()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {renderMedicalHistory()}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <RecommendationsList
                recommendations={recommendations}
                patientName={patientData.demographics.name}
                onRecommendationAction={handleRecommendationAction}
                loading={false}
                error={null}
              />
            </TabPanel>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PatientAIDashboard;
