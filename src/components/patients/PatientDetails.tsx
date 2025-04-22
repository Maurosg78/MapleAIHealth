import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInteractionTracking } from '../../hooks/useInteractionTracking';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface PatientDetailsProps {
  patient: {
    id: string;
    name: string;
    // ... otros campos del paciente
  };
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient }) => {
  const { patientId } = useParams<{ patientId: string }>();
  const { 
    trackView, 
    trackUpdate,
    trackPrint,
    trackAIAssist 
  } = useInteractionTracking('patient_details');
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiQuery, setAIQuery] = useState('');

  useEffect(() => {
    if (patientId) {
      trackView(patient.name, patientId);
    }
  }, [patientId, trackView, patient.name]);

  const handleUpdatePatient = async (data: Record<string, unknown>) => {
    try {
      // Lógica de actualización existente...
      await trackUpdate(patient.name, patientId || '', { updatedFields: Object.keys(data) });
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
    }
  };

  const handlePrintRecord = async () => {
    try {
      await trackPrint(patientId || '', 'medical_record');
      // Lógica de impresión existente...
    } catch (error) {
      console.error('Error al imprimir registro:', error);
    }
  };

  const handleAIAssistance = async (query: string) => {
    try {
      // Lógica del asistente IA existente...
      await trackAIAssist(query, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      await trackAIAssist(query, false, errorMessage);
      console.error('Error con asistente IA:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalles del Paciente: {patient.name}
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUpdatePatient({})}
            >
              Actualizar Datos
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintRecord}
            >
              Imprimir Registro
            </Button>
            <Button
              variant="outlined"
              startIcon={<SmartToyIcon />}
              onClick={() => setIsAIDialogOpen(true)}
            >
              Asistente IA
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={isAIDialogOpen} onClose={() => setIsAIDialogOpen(false)}>
        <DialogTitle>Asistente IA</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="¿Qué deseas consultar?"
            type="text"
            fullWidth
            variant="outlined"
            value={aiQuery}
            onChange={(e) => setAIQuery(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAIDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              handleAIAssistance(aiQuery);
              setIsAIDialogOpen(false);
              setAIQuery('');
            }}
          >
            Consultar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 