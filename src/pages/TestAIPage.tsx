import logger from '../services/logger';
import * as React from 'react';
import { useState } from 'react';
import { useAIQuery } from '../hooks/useAIQuery';
import ResponseFeedback from '../components/ai/ResponseFeedback';
import { AIResponse } from '../services/ai';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

const TestContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '800px',
  margin: '0 auto',
}));

const TestPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const TestAIPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [patientId, setPatientId] = useState('P12345');
  const { loading, error, result, executeQuery, reset } = useAIQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await executeQuery({
      query,
      patientId,
      context: {
        type: 'general',
        data: {
          content: query
        }
      },
    });
  };

  const handleFeedback = (feedback: { helpful: boolean; comments: string }) => {
    logger.debug('Feedback recibido:', feedback);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  return (
    <TestContainer>
      <Typography variant="h4" gutterBottom>
        Prueba del Servicio de IA
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="ID del Paciente"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Consulta Médica"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            multiline
            rows={4}
            margin="normal"
          />

          <Box display="flex" gap={2} mt={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !query.trim()}
            >
              {loading ? 'Procesando...' : 'Enviar Consulta'}
            </Button>

            {result && (
              <Button
                variant="outlined"
                onClick={reset}
              >
                Nueva Consulta
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error.message}</Typography>
        </Paper>
      )}

      {result && (
        <TestPaper>
          <Typography variant="h5" gutterBottom>
            Respuesta
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
              <List>
                {result.insights.map((insight, index) => (
                  <ListItem key={index} sx={{ bgcolor: 'primary.light', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={insight.title}
                      secondary={insight.description}
                    />
                    <Chip
                      label={insight.severity}
                      color={getSeverityColor(insight.severity)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Recomendaciones
              </Typography>
              <List>
                {result.recommendations.map((rec, index) => (
                  <ListItem key={index} sx={{ bgcolor: 'success.light', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={rec.title}
                      secondary={rec.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <ResponseFeedback
            response={result as AIResponse}
            onFeedbackSubmit={handleFeedback}
          />
        </TestPaper>
      )}
    </TestContainer>
  );
};

export default TestAIPage;
