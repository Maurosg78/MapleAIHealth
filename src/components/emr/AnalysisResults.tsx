import * as React from 'react';
import { useMemo, memo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  LinearProgress,
  Alert,
  Grid,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from '@mui/material';
import {
  LocalHospital as DiagnosisIcon,
  Healing as TreatmentIcon,
  Medication as MedicationIcon,
  Science as TestIcon,
  Info as ObservationIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

interface AnalysisItem {
  id: string;
  type: 'diagnosis' | 'treatment' | 'medication' | 'test' | 'observation';
  title: string;
  description: string;
  confidence: number;
  sources?: {
    id: string;
    title: string;
    url?: string;
  }[];
  relatedTerms?: string[];
  timestamp: string;
}

interface AnalysisResultsProps {
  results: AnalysisItem[];
  isLoading?: boolean;
  onItemClick?: (item: AnalysisItem) => void;
  className?: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = memo(({
  results,
  isLoading = false,
  onItemClick,
  className = '',
}) => {
  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

  // Filtrar resultados por búsqueda y tipo
  const filteredResults = useMemo(() => {
    return results.filter(item => {
      // Filtrar por tipo
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;

      // Filtrar por término de búsqueda
      const searchMatch = searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.relatedTerms?.some(term => term.toLowerCase().includes(searchTerm.toLowerCase())));

      return typeMatch && searchMatch;
    });
  }, [results, searchTerm, typeFilter]);

  // Agrupar resultados por tipo
  const groupedResults = useMemo(() => {
    return filteredResults.reduce<Record<string, AnalysisItem[]>>((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
  }, [filteredResults]);

  // Traducir tipos de análisis
  const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      diagnosis: 'Diagnósticos',
      treatment: 'Tratamientos',
      medication: 'Medicamentos',
      test: 'Pruebas',
      observation: 'Observaciones'
    };
    return typeMap[type] || type;
  };

  // Obtener ícono según el tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return <DiagnosisIcon color="primary" />;
      case 'treatment':
        return <TreatmentIcon color="secondary" />;
      case 'medication':
        return <MedicationIcon sx={{ color: 'purple' }} />;
      case 'test':
        return <TestIcon color="success" />;
      default:
        return <ObservationIcon color="action" />;
    }
  };

  // Obtener color según nivel de confianza
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'success.main';
    if (confidence >= 0.7) return 'warning.main';
    return 'error.main';
  };

  // Manejar expansión de categorías
  const toggleTypeExpansion = (type: string) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Verificar si una categoría está expandida
  const isTypeExpanded = (type: string): boolean => {
    return expandedTypes[type] !== false; // Por defecto está expandido
  };

  // Estado de carga
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%' }} className={className}>
        <Typography variant="h6" sx={{ mb: 2 }}>Cargando resultados</Typography>
        <LinearProgress sx={{ my: 2 }} />
        <Box sx={{ pt: 1 }}>
          {[1, 2, 3].map(i => (
            <Card key={i} sx={{ mb: 2, opacity: 0.6 }}>
              <CardContent sx={{ height: 80 }}></CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    );
  }

  // Sin resultados
  if (results.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%' }} className={className}>
        <Alert severity="info">No hay resultados de análisis disponibles</Alert>
      </Paper>
    );
  }

  // Renderizado del componente con resultados
  return (
    <Paper elevation={3} sx={{ width: '100%' }} className={className}>
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Resultados del análisis</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Basado en la información médica proporcionada
        </Typography>

        {/* Filtros y búsqueda */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              placeholder="Buscar en resultados"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-filter-label">Filtrar por tipo</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                }
                label="Filtrar por tipo"
              >
                <MenuItem value="all">Todos los tipos</MenuItem>
                <MenuItem value="diagnosis">Diagnósticos</MenuItem>
                <MenuItem value="treatment">Tratamientos</MenuItem>
                <MenuItem value="medication">Medicamentos</MenuItem>
                <MenuItem value="test">Pruebas</MenuItem>
                <MenuItem value="observation">Observaciones</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {Object.keys(groupedResults).length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">No se encontraron resultados con los filtros actuales</Alert>
        </Box>
      ) : (
        <List sx={{ p: 0 }} disablePadding>
          {Object.entries(groupedResults).map(([type, items]) => (
            <Box key={type} sx={{ mb: 0.5 }}>
              {/* Encabezado de categoría */}
              <ListItem
                button
                onClick={() => toggleTypeExpansion(type)}
                sx={{
                  px: 3,
                  py: 1.5,
                  bgcolor: 'background.default'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {getTypeIcon(type)}
                  <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
                    {getTypeLabel(type)}
                  </Typography>
                  <Chip
                    label={items.length}
                    size="small"
                    sx={{ ml: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  {isTypeExpanded(type) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
              </ListItem>

              <Divider />

              {/* Lista de elementos */}
              {isTypeExpanded(type) && (
                <Box sx={{ px: 3, pt: 1, pb: 2 }}>
                  <Stack spacing={2}>
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        variant="outlined"
                      >
                        <CardActionArea onClick={() => onItemClick && onItemClick(item)}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1" component="h3" fontWeight={500}>
                                {item.title}
                              </Typography>
                              <Tooltip title={`Nivel de confianza: ${Math.round(item.confidence * 100)}%`}>
                                <Chip
                                  label={`${Math.round(item.confidence * 100)}%`}
                                  size="small"
                                  sx={{
                                    color: getConfidenceColor(item.confidence),
                                    borderColor: getConfidenceColor(item.confidence),
                                    fontWeight: 'bold'
                                  }}
                                  variant="outlined"
                                />
                              </Tooltip>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>

                            {item.relatedTerms && item.relatedTerms.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                                {item.relatedTerms.map((term, i) => (
                                  <Chip
                                    key={i}
                                    label={term}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            )}

                            {item.sources && item.sources.length > 0 && (
                              <Box sx={{ mt: 1.5 }}>
                                <Chip
                                  size="small"
                                  label={`${item.sources.length} fuentes`}
                                  color="secondary"
                                  variant="outlined"
                                />
                              </Box>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
});

AnalysisResults.displayName = 'AnalysisResults';

export default AnalysisResults;
