import React from 'react';
import ClinicalDashboard from '../components/clinical/ClinicalDashboard';
import { Typography, Box, Container, Paper } from '@mui/material';;;;;

const ClinicalDashboardPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ mb: 4, p: 2, backgroundColor: '#f9fafe' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard de Información Clínica
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Accede a toda la información relevante y estadísticas del sistema clínico en tiempo real
          </Typography>
        </Paper>
        
        <ClinicalDashboard />
      </Box>
    </Container>
  );
};

export default ClinicalDashboardPage; 