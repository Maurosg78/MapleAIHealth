import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
  Divider,
  Chip,
  Collapse,
  SelectChangeEvent
} from '@mui/material';
import { Search as SearchIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

interface SearchFilters {
  query?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  lastVisitAfter?: string;
  lastVisitBefore?: string;
  orderBy?: 'name' | 'age' | 'lastVisit';
  orderDirection?: 'asc' | 'desc';
}

interface AdvancedSearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({ 
  onSearch,
  loading = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    gender: '',
    ageMin: 0,
    ageMax: 100,
    orderBy: 'name',
    orderDirection: 'asc'
  });
  const [lastVisitAfterStr, setLastVisitAfterStr] = useState('');
  const [lastVisitBeforeStr, setLastVisitBeforeStr] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'orderBy') {
      setFilters(prev => ({ 
        ...prev, 
        [name]: value as 'name' | 'age' | 'lastVisit' 
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAgeRangeChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const [ageMin, ageMax] = newValue;
      setFilters(prev => ({
        ...prev,
        ageMin,
        ageMax
      }));
    }
  };

  const handleLastVisitAfterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastVisitAfterStr(value);
    setFilters(prev => {
      if (value) {
        return { ...prev, lastVisitAfter: value };
      } else {
        const { lastVisitAfter, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleLastVisitBeforeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastVisitBeforeStr(value);
    setFilters(prev => {
      if (value) {
        return { ...prev, lastVisitBefore: value };
      } else {
        const { lastVisitBefore, ...rest } = prev;
        return rest;
      }
    });
  };

  const applyFilters = () => {
    const newActiveFilters: string[] = [];
    
    if (filters.query) {
      newActiveFilters.push(`Búsqueda: ${filters.query}`);
    }
    if (filters.gender) {
      const genderText = filters.gender === 'male' ? 'Masculino' : 
                        filters.gender === 'female' ? 'Femenino' : 'Otro';
      newActiveFilters.push(`Género: ${genderText}`);
    }
    if (filters.ageMin !== 0 || filters.ageMax !== 100) {
      newActiveFilters.push(`Edad: ${filters.ageMin}-${filters.ageMax}`);
    }
    if (filters.lastVisitAfter) {
      newActiveFilters.push(`Visita después de: ${lastVisitAfterStr}`);
    }
    if (filters.lastVisitBefore) {
      newActiveFilters.push(`Visita antes de: ${lastVisitBeforeStr}`);
    }
    
    setActiveFilters(newActiveFilters);
    onSearch({...filters});
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      gender: '',
      ageMin: 0,
      ageMax: 100,
      orderBy: 'name',
      orderDirection: 'asc'
    });
    
    setLastVisitAfterStr('');
    setLastVisitBeforeStr('');
    setActiveFilters([]);
    onSearch({});
  };

  const removeFilter = (filterToRemove: string) => {
    const newActiveFilters = activeFilters.filter(filter => filter !== filterToRemove);
    setActiveFilters(newActiveFilters);

    const newFilters = {...filters} as SearchFilters;

    if (filterToRemove.startsWith('Búsqueda:')) {
      newFilters.query = '';
    } else if (filterToRemove.startsWith('Género:')) {
      newFilters.gender = '';
    } else if (filterToRemove.startsWith('Edad:')) {
      newFilters.ageMin = 0;
      newFilters.ageMax = 100;
    } else if (filterToRemove.startsWith('Visita después de:')) {
      setLastVisitAfterStr('');
      delete newFilters.lastVisitAfter;
    } else if (filterToRemove.startsWith('Visita antes de:')) {
      setLastVisitBeforeStr('');
      delete newFilters.lastVisitBefore;
    }

    setFilters(newFilters);
    onSearch(newFilters);
  };

  // Sincronizar los campos de fecha con el estado de filtros al inicializar
  useEffect(() => {
    if (filters.lastVisitAfter && !lastVisitAfterStr) {
      setLastVisitAfterStr(filters.lastVisitAfter);
    }
    if (filters.lastVisitBefore && !lastVisitBeforeStr) {
      setLastVisitBeforeStr(filters.lastVisitBefore);
    }
  }, [filters.lastVisitAfter, filters.lastVisitBefore, lastVisitAfterStr, lastVisitBeforeStr]);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Búsqueda avanzada</Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {activeFilters.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {activeFilters.map((filter, index) => (
            <Chip
              key={index}
              label={filter}
              onDelete={() => removeFilter(filter)}
              color="primary"
              variant="outlined"
            />
          ))}
          <Chip
            label="Limpiar todos"
            onClick={clearFilters}
            color="secondary"
          />
        </Box>
      )}

      <Collapse in={expanded}>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Buscar pacientes"
              name="query"
              value={filters.query || ''}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: (
                  <SearchIcon color="action" />
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="gender-select-label">Género</InputLabel>
              <Select
                labelId="gender-select-label"
                name="gender"
                value={filters.gender || ''}
                label="Género"
                onChange={handleSelectChange}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="male">Masculino</MenuItem>
                <MenuItem value="female">Femenino</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography gutterBottom>Rango de edad</Typography>
              <Slider
                value={[filters.ageMin || 0, filters.ageMax || 100]}
                onChange={handleAgeRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                sx={{ width: '100%' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">{filters.ageMin || 0} años</Typography>
                <Typography variant="caption">{filters.ageMax || 100} años</Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Última visita después de"
              type="date"
              value={lastVisitAfterStr}
              onChange={handleLastVisitAfterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Última visita antes de"
              type="date"
              value={lastVisitBeforeStr}
              onChange={handleLastVisitBeforeChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="sort-select-label">Ordenar por</InputLabel>
              <Select
                labelId="sort-select-label"
                name="orderBy"
                value={filters.orderBy || 'name'}
                label="Ordenar por"
                onChange={handleSelectChange}
              >
                <MenuItem value="name">Nombre</MenuItem>
                <MenuItem value="age">Edad</MenuItem>
                <MenuItem value="lastVisit">Última visita</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={applyFilters}
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{ mr: 1 }}
            >
              Aplicar filtros
            </Button>
            <Button
              variant="outlined"
              onClick={clearFilters}
              disabled={loading}
              startIcon={<CloseIcon />}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSearchPanel; 