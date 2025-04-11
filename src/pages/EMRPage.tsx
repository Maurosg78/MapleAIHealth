import * as React from 'react';
import { useState } from 'react';
import { Box, Container, Typography, Divider, Paper } from '@mui/material';
import { EMRPatientSearch, EMRPatientInfo } from '../components/emr';
import { EMRPatientSearchResult } from '../services/emr/interfaces/EMRAdapter';

/**
 * Página principal del sistema EMR
 * Integra la búsqueda y visualización de información de pacientes
 */
const EMRPage: React.FC = () => {
  // Estado para el paciente seleccionado
  const [selectedPatient, setSelectedPatient] = useState<EMRPatientSearchResult | null>(null);

  // Manejar la selección de un paciente desde la búsqueda
  const handleSelectPatient = (patient: EMRPatientSearchResult) => {
    setSelectedPatient(patient);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sistema de Historial Clínico Electrónico
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Busque pacientes y visualice su información médica completa.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Componente de búsqueda de pacientes */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Búsqueda de Pacientes
        </Typography>
        <EMRPatientSearch onSelectPatient={handleSelectPatient} displayInline />
      </Paper>

      {/* Información del paciente (visible solo cuando hay un paciente seleccionado) */}
      {selectedPatient && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Información del Paciente
          </Typography>
          <EMRPatientInfo patientId={selectedPatient.id} />
        </Box>
      )}
    </Container>
  );
};

export default EMRPage;
