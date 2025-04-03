import { 
   useState, useEffect 
 } from "react"
  Card,
import { 
   Button, Input, Select, Modal, Spinner 
 } from "@chakra-ui/react"
  CardContent,
import { 
  AIResponse,
  TimelineEvent,
  Insight,
  Recommendation,
 } from '../../services/ai/types'
import { 
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';

interface AnalysisResultsProps {
  response: AIResponse;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ response }) => {
  const renderTimeline = (timeline: {
    date: string;
    events: TimelineEvent[];
  }) => (
    <Box key={timeline.date} sx={{ mb: 2 }}>
      <Typography variant="subtitle1" color="primary">
        {new Date(timeline.date).toLocaleDateString()}
      </Typography>
      <List>
        {timeline.events.map((event: TimelineEvent) => (
          <ListItem key={`${event.type}-${event.description}`}>
            <ListItemText primary={event.type} secondary={event.description} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderInsights = (insight: Insight) => (
    <ListItem key={`${insight.type}-${insight.description}`}>
      <ListItemText
        primary={
          <Typography variant="subtitle1" color="error">
            {insight.type}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2">{insight.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              Severidad: {insight.severity}
            </Typography>
            {insight.evidence && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Evidencia:
                </Typography>
                <List dense>
                  {insight.evidence.map((evidence: string) => (
                    <ListItem key={evidence}>
                      <ListItemText primary={evidence} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        }
      />
    </ListItem>
  );

  const renderRecommendations = (recommendation: Recommendation) => (
    <ListItem key={`${recommendation.type}-${recommendation.description}`}>
      <ListItemText
        primary={
          <Typography variant="subtitle1" color="primary">
            {recommendation.type}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2">
              {recommendation.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Prioridad: {recommendation.priority}
            </Typography>
            {recommendation.evidence && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Evidencia:
                </Typography>
                <List dense>
                  {recommendation.evidence.map((evidence: string) => (
                    <ListItem key={evidence}>
                      <ListItemText primary={evidence} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        }
      />
    </ListItem>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resultados del Análisis
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {response.answer}
        </Typography>

        {response.timeline && response.timeline.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Línea de Tiempo
            </Typography>
            {response.timeline.map(renderTimeline)}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {response.insights && response.insights.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Insights
            </Typography>
            <List>{response.insights.map(renderInsights)}</List>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {response.recommendations && response.recommendations.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Recomendaciones
            </Typography>
            <List>{response.recommendations.map(renderRecommendations)}</List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
