import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Slider, IconButton, Divider, Chip, Collapse, SelectChangeEvent } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent): void => {
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

  const handleAgeRangeChange = (_event: Event, newValue: number | number[]): void => {
    if (Array.isArray(newValue)) {
      const [ageMin, ageMax] = newValue;
      setFilters(prev => ({
        ...prev,
        ageMin,
        ageMax
      }));
    }
  };

  const handleLastVisitAfterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

  const handleLastVisitBeforeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

  const getGenderText = (gender: string): string => {
    switch (gender) {
      case 'male':
        return 'Masculino';
      case 'female':
        return 'Femenino';
      default:
        return 'Otro';
    }
  };

  const applyFilters = (): void => {
    const newActiveFilters: string[] = [];
    
    if (filters.query) {
      newActiveFilters.push(`Búsqueda: ${filters.query}`);
    }
    if (filters.gender) {
      newActiveFilters.push(`Género: ${getGenderText(filters.gender)}`);
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

  const clearFilters = (): void => {
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

  const removeFilter = (filterToRemove: string): void => {
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

  useEffect(() => {
    if (filters.lastVisitAfter && !lastVisitAfterStr) {
      setLastVisitAfterStr(filters.lastVisitAfter);
    }
    if (filters.lastVisitBefore && !lastVisitBeforeStr) {
      setLastVisitBeforeStr(filters.lastVisitBefore);
    }
  }, [filters.lastVisitAfter, filters.lastVisitBefore, lastVisitAfterStr, lastVisitBeforeStr]);

  const generateFilterId = (filter: string): string => {
    return `filter-${filter.toLowerCase().replace(/\s+/g, '-')}`;
  };

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
          {activeFilters.map((filter) => (
            <Chip
              key={generateFilterId(filter)}
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
              name="query"
              label="Buscar paciente"
              value={filters.query ?? ''}
              onChange={handleInputChange}
              size="small"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="gender-label">Género</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={filters.gender ?? ''}
                onChange={handleSelectChange}
                label="Género"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="male">Masculino</MenuItem>
                <MenuItem value="female">Femenino</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ width: '100%' }}>
              <Typography gutterBottom>
                Rango de edad: {filters.ageMin ?? 0} - {filters.ageMax ?? 100}
              </Typography>
              <Slider
                value={[filters.ageMin ?? 0, filters.ageMax ?? 100]}
                onChange={handleAgeRangeChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              name="lastVisitAfter"
              label="Visita después de"
              value={lastVisitAfterStr}
              onChange={handleLastVisitAfterChange}
              size="small"
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              name="lastVisitBefore"
              label="Visita antes de"
              value={lastVisitBeforeStr}
              onChange={handleLastVisitBeforeChange}
              size="small"
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={applyFilters}
                startIcon={<SearchIcon />}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<CloseIcon />}
                disabled={loading}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSearchPanel; 