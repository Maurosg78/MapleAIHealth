import * as React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
}));

const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const DashboardPage: React.FC = () => {
  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Panel Principal
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Resumen de Pacientes
            </Typography>
            {/* Aquí irá el contenido del resumen de pacientes */}
          </DashboardPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Citas del Día
            </Typography>
            {/* Aquí irá el contenido de las citas del día */}
          </DashboardPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Alertas y Notificaciones
            </Typography>
            {/* Aquí irá el contenido de alertas y notificaciones */}
          </DashboardPaper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default DashboardPage;
