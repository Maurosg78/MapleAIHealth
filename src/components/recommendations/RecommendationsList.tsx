import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  FormControlLabel,
  Switch,
  Stack,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClinicalRecommendationCard, {
  ClinicalRecommendationCardProps,
  RecommendationType,
  UrgencyLevel,
  EvidenceLevel
} from './ClinicalRecommendationCard';

// Definimos las propiedades para el componente
export interface RecommendationsListProps {
  recommendations: ClinicalRecommendationCardProps[];
  onRecommendationAction?: (action: string, id: string) => void;
  loading?: boolean;
  error?: string;
  patientName?: string;
}

// Definición del componente
const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  onRecommendationAction,
  loading = false,
  error,
  patientName
}) => {
  // Estado para los filtros
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [showContraindications, setShowContraindications] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Manejadores para los cambios en los filtros
  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
  };

  const handleUrgencyFilterChange = (event: SelectChangeEvent) => {
    setUrgencyFilter(event.target.value);
  };

  const handleEvidenceFilterChange = (event: SelectChangeEvent) => {
    setEvidenceFilter(event.target.value);
  };

  const handleContraindicationsToggle = () => {
    setShowContraindications(!showContraindications);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filtramos las recomendaciones según los criterios seleccionados
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      // Filtro por tipo
      if (typeFilter !== 'all' && rec.type !== typeFilter) {
        return false;
      }

      // Filtro por urgencia
      if (urgencyFilter !== 'all' && rec.urgency !== urgencyFilter) {
        return false;
      }

      // Filtro por nivel de evidencia
      if (
        evidenceFilter !== 'all' &&
        (rec.evidenceLevel !== evidenceFilter || !rec.evidenceLevel)
      ) {
        return false;
      }

      // Filtro por contraindicaciones
      if (!showContraindications && rec.contraindications?.length) {
        return false;
      }

      // Filtro por término de búsqueda
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        return (
          rec.title.toLowerCase().includes(searchLower) ||
          rec.description.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [
    recommendations,
    typeFilter,
    urgencyFilter,
    evidenceFilter,
    showContraindications,
    searchTerm
  ]);

  // Agrupamos por urgencia para mostrar primero las más críticas
  const groupedByUrgency = useMemo(() => {
    const groups: Record<UrgencyLevel, ClinicalRecommendationCardProps[]> = {
      'emergency': [],
      'urgent': [],
      'soon': [],
      'routine': []
    };

    filteredRecommendations.forEach(rec => {
      groups[rec.urgency].push(rec);
    });

    return groups;
  }, [filteredRecommendations]);

  // Función para renderizar las recomendaciones agrupadas
  const renderRecommendationGroups = () => {
    const urgencyLevels: UrgencyLevel[] = ['emergency', 'urgent', 'soon', 'routine'];

    // Mapeo de urgencia a texto en español
    const urgencyLabels: Record<UrgencyLevel, string> = {
      'emergency': 'Emergencia',
      'urgent': 'Urgente',
      'soon': 'Pronto',
      'routine': 'Rutina'
    };

    return urgencyLevels.map(level => {
      const recsInGroup = groupedByUrgency[level];

      if (recsInGroup.length === 0) {
        return null;
      }

      return (
        <Box key={level} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {urgencyLabels[level]}
            </Typography>
            <Chip
              size="small"
              label={recsInGroup.length}
              sx={{ ml: 1 }}
              color={
                level === 'emergency'
                  ? 'error'
                  : level === 'urgent'
                    ? 'warning'
                    : level === 'soon'
                      ? 'info'
                      : 'success'
              }
            />
          </Box>

          {recsInGroup.map(rec => (
            <ClinicalRecommendationCard
              key={rec.id}
              {...rec}
              onAction={onRecommendationAction}
            />
          ))}
        </Box>
      );
    });
  };

  // Renderizamos el componente
  return (
    <Box>
      {/* Cabecera */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recomendaciones Clínicas
          {patientName && (
            <Typography component="span" variant="h5" color="text.secondary" sx={{ ml: 1 }}>
              - {patientName}
            </Typography>
          )}
        </Typography>
        {recommendations.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Se encontraron {recommendations.length} recomendaciones basadas en el análisis clínico.
          </Typography>
        )}
      </Box>

      {/* Controles de filtro */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: '200px', flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: '150px' }}>
              <InputLabel id="type-filter-label">Tipo</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={typeFilter}
                label="Tipo"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="medication">Medicamentos</MenuItem>
                <MenuItem value="test">Pruebas</MenuItem>
                <MenuItem value="followUp">Seguimiento</MenuItem>
                <MenuItem value="warning">Advertencias</MenuItem>
                <MenuItem value="referral">Derivaciones</MenuItem>
                <MenuItem value="diagnostic">Diagnóstico</MenuItem>
                <MenuItem value="treatment">Tratamiento</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: '150px' }}>
              <InputLabel id="urgency-filter-label">Urgencia</InputLabel>
              <Select
                labelId="urgency-filter-label"
                id="urgency-filter"
                value={urgencyFilter}
                label="Urgencia"
                onChange={handleUrgencyFilterChange}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="emergency">Emergencia</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
                <MenuItem value="soon">Pronto</MenuItem>
                <MenuItem value="routine">Rutina</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: '150px' }}>
              <InputLabel id="evidence-filter-label">Evidencia</InputLabel>
              <Select
                labelId="evidence-filter-label"
                id="evidence-filter"
                value={evidenceFilter}
                label="Evidencia"
                onChange={handleEvidenceFilterChange}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="A">A - Alta</MenuItem>
                <MenuItem value="B">B - Moderada</MenuItem>
                <MenuItem value="C">C - Limitada</MenuItem>
                <MenuItem value="D">D - Muy baja</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showContraindications}
                  onChange={handleContraindicationsToggle}
                />
              }
              label="Mostrar con contraindicaciones"
            />

            <Typography variant="body2" color="text.secondary">
              Mostrando {filteredRecommendations.length} de {recommendations.length} recomendaciones
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Sin resultados */}
      {!loading && !error && filteredRecommendations.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Sin resultados</AlertTitle>
          {recommendations.length === 0
            ? 'No hay recomendaciones disponibles para este paciente.'
            : 'No hay recomendaciones que coincidan con los filtros seleccionados.'}
        </Alert>
      )}

      {/* Lista de recomendaciones */}
      {!loading && !error && filteredRecommendations.length > 0 && (
        <Box>{renderRecommendationGroups()}</Box>
      )}
    </Box>
  );
};

export default RecommendationsList;
