import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Typography, 
  Box, 
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Patient } from '../../models/Patient';

interface PatientListProps {
  patients: Patient[];
  loading: boolean;
  onEdit?: (patient: Patient) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  loading, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients);

  useEffect(() => {
    setFilteredPatients(patients);
  }, [patients]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (patients.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No se encontraron pacientes
        </Typography>
        <Box mt={2}>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/patients/new"
            startIcon={<SearchIcon />}
          >
            Buscar pacientes
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table aria-label="tabla de pacientes">
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Identificación</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Edad</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Género</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow key={patient.id} hover>
              <TableCell>
                <Typography variant="body1">
                  {`${patient.firstName} ${patient.lastName}`}
                </Typography>
              </TableCell>
              <TableCell>{patient.identificationNumber}</TableCell>
              <TableCell>{patient.age || '-'}</TableCell>
              <TableCell>{patient.gender || '-'}</TableCell>
              <TableCell>
                <Chip 
                  label={patient.active ? 'Activo' : 'Inactivo'} 
                  color={patient.active ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {onView && (
                    <Tooltip title="Ver detalles">
                      <IconButton 
                        color="info" 
                        size="small" 
                        onClick={() => onView(patient.id)}
                        component={Link}
                        to={`/patients/${patient.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onEdit && (
                    <Tooltip title="Editar">
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => onEdit(patient)}
                        component={Link}
                        to={`/patients/${patient.id}/edit`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onDelete && (
                    <Tooltip title="Eliminar">
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => onDelete(patient.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PatientList; 