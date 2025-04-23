import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, ListItemAvatar, ListItemButton, Avatar, Checkbox, TextField, InputAdornment, Typography, Box, Divider, Chip } from '@mui/material';;;;;
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';;;;;

// Interfaces
interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  lastVisit?: string;
}

interface PatientSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPatients: (selectedPatients: string[]) => void;
  currentPatientIds: string[];
}

// Datos de ejemplo para demostración
const mockAvailablePatients: Patient[] = [
  { id: 'patient1', name: 'María García', age: 45, diagnosis: 'Lumbalgia crónica', lastVisit: '2023-02-14' },
  { id: 'patient2', name: 'Juan Pérez', age: 52, diagnosis: 'Artritis reumatoide', lastVisit: '2023-02-10' },
  { id: 'patient3', name: 'Laura Martínez', age: 37, diagnosis: 'Lesión LCA', lastVisit: '2023-02-14' },
  { id: 'patient4', name: 'Carlos Rodríguez', age: 65, diagnosis: 'Espondilosis cervical', lastVisit: '2023-01-30' },
  { id: 'patient5', name: 'Ana López', age: 42, diagnosis: 'Síndrome del túnel carpiano', lastVisit: '2023-01-25' },
  { id: 'patient6', name: 'Roberto Sánchez', age: 58, diagnosis: 'Osteoartritis', lastVisit: '2023-02-05' },
  { id: 'patient7', name: 'Patricia Gómez', age: 33, diagnosis: 'Tendinitis rotuliana', lastVisit: '2023-02-01' },
  { id: 'patient8', name: 'Miguel Torres', age: 47, diagnosis: 'Hernia discal L5-S1', lastVisit: '2023-01-28' },
  { id: 'patient9', name: 'Carmen Díaz', age: 70, diagnosis: 'Fractura de cadera (rehabilitación)', lastVisit: '2023-02-12' },
  { id: 'patient10', name: 'Francisco Martín', age: 61, diagnosis: 'Síndrome del manguito rotador', lastVisit: '2023-02-08' }
];

const PatientSelectionModal: React.FC<PatientSelectionModalProps> = ({
  open,
  onClose,
  onSelectPatients,
  currentPatientIds = []
}) => {
  // Estado para los pacientes seleccionados
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>(currentPatientIds);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Actualizar selecciones cuando cambian las props
  useEffect(() => {
    setSelectedPatientIds(currentPatientIds);
  }, [currentPatientIds, setSelectedPatientIds]);

  // Filtrar pacientes basado en el término de búsqueda
  const filteredPatients = mockAvailablePatients.filter(patient => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchTermLower) ||
      patient.diagnosis.toLowerCase().includes(searchTermLower) ||
      patient.age.toString().includes(searchTermLower)
    );
  });

  // Manejar el cambio en la selección de un paciente
  const handleTogglePatient = (patientId: string): void => {
    setSelectedPatientIds(prev => {
      if (prev.includes(patientId)) {
        return prev.filter(id => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  // Manejar cancelación
  const handleCancel = (): void => {
    setSelectedPatientIds(currentPatientIds);
    onClose();
  };

  // Manejar confirmación
  const handleConfirm = (): void => {
    onSelectPatients(selectedPatientIds);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="patient-selection-dialog-title"
    >
      <DialogTitle id="patient-selection-dialog-title">
        Seleccionar Pacientes para Comparación
      </DialogTitle>
      
      <Box sx={{ px: 3, pt: 1, pb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar pacientes por nombre, diagnóstico o edad..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ px: 3, pb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Pacientes seleccionados ({selectedPatientIds.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {selectedPatientIds.length > 0 ? (
            selectedPatientIds.map(id => {
              const patient = mockAvailablePatients.find(p => p.id === id);
              return patient ? (
                <Chip 
                  key={id}
                  label={patient.name}
                  onDelete={() => handleTogglePatient(id)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : null;
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              No hay pacientes seleccionados
            </Typography>
          )}
        </Box>
      </Box>
      
      <Divider />
      
      <DialogContent sx={{ pt: 1 }}>
        <List sx={{ width: '100%' }}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => {
              const isSelected = selectedPatientIds.includes(patient.id);
              
              return (
                <ListItem 
                  key={patient.id}
                  disablePadding
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={isSelected}
                      onChange={() => handleTogglePatient(patient.id)}
                      inputProps={{ 'aria-labelledby': `patient-selection-${patient.id}` }}
                    />
                  }
                >
                  <ListItemButton onClick={() => handleTogglePatient(patient.id)}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      id={`patient-selection-${patient.id}`}
                      primary={patient.name}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {patient.age} años
                          </Typography>
                          {" — "}{patient.diagnosis}
                          {patient.lastVisit && (
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: 'block', fontSize: '0.75rem' }}
                            >
                              Última visita: {new Date(patient.lastVisit).toLocaleDateString()}
                            </Typography>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron pacientes con el término de búsqueda
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel}>Cancelar</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
        >
          Confirmar Selección
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientSelectionModal; 