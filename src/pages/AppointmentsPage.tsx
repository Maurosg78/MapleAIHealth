import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';

const AppointmentsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
}));

const AppointmentsPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

interface Appointment {
  id: number;
  paciente: string;
  fecha: string;
  hora: string;
  tipo: string;
  estado: 'Programada' | 'Completada' | 'Cancelada';
}

const AppointmentsPage: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [newAppointment, setNewAppointment] = React.useState({
    paciente: '',
    fecha: '',
    hora: '',
    tipo: ''
  });
  const [appointments, setAppointments] = React.useState<Appointment[]>([
    {
      id: 1,
      paciente: 'Juan Pérez',
      fecha: '2024-03-25',
      hora: '09:00',
      tipo: 'Consulta General',
      estado: 'Programada'
    },
    {
      id: 2,
      paciente: 'María González',
      fecha: '2024-03-25',
      hora: '10:30',
      tipo: 'Control',
      estado: 'Programada'
    }
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    const newId = Math.max(...appointments.map(a => a.id)) + 1;
    setAppointments([
      ...appointments,
      {
        id: newId,
        ...newAppointment,
        estado: 'Programada'
      }
    ]);
    setOpen(false);
    setNewAppointment({ paciente: '', fecha: '', hora: '', tipo: '' });
  };

  return (
    <AppointmentsContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Gestión de Citas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Nueva Cita
        </Button>
      </Box>

      <AppointmentsPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Paciente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.paciente}</TableCell>
                  <TableCell>{appointment.fecha}</TableCell>
                  <TableCell>{appointment.hora}</TableCell>
                  <TableCell>{appointment.tipo}</TableCell>
                  <TableCell>{appointment.estado}</TableCell>
                  <TableCell>
                    <Button size="small" color="primary">
                      Editar
                    </Button>
                    <Button size="small" color="error">
                      Cancelar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AppointmentsPaper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Nueva Cita</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Paciente"
                variant="outlined"
                value={newAppointment.paciente}
                onChange={(e) => setNewAppointment({...newAppointment, paciente: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={newAppointment.fecha}
                onChange={(e) => setNewAppointment({...newAppointment, fecha: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora"
                type="time"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={newAppointment.hora}
                onChange={(e) => setNewAppointment({...newAppointment, hora: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tipo de Cita"
                variant="outlined"
                value={newAppointment.tipo}
                onChange={(e) => setNewAppointment({...newAppointment, tipo: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </AppointmentsContainer>
  );
};

export default AppointmentsPage;
