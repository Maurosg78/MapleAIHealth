import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField, 
  SelectChangeEvent
} from '@mui/material';
import { AIAssistantChat } from '../components/assistant/AIAssistantChat';
import { MedicalSpecialty } from '../services/ai/types';

/**
 * Página de demostración para probar el asistente clínico
 */
export const AssistantDemoPage: React.FC = () => {
  const [specialty, setSpecialty] = useState<MedicalSpecialty>('physiotherapy');
  const [patientId, setPatientId] = useState('DEMO-001');
  const [activeSection, setActiveSection] = useState('SOAP - Subjective');
  
  const handleSpecialtyChange = (event: SelectChangeEvent) => {
    setSpecialty(event.target.value as MedicalSpecialty);
  };
  
  const handleSectionChange = (event: SelectChangeEvent) => {
    setActiveSection(event.target.value);
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        AIDUX Assistant Demo
      </Typography>
      
      <Typography variant="body1" paragraph align="center" color="text.secondary">
        Esta demostración te permite interactuar con el asistente clínico de AIDUX 
        en diferentes contextos y especialidades médicas.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Configuración
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="specialty-label">Especialidad</InputLabel>
              <Select
                labelId="specialty-label"
                value={specialty}
                label="Especialidad"
                onChange={handleSpecialtyChange}
              >
                <MenuItem value="physiotherapy">Fisioterapia</MenuItem>
                <MenuItem value="general_medicine">Medicina General</MenuItem>
                <MenuItem value="traumatology">Traumatología</MenuItem>
                <MenuItem value="neurology">Neurología</MenuItem>
                <MenuItem value="cardiology">Cardiología</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <TextField
                label="ID de Paciente"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                helperText="ID ficticio para el contexto del paciente"
              />
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="section-label">Sección Activa</InputLabel>
              <Select
                labelId="section-label"
                value={activeSection}
                label="Sección Activa"
                onChange={handleSectionChange}
              >
                <MenuItem value="SOAP - Subjective">SOAP - Subjetivo</MenuItem>
                <MenuItem value="SOAP - Objective">SOAP - Objetivo</MenuItem>
                <MenuItem value="SOAP - Assessment">SOAP - Evaluación</MenuItem>
                <MenuItem value="SOAP - Plan">SOAP - Plan</MenuItem>
                <MenuItem value="Exercises">Ejercicios Terapéuticos</MenuItem>
                <MenuItem value="Diagnostics">Diagnóstico</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Sugerencias para probar
              </Typography>
              
              <Typography variant="body2" component="div">
                <ul>
                  <li>¿Qué ejercicios recomiendas para lumbalgia crónica?</li>
                  <li>¿Cuáles son las señales de alerta (banderas rojas) en dolor cervical?</li>
                  <li>¿Cómo debería estructurar la evaluación objetiva para un paciente con tendinitis?</li>
                  <li>¿Puedes sugerir indicadores de progreso para un plan de rehabilitación de rodilla?</li>
                </ul>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ height: 600 }}>
            <AIAssistantChat 
              patientId={patientId}
              specialty={specialty}
              activeSection={activeSection}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}; 