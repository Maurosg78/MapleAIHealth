import logger from '../services/logger';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useEMRAI } from '../hooks/useEMRAI';
import { EMRSystem, emrConfigService } from '../services/emr';
import ResponseFeedback from '../components/ai/ResponseFeedback';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';

const EMRAIContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '800px',
  margin: '0 auto',
}));

const EMRAIPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const EMRAIPage: React.FC = () => {
  const [patientId, setPatientId] = useState('P12345');
  const [emrSystem, setEmrSystem] = useState<EMRSystem>('Generic');
  const [availableSystems, setAvailableSystems] = useState<EMRSystem[]>([]);
  const [query, setQuery] = useState('');
  const [analysisType, setAnalysisType] = useState<'notes' | 'complete' | 'custom'>('notes');

  const {
    loading,
    error,
    result,
    analyzePatientNotes,
    getCompleteAnalysis,
    executeCustomPatientQuery,
    reset,
  } = useEMRAI();

  useEffect(() => {
    setAvailableSystems(emrConfigService.getConfiguredSystems());
  }, []);

  const handleSystemChange = (event: SelectChangeEvent<EMRSystem>) => {
    const selectedSystem = event.target.value as EMRSystem;
    setEmrSystem(selectedSystem);
    emrConfigService.setCurrentSystem(selectedSystem);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) return;

    try {
      switch (analysisType) {
        case 'notes':
          await analyzePatientNotes(patientId);
          break;
        case 'complete':
          await getCompleteAnalysis(patientId);
          break;
        case 'custom':
          if (!query.trim()) return;
          await executeCustomPatientQuery(patientId, query);
          break;
      }
    } catch (err) {
      logger.error('Error en el análisis:', { error: err });
    }
  };

  const handleFeedback = (feedback: { helpful: boolean; comments: string }) => {
    logger.debug('Feedback recibido:', feedback);
  };

  return (
    <EMRAIContainer>
      <Typography variant="h4" gutterBottom>
        Integración EMR-IA
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Esta página demuestra la integración entre sistemas EMR (Registro Médico
        Electrónico) y servicios de IA para análisis médico. Utiliza detección de
        intenciones para mejorar el formato de respuestas según el tipo de consulta.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2} mb={3}>
            <FormControl fullWidth>
              <TextField
                label="ID del Paciente"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Sistema EMR</InputLabel>
              <Select
                value={emrSystem}
                onChange={handleSystemChange}
                label="Sistema EMR"
              >
                {availableSystems.map((system) => (
                  <MenuItem key={system} value={system}>
                    {system}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <RadioGroup
              row
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value as 'notes' | 'complete' | 'custom')}
            >
              <FormControlLabel value="notes" control={<Radio />} label="Analizar Notas" />
              <FormControlLabel value="complete" control={<Radio />} label="Análisis Completo" />
              <FormControlLabel value="custom" control={<Radio />} label="Consulta Personalizada" />
            </RadioGroup>
          </FormControl>

          {analysisType === 'custom' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Consulta Personalizada"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 3 }}
            />
          )}

          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !patientId.trim() || (analysisType === 'custom' && !query.trim())}
            >
              {loading ? 'Procesando...' : 'Analizar Datos'}
            </Button>

            {result && (
              <Button variant="outlined" onClick={reset}>
                Nuevo Análisis
              </Button>
            )}
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      {result && (
        <EMRAIPaper>
          <Typography variant="h5" gutterBottom>
            Resultado del Análisis
          </Typography>

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Resumen
            </Typography>
            <Typography>{result.summary}</Typography>
          </Box>

          {result.insights && result.insights.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Insights
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {result.insights.map((insight, index) => (
                  <Paper key={index} sx={{ p: 2, bgcolor: 'primary.light' }}>
                    <Typography variant="subtitle1">{insight.title}</Typography>
                    <Typography variant="body2">{insight.description}</Typography>
                    <Chip
                      label={insight.severity}
                      color={
                        insight.severity === 'high' ? 'error' :
                        insight.severity === 'medium' ? 'warning' : 'success'
                      }
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          <ResponseFeedback
            response={result}
            onFeedbackSubmit={handleFeedback}
          />
        </EMRAIPaper>
      )}
    </EMRAIContainer>
  );
};

export default EMRAIPage;
