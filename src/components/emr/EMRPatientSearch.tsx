import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  ArrowForwardIos as ArrowIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { EMRAdapterFactory, EMRSystem, emrConfigService } from '../../services/emr';
import { EMRPatientSearchResult, EMRSearchQuery } from '../../services/emr/interfaces/EMRAdapter';

// Propiedades del componente de búsqueda
interface EMRPatientSearchProps {
  onSelectPatient?: (patient: EMRPatientSearchResult) => void;
  displayInline?: boolean;
  className?: string;
}

/**
 * Componente de búsqueda de pacientes en sistemas EMR
 * Permite buscar pacientes en cualquier sistema EMR conectado y visualizar información básica sobre ellos
 */
const EMRPatientSearch: React.FC<EMRPatientSearchProps> = ({
  onSelectPatient,
  displayInline = false,
  className = ''
}) => {
  // Estado para la cadena de búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para los pacientes encontrados
  const [patients, setPatients] = useState<EMRPatientSearchResult[]>([]);

  // Estado para indicar si está cargando
  const [loading, setLoading] = useState(false);

  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // Estado para el sistema EMR seleccionado
  const [selectedSystem, setSelectedSystem] = useState<EMRSystem | ''>('');

  // Estado para indicar si hay resultados
  const [hasSearched, setHasSearched] = useState(false);

  // Obtener sistemas EMR disponibles
  const [availableSystems, setAvailableSystems] = useState<EMRSystem[]>([]);

  // Cargar sistemas EMR disponibles
  useEffect(() => {
    const loadSystems = async () => {
      try {
        // Obtener los sistemas EMR configurados
        const systems = Object.keys(emrConfigService.getAllConfigs()) as EMRSystem[];
        setAvailableSystems(systems);

        // Si hay sistemas disponibles, seleccionar el primero por defecto
        if (systems.length > 0) {
          setSelectedSystem(systems[0]);
        }
      } catch (err) {
        console.error('Error al cargar sistemas EMR disponibles', err);
        setError('No se pudieron cargar los sistemas EMR disponibles');
      }
    };

    loadSystems();
  }, []);

  // Función para buscar pacientes
  const searchPatients = useCallback(async () => {
    if (!searchQuery.trim() || !selectedSystem) {
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const config = emrConfigService.getConfig(selectedSystem as EMRSystem);
      const adapter = await EMRAdapterFactory.getAdapter(selectedSystem as EMRSystem, config);

      // Verificar conexión
      const connected = await adapter.testConnection();
      if (!connected) {
        throw new Error(`No se pudo conectar al sistema EMR ${selectedSystem}`);
      }

      // Crear objeto de búsqueda
      const searchCriteria: EMRSearchQuery = {};

      // Determinar si es un ID, nombre, o email basado en el formato de la consulta
      if (searchQuery.includes('@')) {
        searchCriteria.email = searchQuery;
      } else if (/^\d+$/.test(searchQuery)) {
        searchCriteria.documentId = searchQuery;
      } else {
        searchCriteria.name = searchQuery;
      }

      // Realizar búsqueda
      const results = await adapter.searchPatients(searchCriteria);
      setPatients(results);

      if (results.length === 0) {
        setError(`No se encontraron pacientes para "${searchQuery}"`);
      }
    } catch (err) {
      console.error('Error al buscar pacientes', err);
      setError(`Error al buscar pacientes: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSystem]);

  // Función para manejar el submit del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPatients();
  };

  // Función para manejar la selección de un paciente
  const handleSelectPatient = (patient: EMRPatientSearchResult) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
  };

  // Función para limpiar la búsqueda
  const handleClear = () => {
    setSearchQuery('');
    setPatients([]);
    setError(null);
    setHasSearched(false);
  };

  // Función para formatear la edad
  const formatAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return `${age} años`;
  };

  // Renderizar el contenido principal
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (patients.length === 0) {
      if (hasSearched) {
        return (
          <Alert severity="info" sx={{ mt: 2 }}>
            No se encontraron pacientes para "{searchQuery}"
          </Alert>
        );
      }

      // Si no ha realizado búsqueda, no mostrar nada
      return null;
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
        {patients.map((patient, index) => (
          <React.Fragment key={patient.id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" aria-label="ver paciente" onClick={() => handleSelectPatient(patient)}>
                  <ArrowIcon />
                </IconButton>
              }
              sx={{ cursor: 'pointer' }}
              onClick={() => handleSelectPatient(patient)}
            >
              <ListItemAvatar>
                <Avatar alt={patient.fullName || `${patient.name}`}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {patient.fullName || patient.name}
                    </Typography>
                    {patient.gender && (
                      <Chip
                        size="small"
                        label={patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : patient.gender}
                        color={patient.gender === 'male' ? 'info' : patient.gender === 'female' ? 'secondary' : 'default'}
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      ID: {patient.id}
                    </Typography>
                    {patient.birthDate && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Edad: {formatAge(patient.birthDate)}
                      </Typography>
                    )}
                    {patient.contactInfo?.phone && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Tel: {patient.contactInfo.phone}
                      </Typography>
                    )}
                    <Box sx={{ mt: 0.5 }}>
                      {patient.mrn && (
                        <Chip
                          size="small"
                          label={`MRN: ${patient.mrn}`}
                          sx={{ mr: 1, mt: 0.5 }}
                        />
                      )}
                      {patient.contactInfo?.email && (
                        <Chip
                          size="small"
                          label={patient.contactInfo.email}
                          variant="outlined"
                          sx={{ mr: 1, mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </>
                }
              />
            </ListItem>
            {index < patients.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const containerSx = displayInline
    ? {}
    : { p: 3, mt: 2, width: '100%', maxWidth: 800, mx: 'auto' };

  return (
    <Paper elevation={displayInline ? 0 : 3} sx={containerSx} className={className}>
      {!displayInline && (
        <Typography variant="h6" gutterBottom>
          Búsqueda de Pacientes EMR
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="emr-system-select-label">Sistema EMR</InputLabel>
            <Select
              labelId="emr-system-select-label"
              value={selectedSystem}
              label="Sistema EMR"
              onChange={(e) => setSelectedSystem(e.target.value as EMRSystem)}
              disabled={loading || availableSystems.length === 0}
            >
              {availableSystems.length === 0 ? (
                <MenuItem value="">No hay sistemas disponibles</MenuItem>
              ) : (
                availableSystems.map((system) => (
                  <MenuItem key={system} value={system}>
                    {system}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Buscar paciente"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nombre, ID o MRN del paciente"
            variant="outlined"
            size="small"
            disabled={loading || !selectedSystem}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="limpiar búsqueda"
                    onClick={handleClear}
                    edge="end"
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            variant="contained"
            onClick={searchPatients}
            disabled={loading || !searchQuery.trim() || !selectedSystem}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            Buscar
          </Button>

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            disabled={loading}
          >
            Filtros
          </Button>
        </Box>
      </Box>

      {renderContent()}
    </Paper>
  );
};

export default EMRPatientSearch;
