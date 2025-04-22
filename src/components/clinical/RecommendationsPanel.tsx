import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import RecommendationService from '../../services/RecommendationService';

interface Recommendation {
  id: string;
  type: 'info' | 'warning' | 'alert';
  title: string;
  description: string;
  priority: number;
  source: string;
  timestamp: Date;
}

interface RecommendationsPanelProps {
  patientId: string;
  context?: {
    age?: number;
    gender?: string;
    conditions?: string[];
    medications?: string[];
    lastVisit?: Date;
    visitCount?: number;
  };
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  patientId,
  context = {}
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const recommendationService = RecommendationService.getInstance();
        const results = await recommendationService.getRecommendations(patientId, context);
        setRecommendations(results);
      } catch (err) {
        console.error('Error al cargar recomendaciones:', err);
        setError('No se pudieron cargar las recomendaciones');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [patientId, context]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'alert':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'visit_history':
        return 'primary';
      case 'medical_history':
        return 'secondary';
      case 'medications':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hay recomendaciones disponibles para este paciente.
      </Alert>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recomendaciones Clínicas
      </Typography>
      
      <List>
        {recommendations.map((rec) => (
          <ListItem
            key={rec.id}
            sx={{
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <ListItemIcon>
              {getIcon(rec.type)}
            </ListItemIcon>
            <ListItemText
              primary={rec.title}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {rec.description}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip
                      label={rec.source}
                      size="small"
                      color={getSourceColor(rec.source)}
                      variant="outlined"
                    />
                    <Chip
                      label={new Date(rec.timestamp).toLocaleString()}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RecommendationsPanel; 