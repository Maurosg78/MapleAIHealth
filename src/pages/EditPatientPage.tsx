import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';;;;;
import { useNavigate, useParams } from 'react-router-dom';;;;;
import PatientForm from '../components/patients/PatientForm';
import { Patient } from '../models/Patient';;;;;
import { PatientService } from '../services/PatientService';;;;;

const EditPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  
  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) {
        setError('ID de paciente no proporcionado');
        setLoading(false);
        return;
      }
      
      try {
        const patientService = PatientService.getInstance();
        const fetchedPatient = await patientService.getPatientById(id);
        
        if (fetchedPatient) {
          setPatient(fetchedPatient);
        } else {
          setError('No se encontró el paciente solicitado');
        }
      } catch (err) {
        console.error('Error al cargar paciente:', err);
        setError('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [id]);
  
  const handleSave = (patient: Patient): void => {
    navigate(`/pacientes/${patient.id}`);
  };
  
  const handleCancel = (): void => {
    navigate(`/pacientes/${id}`);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando datos del paciente...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9fafe' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Editar Paciente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Actualice la información del paciente.
          </Typography>
        </Paper>
      </Box>
      
      {patient && (
        <PatientForm 
          patientId={id}
          onSave={handleSave} 
          onCancel={handleCancel} 
        />
      )}
    </Container>
  );
};

export default EditPatientPage; 