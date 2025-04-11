import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { ClinicalDashboard } from '../../components/dashboard';

// Contenedor principal del dashboard con estilo personalizado
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
  backgroundColor: theme.palette.mode === 'light'
    ? theme.palette.grey[50]
    : theme.palette.background.default,
  minHeight: '100vh',
}));

// Panel del dashboard con estilo personalizado
const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

// Tipos de pestañas disponibles en el dashboard
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente para el contenido de cada pestaña
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Propiedades para cada pestaña
const a11yProps = (index: number) => {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
};

// Componente principal del Dashboard
const DashboardPage: React.FC = () => {
  // Estado para manejar la pestaña seleccionada
  const [tabValue, setTabValue] = useState(0);

  // Función para cambiar entre pestañas
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Datos ficticios para las citas del día
  const todaysAppointments = [
    { id: 1, time: '09:00', patient: 'Juan Pérez', reason: 'Control mensual' },
    { id: 2, time: '10:30', patient: 'María González', reason: 'Consulta por dolor lumbar' },
    { id: 3, time: '11:15', patient: 'Carlos Rodríguez', reason: 'Resultados de laboratorio' },
    { id: 4, time: '12:00', patient: 'Ana Martínez', reason: 'Control de medicación' },
  ];

  // Datos ficticios para el resumen de pacientes
  const patientsSummary = {
    total: 256,
    active: 178,
    newToday: 3,
    pendingAnalysis: 12
  };

  // Datos ficticios para el análisis reciente
  const recentAnalysis = [
    { id: 1, patient: 'Laura Torres', type: 'Diagnóstico', date: '2023-04-09', status: 'Completado' },
    { id: 2, patient: 'Daniel García', type: 'Medicación', date: '2023-04-08', status: 'En revisión' },
    { id: 3, patient: 'Sofía Ruiz', type: 'Síntomas', date: '2023-04-08', status: 'Completado' },
  ];

  return (
    <DashboardContainer>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Panel de Control Médico
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Resumen de actividad clínica y análisis asistido por IA
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Pestañas del dashboard médico"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Principal" {...a11yProps(0)} />
          <Tab icon={<ScienceIcon />} label="Análisis Clínico" {...a11yProps(1)} />
          <Tab icon={<AccessTimeIcon />} label="Citas" {...a11yProps(2)} />
          <Tab icon={<PersonIcon />} label="Pacientes" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* Panel Principal */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <DashboardPaper>
              <Typography variant="h6" gutterBottom>
                Resumen de Actividad
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Pacientes
                      </Typography>
                      <Typography variant="h4">
                        {patientsSummary.total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Pacientes Activos
                      </Typography>
                      <Typography variant="h4">
                        {patientsSummary.active}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Nuevos Hoy
                      </Typography>
                      <Typography variant="h4">
                        {patientsSummary.newToday}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Pendientes Análisis
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {patientsSummary.pendingAnalysis}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Citas Próximas
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {todaysAppointments.map(appointment => (
                  <Card key={appointment.id} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      <Grid container alignItems="center">
                        <Grid item xs={2}>
                          <Typography variant="body2" fontWeight="bold">
                            {appointment.time}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body1">
                            {appointment.patient}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.reason}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" size="small">
                    Ver todas las citas
                  </Button>
                </Box>
              </Box>
            </DashboardPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <DashboardPaper>
              <Typography variant="h6" gutterBottom>
                Análisis Recientes de IA
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {recentAnalysis.map(analysis => (
                <Card key={analysis.id} variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.date}
                    </Typography>
                    <Typography variant="body1">
                      {analysis.patient}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        Tipo: {analysis.type}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color={analysis.status === 'Completado' ? 'success.main' : 'warning.main'}
                      >
                        {analysis.status}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" size="small">
                  Ver historial completo
                </Button>
              </Box>
            </DashboardPaper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Panel de Análisis Clínico */}
      <TabPanel value={tabValue} index={1}>
        <ClinicalDashboard />
      </TabPanel>

      {/* Panel de Citas */}
      <TabPanel value={tabValue} index={2}>
        <DashboardPaper>
          <Typography variant="h6" gutterBottom>
            Administración de Citas
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            En esta sección podrá gestionar, programar y visualizar todas las citas médicas.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        </DashboardPaper>
      </TabPanel>

      {/* Panel de Pacientes */}
      <TabPanel value={tabValue} index={3}>
        <DashboardPaper>
          <Typography variant="h6" gutterBottom>
            Gestión de Pacientes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            En esta sección podrá buscar, filtrar y gestionar la información de todos los pacientes.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        </DashboardPaper>
      </TabPanel>
    </DashboardContainer>
  );
};

export default DashboardPage;
