import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { NewComparisonData } from '../../services/comparisonStorage';
import { MetricFilters } from './MetricFilterDialog';

interface SaveComparisonDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NewComparisonData) => void;
  patientIds: string[];
  patientNames: Record<string, string>;
  selectedMetricId: string;
  selectedMetricName: string;
  activeFilters: MetricFilters | null;
  suggestedTags?: string[];
}

const SaveComparisonDialog: React.FC<SaveComparisonDialogProps> = ({
  open,
  onClose,
  onSave,
  patientIds,
  patientNames,
  selectedMetricId,
  selectedMetricName,
  activeFilters,
  suggestedTags = []
}) => {
  // Estados para los campos del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [nameError, setNameError] = useState('');

  // Restablecer el formulario al cerrarse
  const handleClose = () => {
    setName('');
    setDescription('');
    setTags([]);
    setInputTag('');
    setNameError('');
    onClose();
  };

  // Validar y guardar la comparación
  const handleSave = () => {
    // Validar que haya un nombre
    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      return;
    }

    // Crear objeto con datos de la comparación
    const comparisonData: NewComparisonData = {
      name: name.trim(),
      description: description.trim() || undefined,
      patientIds,
      selectedMetricId,
      filters: activeFilters,
      tags: tags.length > 0 ? tags : undefined
    };

    // Llamar a la función para guardar
    onSave(comparisonData);
    handleClose();
  };

  // Agregar una etiqueta
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setInputTag('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="save-comparison-dialog-title"
    >
      <DialogTitle id="save-comparison-dialog-title">
        Guardar Comparación
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <TextField
            fullWidth
            label="Nombre de la comparación"
            variant="outlined"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
            error={!!nameError}
            helperText={nameError}
            autoFocus
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Descripción (opcional)"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Información guardada en esta comparación:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, pl: 2 }}>
            <Typography variant="body2">
              • <strong>Pacientes:</strong> {patientIds.length} seleccionados
              <Box sx={{ pl: 4, pt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {patientIds.map(id => (
                  <Chip
                    key={id}
                    label={patientNames[id] || id}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Typography>
            
            <Typography variant="body2">
              • <strong>Métrica principal:</strong> {selectedMetricName}
            </Typography>
            
            {activeFilters && (
              <Typography variant="body2">
                • <strong>Filtros:</strong> {activeFilters.selectedMetrics.length} métricas seleccionadas
                {activeFilters.showOnlyImproving && `, mejora mínima de ${activeFilters.minImprovementPercent}%`}
                {activeFilters.hideOutliers && ', sin valores atípicos'}
              </Typography>
            )}
          </Box>

          <Autocomplete
            multiple
            freeSolo
            options={suggestedTags.filter(tag => !tags.includes(tag))}
            value={tags}
            inputValue={inputTag}
            onInputChange={(_, value) => setInputTag(value)}
            onChange={(_, newValue) => setTags(newValue as string[])}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip 
                  label={option} 
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Etiquetas (opcional)"
                placeholder="Añadir etiqueta"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <TagIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputTag.trim()) {
                    e.preventDefault();
                    handleAddTag(inputTag.trim());
                  }
                }}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Guardar Comparación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveComparisonDialog; 