import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import { emrAIIntegrationService } from '../../services/integration/EMRAIIntegrationService';
import { CompleteEMRData } from '../../services/emr/types';
import { formatDate } from '../../utils/dateUtils';
import { EMRSystem } from '../../services/emr/types';

/**
 * Interfaz para las recomendaciones clínicas
 */
interface Recommendation {
  id: string;
  title: string;
  description: string;
  status?: 'accepted' | 'rejected';
  evidenceLevel?: string;
  contraindications?: string[];
}

/**
 * Interfaz para las estadísticas de recomendaciones
 */
interface RecommendationStats {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptanceRate: number;
}

/**
 * Interfaz para las propiedades del Dashboard Clínico
 */
interface DashboardProps {
  patientId: string;
  emrSystem: EMRSystem;
}

/**
 * Dashboard de Información Clínica
 * Muestra información relacionada con la evaluación de evidencia clínica
 * Optimizado con mejoras de rendimiento y accesibilidad
 */
const ClinicalDashboard: React.FC<DashboardProps> = ({ patientId, emrSystem }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<CompleteEMRData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);

  const integrationService = emrAIIntegrationService;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar datos del paciente
        const emrData = await integrationService.getPatientEMRData(patientId, emrSystem);
        setPatientData(emrData);

        // Generar recomendaciones
        const recs = await integrationService.generatePatientRecommendations(patientId, {
          emrSystem,
          includeEvidence: true,
          includeContraindications: true,
          maxSuggestions: 10,
          minConfidence: 0.6
        });
        setRecommendations(recs);

        // Cargar estadísticas
        const statsData = await integrationService.getRecommendationStats();
        setStats(statsData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos del dashboard');
        console.error('Error del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadDashboardData();
    }
  }, [patientId, emrSystem]);

  const handleAcceptRecommendation = async (recommendation: Recommendation) => {
    try {
      const accepted = [recommendation];
      await integrationService.syncAcceptedRecommendationsToEMR(patientId, accepted);

      // Actualizar la UI para reflejar que se aceptó la recomendación
      setRecommendations(prev =>
        prev.map(rec => rec.id === recommendation.id
          ? { ...rec, status: 'accepted' }
          : rec
        )
      );
    } catch (err) {
      setError(`Error al sincronizar la recomendación: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleRejectRecommendation = (recommendation: Recommendation) => {
    // Solo actualizamos el estado local para reflejar el rechazo
    setRecommendations(prev =>
      prev.map(rec => rec.id === recommendation.id
        ? { ...rec, status: 'rejected' }
        : rec
      )
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="500px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando dashboard clínico...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!patientData) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        No se pudo cargar la información del paciente.
      </Alert>
    );
  }

  const { demographics, medicalHistory, consultations } = patientData;

  // Calculamos la edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Clínico: {demographics.firstName} {demographics.lastName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ID: {patientId} | Edad: {calculateAge(demographics.birthDate)} años |
          Sistema EMR: {patientData.system}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          {/* Información básica */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Información del Paciente"
                subheader={`Última actualización: ${formatDate(new Date().toISOString())}`}
              />
              <CardContent>
                <Typography variant="body1">
                  <strong>Género:</strong> {demographics.gender || 'No especificado'}
                </Typography>
                <Typography variant="body1">
                  <strong>Dirección:</strong> {demographics.address || 'No disponible'}
                </Typography>
                <Typography variant="body1">
                  <strong>Teléfono:</strong> {demographics.phoneNumber || 'No disponible'}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {demographics.email || 'No disponible'}
                </Typography>
                <Typography variant="body1">
                  <strong>Grupo sanguíneo:</strong> {demographics.bloodType || 'No disponible'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Estadísticas de recomendaciones */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Estadísticas de Recomendaciones"
                subheader="Últimos 30 días"
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={1} bgcolor="background.paper" borderRadius={1}>
                      <Typography variant="h6">{stats?.total || 0}</Typography>
                      <Typography variant="body2">Total Recomendaciones</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={1} bgcolor="background.paper" borderRadius={1}>
                      <Typography variant="h6">{stats?.accepted || 0}</Typography>
                      <Typography variant="body2">Aceptadas</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={1} bgcolor="background.paper" borderRadius={1}>
                      <Typography variant="h6">{stats?.rejected || 0}</Typography>
                      <Typography variant="body2">Rechazadas</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={1} bgcolor="background.paper" borderRadius={1}>
                      <Typography variant="h6">{stats?.acceptanceRate || '0%'}</Typography>
                      <Typography variant="body2">Tasa de Aceptación</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Historial médico */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Historial Médico" />
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Condiciones ({medicalHistory.conditions.length})</strong>
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {medicalHistory.conditions.length > 0 ? (
                    medicalHistory.conditions.map((condition, index) => (
                      <Chip
                        key={index}
                        label={condition.name}
                        color={condition.status === 'active' ? 'error' : 'default'}
                        sx={{ m: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron condiciones médicas registradas.
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  <strong>Alergias ({medicalHistory.allergies.length})</strong>
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {medicalHistory.allergies.length > 0 ? (
                    medicalHistory.allergies.map((allergy, index) => (
                      <Chip
                        key={index}
                        label={allergy.name}
                        color="warning"
                        sx={{ m: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron alergias registradas.
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  <strong>Medicamentos ({medicalHistory.medications.length})</strong>
                </Typography>
                <Box>
                  {medicalHistory.medications.length > 0 ? (
                    medicalHistory.medications.map((med, index) => (
                      <Chip
                        key={index}
                        label={`${med.name} - ${med.dosage}`}
                        color="primary"
                        sx={{ m: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron medicamentos registrados.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recomendaciones de AI */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Recomendaciones Clínicas IA"
                subheader={`${recommendations.length} recomendaciones generadas`}
              />
              <CardContent>
                {recommendations.length > 0 ? (
                  <List>
                    {recommendations.map((rec, index) => (
                      <React.Fragment key={rec.id || index}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            bgcolor: rec.status === 'accepted' ? 'rgba(76, 175, 80, 0.1)' :
                                    rec.status === 'rejected' ? 'rgba(244, 67, 54, 0.1)' :
                                    'transparent',
                            borderRadius: 1
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {rec.title}
                                </Typography>
                                {rec.status === 'accepted' && (
                                  <CheckCircle color="success" sx={{ ml: 1 }} fontSize="small" />
                                )}
                                {rec.evidenceLevel && (
                                  <Chip
                                    label={`Evidencia: ${rec.evidenceLevel}`}
                                    size="small"
                                    color={
                                      rec.evidenceLevel === 'A' ? 'success' :
                                      rec.evidenceLevel === 'B' ? 'primary' :
                                      rec.evidenceLevel === 'C' ? 'warning' : 'error'
                                    }
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.primary">
                                  {rec.description}
                                </Typography>
                                {rec.contraindications && rec.contraindications.length > 0 && (
                                  <Box mt={1}>
                                    <Typography variant="body2" color="error" display="flex" alignItems="center">
                                      <Warning fontSize="small" sx={{ mr: 0.5 }} />
                                      Contraindicaciones: {rec.contraindications.join(', ')}
                                    </Typography>
                                  </Box>
                                )}
                                {!rec.status && (
                                  <Box mt={1}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      onClick={() => handleAcceptRecommendation(rec)}
                                      sx={{ mr: 1 }}
                                    >
                                      Aceptar
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleRejectRecommendation(rec)}
                                    >
                                      Rechazar
                                    </Button>
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        {index < recommendations.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay recomendaciones disponibles.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Últimas consultas */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Últimas Consultas"
                subheader={`${consultations?.length || 0} consultas encontradas`}
              />
              <CardContent>
                {consultations && consultations.length > 0 ? (
                  <List>
                    {consultations.slice(0, 5).map((consultation, index) => (
                      <React.Fragment key={consultation.id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1">
                                  {formatDate(consultation.date)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Dr. {consultation.provider}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.primary" paragraph>
                                  <strong>Motivo:</strong> {consultation.reason}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Notas:</strong> {consultation.notes}
                                </Typography>
                                {consultation.treatments && consultation.treatments.length > 0 && (
                                  <Box mt={1}>
                                    <Typography variant="body2">
                                      <strong>Tratamientos:</strong> {
                                        consultation.treatments.map(t => t.name).join(', ')
                                      }
                                    </Typography>
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        {index < Math.min(consultations.length - 1, 4) && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay consultas recientes disponibles.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ClinicalDashboard;
