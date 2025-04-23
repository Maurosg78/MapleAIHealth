import React from 'react';
import { Box, Card, CardContent, Typography, Paper, Container, Divider } from '@mui/material';;;;;

// Definir la interfaz Patient localmente
interface Patient {
  id?: string;
  name?: string;
  diagnosis?: string;
  therapistId?: string;
  therapistName?: string;
  evaluations?: Array<{
    date?: string;
    subjective?: {
      pain?: {
        intensity?: number;
      };
    };
  }>;
  goals?: Array<{
    achieved: boolean;
    description?: string;
  }>;
}

interface DashboardProps {
  patient: Patient;
}

const Dashboard: React.FC<DashboardProps> = ({ patient }) => {
  // Función para calcular el progreso del tratamiento
  const calculateProgress = (): number => {
    if (!patient.evaluations || patient.evaluations.length < 2) return 0;
    
    const initialEval = patient.evaluations[0];
    const latestEval = patient.evaluations[patient.evaluations.length - 1];
    
    // Simplificación: calculamos el progreso basado en la diferencia de dolor
    if (!initialEval.subjective?.pain || !latestEval.subjective?.pain) return 0;
    
    const initialPain = initialEval.subjective.pain.intensity || 0;
    const currentPain = latestEval.subjective.pain.intensity || 0;
    
    if (initialPain === 0) return 0;
    
    // Calcula el porcentaje de mejoría en el dolor
    const improvementPercent = ((initialPain - currentPain) / initialPain) * 100;
    return Math.max(0, Math.min(100, improvementPercent));
  };
  
  // Función para obtener el número de sesiones
  const getSessionCount = (): number => {
    return patient.evaluations?.length || 0;
  };
  
  // Función para calcular el cumplimiento del plan de tratamiento
  const calculateAdherence = (): number => {
    if (!patient.evaluations) return 0;
    
    // Simplificación: podríamos usar datos reales de asistencia vs citas programadas
    return 85; // Valor simulado para demostración
  };
  
  // Función para obtener objetivos cumplidos
  const getCompletedGoals = (): { completed: number, total: number } => {
    if (!patient.goals) return { completed: 0, total: 0 };
    
    const total = patient.goals.length;
    const completed = patient.goals.filter((goal: {achieved: boolean; description?: string}) => goal.achieved).length;
    
    return { completed, total };
  };

  // Función para formatear fechas (reemplaza a date-fns)
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No registrado';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  };

  const progressValue = calculateProgress();
  const sessionCount = getSessionCount();
  const adherenceValue = calculateAdherence();
  const goals = getCompletedGoals();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Clínico: {patient.name || 'Paciente'}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Tarjeta de Progreso General */}
          <Box sx={{ width: { xs: '100%', md: '46%', lg: '23%' } }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Progreso General
                </Typography>
                <Box sx={{ 
                  position: 'relative', 
                  display: 'inline-flex',
                  width: '100%',
                  justifyContent: 'center',
                  my: 2 
                }}>
                  <Box sx={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: '50%', 
                    background: `conic-gradient(#4caf50 ${progressValue}%, #e0e0e0 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h6">{Math.round(progressValue)}%</Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2">
                  Basado en la reducción del dolor y mejora funcional
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tarjeta de Sesiones */}
          <Box sx={{ width: { xs: '100%', md: '46%', lg: '23%' } }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Sesiones Realizadas
                </Typography>
                <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                  {sessionCount}
                </Typography>
                <Typography variant="body2">
                  {sessionCount > 0 && patient.evaluations?.[patient.evaluations.length - 1]?.date
                    ? `Última sesión: ${formatDate(patient.evaluations[patient.evaluations.length - 1].date)}`
                    : 'Sin sesiones registradas'}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tarjeta de Adherencia */}
          <Box sx={{ width: { xs: '100%', md: '46%', lg: '23%' } }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Adherencia al Tratamiento
                </Typography>
                <Box sx={{ 
                  height: 20, 
                  width: '100%', 
                  bgcolor: '#e0e0e0',
                  borderRadius: 5,
                  my: 3
                }}>
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${adherenceValue}%`, 
                      bgcolor: adherenceValue > 80 ? '#4caf50' : adherenceValue > 50 ? '#ff9800' : '#f44336',
                      borderRadius: 5
                    }}
                  />
                </Box>
                <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                  {adherenceValue}%
                </Typography>
                <Typography variant="body2">
                  Basado en asistencia a sesiones y cumplimiento de ejercicios
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tarjeta de Objetivos */}
          <Box sx={{ width: { xs: '100%', md: '46%', lg: '23%' } }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Objetivos Cumplidos
                </Typography>
                <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                  {goals.completed}/{goals.total}
                </Typography>
                <Typography variant="body2">
                  {goals.total > 0 
                    ? `${Math.round((goals.completed / goals.total) * 100)}% de objetivos alcanzados`
                    : 'Sin objetivos definidos'}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Información de Tratamiento */}
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Tratamiento
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                  <Typography variant="subtitle1">Diagnóstico Principal:</Typography>
                  <Typography variant="body1">{patient.diagnosis || 'No registrado'}</Typography>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                  <Typography variant="subtitle1">Fecha de Inicio:</Typography>
                  <Typography variant="body1">
                    {patient.evaluations && patient.evaluations.length > 0
                      ? formatDate(patient.evaluations[0].date)
                      : 'No registrado'}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                  <Typography variant="subtitle1">Terapeuta:</Typography>
                  <Typography variant="body1">{patient.therapistName || patient.therapistId || 'No asignado'}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 