import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import ExerciseCard from './ExerciseCard';
import { TherapeuticExercise } from '../../../../types/treatment/exercises';

// Interfaz para las props del componente
interface ExerciseGridProps {
  exercises: TherapeuticExercise[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (exercise: TherapeuticExercise) => void;
  onDelete?: (exerciseId: string) => void;
  onAdd?: (exercise: TherapeuticExercise) => void;
  itemsPerPage?: number;
  readOnly?: boolean;
}

// Componente para mostrar una rejilla de ejercicios
const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  exercises,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onAdd,
  itemsPerPage = 12,
  readOnly = false
}) => {
  // Estado para la expansión de tarjetas
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Estado para la paginación
  const [page, setPage] = useState(1);

  // Manejar el cambio de página
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Resetear la tarjeta expandida al cambiar de página
    setExpandedId(null);
  };

  // Manejar la expansión de tarjetas
  const handleExpandCard = (exerciseId: string) => {
    setExpandedId(prev => (prev === exerciseId ? null : exerciseId));
  };

  // Calcular los ejercicios a mostrar en la página actual
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExercises = exercises.slice(startIndex, endIndex);
  const totalPages = Math.ceil(exercises.length / itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (exercises.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No se encontraron ejercicios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Intente con otros criterios de búsqueda o añada nuevos ejercicios a la biblioteca.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {currentExercises.map((exercise) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={exercise.id}>
            <ExerciseCard
              exercise={exercise}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              expanded={expandedId === exercise.id}
              onExpand={handleExpandCard}
              readOnly={readOnly}
            />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default ExerciseGrid;