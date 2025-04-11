import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Tooltip,
  IconButton,
  Collapse,
  IconButtonProps
} from '@mui/material';
import {
  MedicationOutlined,
  WarningAmber,
  AssignmentTurnedIn,
  DateRange,
  LocalHospital,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { alpha, styled } from '@mui/material/styles';

// Definimos los tipos de recomendaciones
export type RecommendationType =
  | 'medication'
  | 'test'
  | 'followUp'
  | 'warning'
  | 'referral'
  | 'diagnostic'
  | 'treatment';

// Definimos los niveles de urgencia
export type UrgencyLevel =
  | 'routine'
  | 'soon'
  | 'urgent'
  | 'emergency';

// Definimos los niveles de evidencia
export type EvidenceLevel = 'A' | 'B' | 'C' | 'D';

// Interfaz para las propiedades del componente
export interface ClinicalRecommendationCardProps {
  id: string;
  title: string;
  description: string;
  type: RecommendationType;
  urgency: UrgencyLevel;
  confidence: number;
  evidenceLevel?: EvidenceLevel;
  sources?: Array<{
    id: string;
    title: string;
    publication?: string;
    year?: number;
    verified?: boolean;
  }>;
  onAction?: (action: string, id: string) => void;
  contraindications?: Array<{
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

// Componente expandible estilizado
interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expand',
})<ExpandMoreProps>(({ theme, expand }) => ({
  transform: expand ? 'rotate(180deg)' : 'rotate(0deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ClinicalRecommendationCard: React.FC<ClinicalRecommendationCardProps> = ({
  id,
  title,
  description,
  type,
  urgency,
  confidence,
  evidenceLevel,
  sources,
  onAction,
  contraindications
}) => {
  const [expanded, setExpanded] = React.useState(false);

  // Manejador para expandir/colapsar la tarjeta
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Función para obtener el ícono según el tipo de recomendación
  const getIcon = () => {
    switch (type) {
      case 'medication':
        return <MedicationOutlined />;
      case 'warning':
        return <WarningAmber />;
      case 'followUp':
        return <DateRange />;
      case 'referral':
        return <LocalHospital />;
      default:
        return <AssignmentTurnedIn />;
    }
  };

  // Función para obtener el color según la urgencia
  const getUrgencyColor = () => {
    switch (urgency) {
      case 'emergency':
        return 'error';
      case 'urgent':
        return 'warning';
      case 'soon':
        return 'info';
      default:
        return 'default';
    }
  };

  // Función para obtener el color según el nivel de evidencia
  const getEvidenceColor = () => {
    switch (evidenceLevel) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
        return 'error';
      default:
        return 'default';
    }
  };

  // Función para obtener la etiqueta de urgencia
  const getUrgencyLabel = () => {
    switch (urgency) {
      case 'emergency':
        return 'Emergencia';
      case 'urgent':
        return 'Urgente';
      case 'soon':
        return 'Pronto';
      default:
        return 'Rutina';
    }
  };

  // Función para obtener el texto del nivel de evidencia
  const getEvidenceText = () => {
    switch (evidenceLevel) {
      case 'A':
        return 'Evidencia alta';
      case 'B':
        return 'Evidencia moderada';
      case 'C':
        return 'Evidencia limitada';
      case 'D':
        return 'Evidencia muy baja';
      default:
        return 'Sin clasificar';
    }
  };

  // Borde de color según la urgencia
  const borderColor = {
    emergency: '#f44336', // rojo
    urgent: '#ff9800',    // naranja
    soon: '#2196f3',      // azul
    routine: '#4caf50'    // verde
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `5px solid ${borderColor[urgency]}`,
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent>
        {/* Cabecera con título e ícono */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{
            mr: 1,
            p: 0.5,
            borderRadius: '50%',
            bgcolor: alpha(borderColor[urgency], 0.1)
          }}>
            {getIcon()}
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>

        {/* Descripción */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>

        {/* Etiquetas de información */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            size="small"
            label={getUrgencyLabel()}
            color={getUrgencyColor()}
            variant="outlined"
          />

          {evidenceLevel && (
            <Tooltip title={getEvidenceText()}>
              <Chip
                size="small"
                label={`Evidencia: ${evidenceLevel}`}
                color={getEvidenceColor()}
                variant="outlined"
              />
            </Tooltip>
          )}

          <Tooltip title={`Confianza: ${Math.round(confidence * 100)}%`}>
            <Chip
              size="small"
              label={`${Math.round(confidence * 100)}%`}
              color={confidence > 0.8 ? 'success' : confidence > 0.6 ? 'info' : 'default'}
              variant="outlined"
            />
          </Tooltip>

          {contraindications && contraindications.length > 0 && (
            <Tooltip title="Tiene contraindicaciones">
              <Chip
                size="small"
                icon={<WarningAmber fontSize="small" />}
                label="Contraindicaciones"
                color="error"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          {onAction && (
            <Tooltip title="Marcar como aplicada">
              <IconButton
                size="small"
                onClick={() => onAction('apply', id)}
                aria-label="marcar como aplicada"
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Más información">
            <IconButton
              size="small"
              onClick={() => onAction?.('info', id)}
              aria-label="más información"
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="mostrar más"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
      </CardContent>

      {/* Contenido expandible - Fuentes y contraindicaciones */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {sources && sources.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Fuentes
              </Typography>
              {sources.map((source) => (
                <Box key={source.id} sx={{ mb: 1, pl: 1, borderLeft: '2px solid #e0e0e0' }}>
                  <Typography variant="body2" component="div">
                    {source.verified && (
                      <Chip
                        size="small"
                        label="Verificada"
                        color="success"
                        variant="outlined"
                        sx={{ mr: 1, mb: 0.5 }}
                      />
                    )}
                    {source.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {source.publication} {source.year && `(${source.year})`}
                  </Typography>
                </Box>
              ))}
            </>
          )}

          {contraindications && contraindications.length > 0 && (
            <>
              <Typography variant="subtitle2" color="error" gutterBottom sx={{ mt: 2 }}>
                Contraindicaciones
              </Typography>
              {contraindications.map((contraindication) => (
                <Box key={contraindication.id} sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    component="div"
                    color={
                      contraindication.severity === 'high'
                        ? 'error.main'
                        : contraindication.severity === 'medium'
                          ? 'warning.main'
                          : 'text.secondary'
                    }
                  >
                    {contraindication.description}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ClinicalRecommendationCard;
