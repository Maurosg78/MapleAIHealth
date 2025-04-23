import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip, TextField, InputAdornment, Divider, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip, Stack } from '@mui/material';;;;;
import { Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';;;;;
import comparisonStorageService, { SavedComparison } from '../../services/comparisonStorage';

interface SavedComparisonsManagerProps {
  onSelect?: (comparisonId: string) => void;
  onCreateNew?: () => void;
}

const SavedComparisonsManager: React.FC<SavedComparisonsManagerProps> = ({
  onSelect,
  onCreateNew
}) => {
  // Estado para las comparaciones guardadas
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para la comparación que se va a eliminar
  const [deletingComparison, setDeletingComparison] = useState<SavedComparison | null>(null);
  
  // Obtener comparaciones al cargar el componente
  useEffect(() => {
    loadComparisons();
  }, [loadComparisons]);
  
  // Cargar comparaciones desde el almacenamiento
  const loadComparisons = (): void => {
    const savedComparisons = comparisonStorageService.getAllComparisons();
    // Ordenar por fecha de actualización (más reciente primero)
    savedComparisons.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setComparisons(savedComparisons);
  };
  
  // Filtrar comparaciones según el término de búsqueda
  const filteredComparisons = comparisons.filter(comparison => {
    const searchLower = searchTerm.toLowerCase();
    return (
      comparison.name.toLowerCase().includes(searchLower) ||
      (comparison.description && comparison.description.toLowerCase().includes(searchLower)) ||
      comparison.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
  
  // Abrir confirmación para eliminar una comparación
  const handleDeleteClick = (comparison: SavedComparison): void => {
    setDeletingComparison(comparison);
  };
  
  // Confirmar y eliminar la comparación
  const handleConfirmDelete = (): void => {
    if (deletingComparison) {
      const success = comparisonStorageService.deleteComparison(deletingComparison.id);
      if (success) {
        // Recargar comparaciones después de eliminar
        loadComparisons();
      }
      setDeletingComparison(null);
    }
  };
  
  // Cancelar eliminación
  const handleCancelDelete = (): void => {
    setDeletingComparison(null);
  };
  
  // Manejar la selección de una comparación
  const handleSelect = (comparison: SavedComparison): void => {
    if (onSelect) {
      onSelect(comparison.id);
    }
  };
  
  // Manejar la creación de una nueva comparación
  const handleCreateNew = (): void => {
    if (onCreateNew) {
      onCreateNew();
    }
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString: string): void => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Comparaciones Guardadas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Nueva Comparación
        </Button>
      </Box>
      
      <TextField
        fullWidth
        placeholder="Buscar comparaciones por nombre, descripción o etiquetas"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {filteredComparisons.length > 0 ? (
        <Paper sx={{ mb: 4 }}>
          <List sx={{ width: '100%' }}>
            {filteredComparisons.map((comparison, index) => (
              <React.Fragment key={comparison.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelect(comparison)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="span">
                        {comparison.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {comparison.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {comparison.description}
                          </Typography>
                        )}
                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Pacientes:</strong> {comparison.patientIds.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Actualizado:</strong> {formatDate(comparison.updatedAt)}
                          </Typography>
                        </Stack>
                        
                        {comparison.tags && comparison.tags.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {comparison.tags.map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Ver comparación">
                      <IconButton 
                        edge="end" 
                        aria-label="ver"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(comparison);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton 
                        edge="end" 
                        aria-label="eliminar"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(comparison);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {searchTerm ? (
            <Typography color="text.secondary">
              No se encontraron comparaciones que coincidan con "{searchTerm}"
            </Typography>
          ) : (
            <>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay comparaciones guardadas
              </Typography>
              <Typography color="text.secondary" paragraph>
                Cree una nueva comparación para comenzar a analizar el progreso de sus pacientes.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                sx={{ mt: 2 }}
              >
                Nueva Comparación
              </Button>
            </>
          )}
        </Paper>
      )}
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={!!deletingComparison}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Está seguro de que desea eliminar la comparación "{deletingComparison?.name}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedComparisonsManager; 