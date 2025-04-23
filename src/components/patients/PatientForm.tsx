import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Paper, Divider, Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';;;;;
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';;;;;
import { Patient } from '../../models/Patient';;;;;
import PatientService from '../../services/PatientService';

interface PatientFormProps {
  patientId?: string;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patientId, onSave, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    email: '',
    phone: '',
    medicalRecordNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
      expirationDate: ''
    }
  });
  
  const patientService = PatientService.getInstance();
  
  // Cargar datos del paciente si estamos en modo edición
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const patient = await patientService.getPatientById(patientId);
        if (patient) {
          // Asegurarse de que los objetos anidados estén inicializados
          const preparedPatient = {
            ...patient,
            address: patient.address || {
              street: '',
              city: '',
              state: '',
              zip: '',
              country: ''
            },
            emergencyContact: patient.emergencyContact || {
              name: '',
              relationship: '',
              phone: ''
            },
            insuranceInfo: patient.insuranceInfo || {
              provider: '',
              policyNumber: '',
              groupNumber: '',
              expirationDate: ''
            }
          };
          setFormData(preparedPatient);
        } else {
          setError('No se encontró el paciente especificado');
        }
      } catch (err) {
        console.error('Error al cargar paciente:', err);
        setError('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [patientId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    // Manejar campos anidados (address, emergencyContact, insuranceInfo)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Patient],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    try {
      let savedPatient: Patient | null;
      
      if (patientId) {
        // Modo edición
        savedPatient = await patientService.updatePatient(patientId, formData);
      } else {
        // Modo creación
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender) {
          throw new Error('Por favor complete todos los campos obligatorios');
        }
        
        // Utilizamos un cast ya que estamos validando los campos requeridos
        savedPatient = await patientService.createPatient(formData as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      if (savedPatient) {
        setSuccess(true);
        setTimeout(() => {
          onSave(savedPatient as Patient);
        }, 1000);
      } else {
        setError('Error al guardar el paciente');
      }
    } catch (err) {
      console.error('Error al guardar paciente:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !formData.id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {patientId ? 'Editar Paciente' : 'Crear Nuevo Paciente'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Paciente guardado exitosamente
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Información personal */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Información Personal
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Nombre"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              variant="outlined"
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Apellido"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              variant="outlined"
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Fecha de Nacimiento"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Género</FormLabel>
              <RadioGroup
                row
                name="gender"
                value={formData.gender || 'prefer-not-to-say'}
                onChange={handleChange}
              >
                <FormControlLabel value="male" control={<Radio />} label="Masculino" />
                <FormControlLabel value="female" control={<Radio />} label="Femenino" />
                <FormControlLabel value="other" control={<Radio />} label="Otro" />
                <FormControlLabel value="prefer-not-to-say" control={<Radio />} label="Prefiero no decir" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          {/* Información de contacto */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Información de Contacto
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              variant="outlined"
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              variant="outlined"
              disabled={loading}
            />
          </Grid>
          
          {/* Dirección */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">Dirección</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Calle y número"
                      name="address.street"
                      value={formData.address?.street || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ciudad"
                      name="address.city"
                      value={formData.address?.city || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Estado/Provincia"
                      name="address.state"
                      value={formData.address?.state || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Código Postal"
                      name="address.zip"
                      value={formData.address?.zip || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="País"
                      name="address.country"
                      value={formData.address?.country || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          
          {/* Contacto de emergencia */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">Contacto de Emergencia</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      name="emergencyContact.name"
                      value={formData.emergencyContact?.name || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Relación"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact?.phone || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          
          {/* Información de Seguro */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">Información de Seguro Médico</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Proveedor"
                      name="insuranceInfo.provider"
                      value={formData.insuranceInfo?.provider || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Número de Póliza"
                      name="insuranceInfo.policyNumber"
                      value={formData.insuranceInfo?.policyNumber || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Número de Grupo"
                      name="insuranceInfo.groupNumber"
                      value={formData.insuranceInfo?.groupNumber || ''}
                      onChange={handleChange}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Expiración"
                      name="insuranceInfo.expirationDate"
                      type="date"
                      value={formData.insuranceInfo?.expirationDate || ''}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          
          {/* Información médica */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Información Médica
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Número de Historia Clínica"
              name="medicalRecordNumber"
              value={formData.medicalRecordNumber || ''}
              onChange={handleChange}
              variant="outlined"
              disabled={loading}
            />
          </Grid>
          
          {/* Botones de acción */}
          <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Guardando...
                </>
              ) : patientId ? 'Actualizar' : 'Crear'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PatientForm; 