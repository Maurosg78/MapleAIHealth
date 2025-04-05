import * as React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface PatientType {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
}

const PatientsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = React.useState<PatientType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadPatients = async () => {
      try {
        // Simulación de API
        await new Promise(resolve => setTimeout(resolve, 1000));

        setPatients([
          {
            id: '1',
            firstName: 'Juan',
            lastName: 'Pérez',
            dateOfBirth: '1985-05-15',
            email: 'juan@example.com',
            phone: '555-123-4567',
          },
          {
            id: '2',
            firstName: 'María',
            lastName: 'González',
            dateOfBirth: '1990-10-20',
            email: 'maria@example.com',
          },
        ]);
        setIsLoading(false);
      } catch {
        setError('Error al cargar pacientes');
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <PatientsContainer>
      <Typography variant="h4" gutterBottom>
        Pacientes
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Fecha Nacimiento</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.firstName}</TableCell>
                <TableCell>{patient.lastName}</TableCell>
                <TableCell>{patient.dateOfBirth}</TableCell>
                <TableCell>{patient.email ?? '-'}</TableCell>
                <TableCell>{patient.phone ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {patients.length === 0 && (
        <Box mt={3}>
          <Typography>No hay pacientes registrados.</Typography>
        </Box>
      )}
    </PatientsContainer>
  );
};

export default PatientsPage;
