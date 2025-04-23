import React from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box, IconButton, Collapse, CardActions, Button, Tooltip } from '@mui/material';;;;;
import { ExpandMore as ExpandMoreIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Warning as WarningIcon, Stars as StarsIcon } from '@mui/icons-material';;;;;
import { TherapeuticExercise } from '../../../../types/treatment/exercises';;;;;

// Interfaz para las props del componente
interface ExerciseCardProps {
  exercise: TherapeuticExercise;
  onEdit?: (exercise: TherapeuticExercise) => void;
  onDelete?: (exerciseId: string) => void;
  onAdd?: (exercise: TherapeuticExercise) => void;
  expanded?: boolean;
  onExpand?: (exerciseId: string) => void;
  readOnly?: boolean;
}

// Componente para mostrar un ejercicio en forma de tarjeta
const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  onDelete,
  onAdd,
  expanded = false,
  onExpand,
  readOnly = false
}) => {
  // Función para manejar la expansión de la tarjeta
  const handleExpandClick = (): void => {
    if (onExpand) {
      onExpand(exercise.id);
    }
  };

  // Funciones para manejar las acciones de la tarjeta
  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(exercise);
    }
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(exercise.id);
    }
  };

  const handleAdd = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(exercise);
    }
  };

  // Obtener la primera letra de cada palabra del nombre para crear un avatar si no hay imagen
  const getInitials = (name: string): void => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        width: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
      onClick={handleExpandClick}
    >
      {exercise.imagePath ? (
        <CardMedia
          component="img"
          height="140"
          image={exercise.imagePath}
          alt={exercise.name}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}
        >
          {getInitials(exercise.name)}
        </Box>
      )}

      <CardContent sx={{ pb: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {exercise.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {exercise.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip 
            label={exercise.bodyRegion} 
            size="small" 
            color="primary"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip 
            label={exercise.category} 
            size="small"
            color="secondary"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip 
            label={exercise.difficulty} 
            size="small"
            color="default"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </CardContent>

      <CardActions disableSpacing sx={{ pt: 0, justifyContent: 'space-between' }}>
        <Box>
          {exercise.evidenceLevel && (
            <Tooltip title={`Nivel de evidencia: ${exercise.evidenceLevel}`}>
              <StarsIcon fontSize="small" color="success" sx={{ mr: 1 }} />
            </Tooltip>
          )}
          
          {(exercise.contraindications?.length || exercise.precautions?.length) ? (
            <Tooltip title="Este ejercicio tiene contraindicaciones o precauciones">
              <WarningIcon fontSize="small" color="warning" />
            </Tooltip>
          ) : null}
        </Box>
        
        <Box>
          {!readOnly && (
            <>
              {onAdd && (
                <Tooltip title="Añadir al plan">
                  <IconButton onClick={handleAdd} size="small">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              {onEdit && (
                <Tooltip title="Editar ejercicio">
                  <IconButton onClick={handleEdit} size="small">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip title="Eliminar ejercicio">
                  <IconButton onClick={handleDelete} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
          
          <Tooltip title="Ver detalles">
            <IconButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="mostrar más"
              size="small"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Instrucciones:
          </Typography>
          <Box component="ol" sx={{ pl: 2, mt: 0 }}>
            {exercise.instructions.map((instruction, index) => (
              <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                {instruction}
              </Typography>
            ))}
          </Box>

          {exercise.contraindications && exercise.contraindications.length > 0 && (
            <>
              <Typography variant="subtitle1" color="error" gutterBottom sx={{ mt: 2 }}>
                Contraindicaciones:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                {exercise.contraindications.map((contraindication, index) => (
                  <Typography component="li" variant="body2" key={index} color="error">
                    {contraindication}
                  </Typography>
                ))}
              </Box>
            </>
          )}

          {exercise.precautions && exercise.precautions.length > 0 && (
            <>
              <Typography variant="subtitle1" color="warning.main" gutterBottom sx={{ mt: 2 }}>
                Precauciones:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                {exercise.precautions.map((precaution, index) => (
                  <Typography component="li" variant="body2" key={index} color="warning.main">
                    {precaution}
                  </Typography>
                ))}
              </Box>
            </>
          )}

          {exercise.evidenceLevel && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Nivel de evidencia: {exercise.evidenceLevel}
              </Typography>
              {exercise.evidenceReference && (
                <Typography variant="caption">
                  {exercise.evidenceReference}
                </Typography>
              )}
            </Box>
          )}

          {onAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onAdd(exercise);
              }}
              sx={{ mt: 2 }}
            >
              Añadir al plan de tratamiento
            </Button>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ExerciseCard; 