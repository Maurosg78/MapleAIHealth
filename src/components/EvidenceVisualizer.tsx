import React, { useEffect, useState } from 'react';
import { ClinicalEvidence } from '../types/clinicalDashboard';
import { EvidenceVisualizerProps, EvidenceCacheMetadata } from '../types/evidenceVisualizer';
import { CacheManagerFactory } from '../services/cache/CacheManagerFactory';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const EvidenceVisualizer: React.FC<EvidenceVisualizerProps> = ({
  evidenceId,
  patientId,
  onError
}) => {
  const [evidence, setEvidence] = useState<ClinicalEvidence | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const cacheManager = CacheManagerFactory.getInstance<ClinicalEvidence>('evidence-visualizer');

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        // Intentar obtener de caché primero
        const cachedEvidence = await cacheManager.get(evidenceId);
        if (cachedEvidence) {
          setEvidence(cachedEvidence);
          setLoading(false);
          return;
        }

        // Si no está en caché, obtener de la API
        const response = await fetch(`/api/evidence/${evidenceId}`);
        if (!response.ok) throw new Error('Error al obtener evidencia');
        
        const data = await response.json();
        
        // Almacenar en caché
        const metadata: EvidenceCacheMetadata = {
          lastAccess: Date.now(),
          accessCount: 1,
          size: JSON.stringify(data).length,
          patientId,
          section: 'evidence-visualizer'
        };
        
        await cacheManager.set(evidenceId, data, metadata);
        
        setEvidence(data);
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [evidenceId, patientId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress aria-label="Cargando evidencia" />
      </Box>
    );
  }

  if (!evidence) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
          No se pudo cargar la evidencia solicitada
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.paper,
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2
        }
      }}
      role="article"
      aria-labelledby="evidence-title"
    >
      <Typography 
        id="evidence-title"
        variant="h5" 
        component="h2"
        sx={{ mb: 2 }}
      >
        {evidence.title}
      </Typography>
      
      <Box component="section" aria-label="Resumen de la evidencia">
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {evidence.summary}
        </Typography>
      </Box>

      <Box component="section" aria-label="Contenido detallado">
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {evidence.content}
        </Typography>
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}` 
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Fuente: {evidence.source} | Última actualización: {new Date(evidence.lastUpdated).toLocaleDateString()}
        </Typography>
      </Box>
    </Paper>
  );
}; 