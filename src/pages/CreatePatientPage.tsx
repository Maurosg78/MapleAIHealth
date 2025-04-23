import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';;;;;
import { useNavigate } from 'react-router-dom';;;;;
import PatientForm from '../components/patients/PatientForm';
import { Patient } from '../models/Patient';;;;;

const CreatePatientPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSave = (patient: Patient): void => {
    navigate(`/pacientes/${patient.id}`);
  };
  
  const handleCancel = (): void => {
    navigate('/pacientes');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9fafe' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Nuevo Paciente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete el formulario para crear un nuevo registro de paciente.
          </Typography>
        </Paper>
      </Box>
      
      <PatientForm 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    </Container>
  );
};

export default CreatePatientPage; 