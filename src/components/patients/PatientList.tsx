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
  CircularProgress,
  TextField,
  TablePagination,
  TableSortLabel
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

type Order = 'asc' | 'desc';
type OrderBy = 'firstName' | 'lastName' | 'age' | 'gender';

const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  loading, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('firstName');

  useEffect(() => {
    const filtered = patients.filter(patient => 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.identificationNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      if (orderBy === 'firstName') {
        return order === 'asc' 
          ? a.firstName.localeCompare(b.firstName)
          : b.firstName.localeCompare(a.firstName);
      }
      if (orderBy === 'lastName') {
        return order === 'asc'
          ? a.lastName.localeCompare(b.lastName)
          : b.lastName.localeCompare(a.lastName);
      }
      if (orderBy === 'age') {
        return order === 'asc'
          ? (a.age || 0) - (b.age || 0)
          : (b.age || 0) - (a.age || 0);
      }
      return 0;
    });

    setFilteredPatients(sorted);
  }, [patients, searchTerm, order, orderBy]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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
    <Box>
      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre o identificación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
        />
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table aria-label="tabla de pacientes">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'firstName'}
                  direction={orderBy === 'firstName' ? order : 'asc'}
                  onClick={() => handleRequestSort('firstName')}
                  sx={{ 
                    '&.MuiTableSortLabel-root': { color: 'white' },
                    '&.MuiTableSortLabel-root:hover': { color: 'white' },
                    '&.Mui-active': { color: 'white' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' }
                  }}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Identificación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'age'}
                  direction={orderBy === 'age' ? order : 'asc'}
                  onClick={() => handleRequestSort('age')}
                  sx={{ 
                    '&.MuiTableSortLabel-root': { color: 'white' },
                    '&.MuiTableSortLabel-root:hover': { color: 'white' },
                    '&.Mui-active': { color: 'white' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' }
                  }}
                >
                  Edad
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'gender'}
                  direction={orderBy === 'gender' ? order : 'asc'}
                  onClick={() => handleRequestSort('gender')}
                  sx={{ 
                    '&.MuiTableSortLabel-root': { color: 'white' },
                    '&.MuiTableSortLabel-root:hover': { color: 'white' },
                    '&.Mui-active': { color: 'white' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' }
                  }}
                >
                  Género
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Typography variant="body1">
                      {`${patient.firstName} ${patient.lastName}`}
                    </Typography>
                  </TableCell>
                  <TableCell>{patient.identificationNumber || '-'}</TableCell>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count}`
          }
        />
      </TableContainer>
    </Box>
  );
};

export default PatientList; 