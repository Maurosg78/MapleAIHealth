import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Chip, 
  Button,
  IconButton
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { ClinicalEvidence } from '../../types/clinicalDashboard';
import { CacheManagerFactory } from '../../services/cache/CacheManagerFactory';

interface EvidenceComparisonVisualizerProps {
  evidenceList: ClinicalEvidence[];
  title?: string;
  description?: string;
  patientId?: string;
  maxItems?: number; 
  onEvidenceRemove?: (evidenceId: string) => void;
}

interface ComparisonCacheMetadata {
  lastAccess: number;
  accessCount: number;
  size: number;
  patientId?: string;
  section: string;
}

// Calcular una puntuación de similitud entre dos evidencias
const calculateSimilarity = (a: ClinicalEvidence, b: ClinicalEvidence): number => {
  let score = 0;
  
  // Comparar etiquetas de condición
  const commonConditions = a.conditionTags.filter(tag => b.conditionTags.includes(tag));
  score += commonConditions.length * 5;
  
  // Comparar etiquetas de tratamiento
  const commonTreatments = a.treatmentTags.filter(tag => b.treatmentTags.includes(tag));
  score += commonTreatments.length * 5;
  
  // Comparar etiquetas de categoría
  const commonCategories = a.categoryTags.filter(tag => b.categoryTags.includes(tag));
  score += commonCategories.length * 3;
  
  // Comparar fiabilidad (similitud)
  const reliabilityDiff = Math.abs(a.reliability - b.reliability);
  score += (5 - reliabilityDiff) * 2;
  
  // Comparar relevancia (similitud)
  const relevanceDiff = Math.abs(a.relevanceScore - b.relevanceScore);
  score += (100 - relevanceDiff) / 10;
  
  return Math.min(100, score);
};

export const EvidenceComparisonVisualizer: React.FC<EvidenceComparisonVisualizerProps> = ({
  evidenceList,
  title = "Comparación de Evidencia Clínica",
  description,
  patientId,
  maxItems = 3,
  onEvidenceRemove
}) => {
  const theme = useTheme();
  const cacheManager = CacheManagerFactory.getInstance<string[]>('evidence-comparison');
  
  // Limitar el número de elementos a mostrar
  const displayedEvidence = useMemo(() => {
    return evidenceList.slice(0, maxItems);
  }, [evidenceList, maxItems]);
  
  // Calcular similitudes entre evidencias
  const similarities = useMemo(() => {
    if (displayedEvidence.length < 2) return [];
    
    const results: Array<{
      id1: string;
      id2: string;
      score: number;
      commonTags: string[];
    }> = [];
    
    for (let i = 0; i < displayedEvidence.length; i++) {
      for (let j = i + 1; j < displayedEvidence.length; j++) {
        const ev1 = displayedEvidence[i];
        const ev2 = displayedEvidence[j];
        const score = calculateSimilarity(ev1, ev2);
        
        // Encontrar etiquetas comunes
        const allTags1 = [...ev1.conditionTags, ...ev1.treatmentTags, ...ev1.categoryTags];
        const allTags2 = [...ev2.conditionTags, ...ev2.treatmentTags, ...ev2.categoryTags];
        const commonTags = allTags1.filter(tag => allTags2.includes(tag));
        
        results.push({
          id1: ev1.id,
          id2: ev2.id,
          score,
          commonTags: commonTags.slice(0, 3) // Limitar a 3 etiquetas comunes
        });
      }
    }
    
    return results.sort((a, b) => b.score - a.score);
  }, [displayedEvidence]);
  
  // Guardar comparación en caché
  const saveComparison = async () => {
    const ids = displayedEvidence.map(e => e.id);
    const cacheKey = `comparison-${ids.join('-')}`;
    
    const metadata: ComparisonCacheMetadata = {
      lastAccess: Date.now(),
      accessCount: 1,
      size: JSON.stringify(ids).length,
      patientId,
      section: 'evidence-comparison'
    };
    
    await cacheManager.set(cacheKey, ids, metadata);
  };
  
  const handleRemove = (evidenceId: string) => {
    if (onEvidenceRemove) {
      onEvidenceRemove(evidenceId);
    }
  };
  
  // Si no hay evidencia para comparar
  if (displayedEvidence.length === 0) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Typography variant="body1" align="center">
          No hay evidencia disponible para comparar
        </Typography>
      </Paper>
    );
  }
  
  // Si solo hay un elemento
  if (displayedEvidence.length === 1) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          Se necesitan al menos dos elementos para la comparación
        </Typography>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {displayedEvidence[0].title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {displayedEvidence[0].summary}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {displayedEvidence[0].conditionTags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Paper>
    );
  }
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.paper
      }}
      role="region"
      aria-labelledby="comparison-title"
    >
      <Box sx={{ mb: 3 }}>
        <Typography 
          id="comparison-title" 
          variant="h6" 
          component="h3" 
          gutterBottom
        >
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description}
          </Typography>
        )}
      </Box>
      
      {/* Grid de tarjetas de evidencia */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: `repeat(${displayedEvidence.length}, 1fr)`
          },
          gap: 2,
          mb: 4
        }}
      >
        {displayedEvidence.map((evidence) => (
          <Box key={evidence.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              {onEvidenceRemove && (
                <IconButton 
                  size="small" 
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => handleRemove(evidence.id)}
                  aria-label="Eliminar de comparación"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {evidence.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={`Fiabilidad: ${evidence.reliability}`} 
                    size="small"
                    color={
                      evidence.reliability >= 4 ? 'success' : 
                      evidence.reliability >= 3 ? 'primary' : 
                      evidence.reliability >= 2 ? 'default' : 
                      'warning'
                    }
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(evidence.lastUpdated).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {evidence.summary}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Condiciones:
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ mb: 2 }}>
                  {evidence.conditionTags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Tratamientos:
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {evidence.treatmentTags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      {/* Sección de similitudes */}
      {similarities.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Análisis de Similitud
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {similarities.map((similarity, index) => {
              const ev1 = displayedEvidence.find(e => e.id === similarity.id1)!;
              const ev2 = displayedEvidence.find(e => e.id === similarity.id2)!;
              
              return (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        {ev1.title}
                      </Typography>
                      
                      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mx: 2 }}>
                        <CompareArrowsIcon color="primary" />
                        <Chip 
                          label={`${Math.round(similarity.score)}% similar`}
                          size="small"
                          color={
                            similarity.score > 80 ? 'success' : 
                            similarity.score > 50 ? 'primary' : 
                            'default'
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Typography variant="body1" sx={{ flex: 1, textAlign: 'right' }}>
                        {ev2.title}
                      </Typography>
                    </Box>
                    
                    {similarity.commonTags.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Elementos comunes:
                        </Typography>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {similarity.commonTags.map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </>
      )}
      
      <Button 
        variant="outlined" 
        onClick={saveComparison}
        sx={{ mt: 2 }}
      >
        Guardar esta comparación
      </Button>
    </Paper>
  );
}; 