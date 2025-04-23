import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, CircularProgress, Alert, useMediaQuery } from '@mui/material';;;;;
import { useTheme } from '@mui/material/styles';;;;;
import { ClinicalEvidence, ClinicalDashboardFilters, EvidenceLevelData } from '../../types/clinicalDashboard';;;;;
import { EvidenceSearchService } from '../../services/EvidenceSearchService';;;;;
import { EvidenceTableVisualizer } from './EvidenceTableVisualizer';;;;;
import { EvidenceChartVisualizer } from './EvidenceChartVisualizer';;;;;
import { EvidenceComparisonVisualizer } from './EvidenceComparisonVisualizer';;;;;
import { EvidenceVisualizer } from '../EvidenceVisualizer';;;;;

interface EvidenceVisualizerContainerProps {
  patientId?: string;
  initialTab?: number;
  initialFilters?: Partial<ClinicalDashboardFilters>;
  showComparison?: boolean;
  showDetailedEvidence?: boolean;
  chartTypes?: 'all' | 'simple' | 'advanced';
  maxItems?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps): void {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`evidence-tabpanel-${index}`}
      aria-labelledby={`evidence-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const EvidenceVisualizerContainer: React.FC<EvidenceVisualizerContainerProps> = ({
  patientId,
  initialTab = 0,
  initialFilters = {},
  showComparison = true,
  showDetailedEvidence = true,
  chartTypes = 'all',
  maxItems = 10
}) => {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [evidenceList, setEvidenceList] = useState<ClinicalEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<ClinicalEvidence | null>(null);
  const [comparisonList, setComparisonList] = useState<ClinicalEvidence[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const searchService = EvidenceSearchService.getInstance({
    mongoUri: 'mongodb://localhost:27017',
    elasticUri: 'http://localhost:9200',
    databaseName: 'clinical_evidence',
    collectionName: 'evidence',
    indexName: 'clinical_evidence'
  });
  
  // Cargar datos de evidencia
  useEffect(() => {
    const loadEvidence = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters: ClinicalDashboardFilters = {
          ...initialFilters,
          patientId
        };
        
        const results = await searchService.searchEvidence(filters, 1, maxItems);
        setEvidenceList(results.results);
      } catch (err) {
        console.error('Error al cargar evidencia:', err);
        setError('No se pudo cargar la evidencia. Por favor, inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvidence();
  }, [patientId, initialFilters, maxItems]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTab(newValue);
  };
  
  const handleEvidenceSelect = (evidence: ClinicalEvidence): void => {
    setSelectedEvidence(evidence);
  };
  
  const handleAddToComparison = (): void => {
    if (selectedEvidence && !comparisonList.find(e => e.id === selectedEvidence.id)) {
      setComparisonList([...comparisonList, selectedEvidence]);
    }
  };
  
  const handleRemoveFromComparison = (evidenceId: string): void => {
    setComparisonList(comparisonList.filter(e => e.id !== evidenceId));
  };
  
  const handleClearComparison = (): void => {
    setComparisonList([]);
  };
  
  // Generar datos para gráficos
  const evidenceLevelData: EvidenceLevelData[] = [
    { level: '1A', count: evidenceList.filter(e => e.reliability === 5).length, description: 'Revisiones sistemáticas', color: '#2C5282' },
    { level: '1B', count: evidenceList.filter(e => e.reliability === 4).length, description: 'Ensayos clínicos', color: '#3182CE' },
    { level: '2A', count: evidenceList.filter(e => e.reliability === 3).length, description: 'Estudios de cohortes', color: '#4299E1' },
    { level: '2B', count: evidenceList.filter(e => e.reliability === 2).length, description: 'Estudios de casos', color: '#63B3ED' },
    { level: '3', count: evidenceList.filter(e => e.reliability === 1).length, description: 'Series de casos', color: '#90CDF4' }
  ];
  
  // Datos para gráfico de categorías
  const categoryCounts = evidenceList.reduce((counts, evidence) => {
    evidence.categoryTags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, {} as Record<string, number>);
  
  // Datos para gráfico de condiciones
  const conditionCounts = evidenceList.reduce((counts, evidence) => {
    evidence.conditionTags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, {} as Record<string, number>);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress aria-label="Cargando visualizaciones de evidencia" />
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
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Visualización de Evidencia Clínica
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          aria-label="Pestañas de visualización de evidencia"
        >
          <Tab label="Tabla" id="evidence-tab-0" aria-controls="evidence-tabpanel-0" />
          <Tab label="Gráficos" id="evidence-tab-1" aria-controls="evidence-tabpanel-1" />
          {showComparison && (
            <Tab label="Comparación" id="evidence-tab-2" aria-controls="evidence-tabpanel-2" />
          )}
          {showDetailedEvidence && selectedEvidence && (
            <Tab label="Detalle" id="evidence-tab-3" aria-controls="evidence-tabpanel-3" />
          )}
        </Tabs>
      </Box>
      
      {/* Pestaña de tabla */}
      <TabPanel value={currentTab} index={0}>
        <EvidenceTableVisualizer 
          evidenceList={evidenceList}
          title="Evidencia Clínica Disponible"
          description="Seleccione una evidencia para ver más detalles o añadirla a la comparación."
          patientId={patientId}
          onEvidenceClick={handleEvidenceSelect}
        />
        
        {selectedEvidence && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handleAddToComparison}
              disabled={comparisonList.find(e => e.id === selectedEvidence.id) !== undefined}
            >
              Añadir a comparación
            </Button>
          </Box>
        )}
      </TabPanel>
      
      {/* Pestaña de gráficos */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ mb: 4 }}>
          <EvidenceChartVisualizer 
            data={evidenceLevelData}
            title="Distribución por Nivel de Evidencia"
            description="Clasificación según los niveles de evidencia científica."
            defaultChartType="pie"
            patientId={patientId}
            categoryKey="level"
            valueKey="count"
          />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <EvidenceChartVisualizer 
            data={categoryCounts}
            title="Distribución por Categoría"
            description="Número de evidencias por categoría terapéutica."
            defaultChartType="bar"
            patientId={patientId}
          />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <EvidenceChartVisualizer 
            data={conditionCounts}
            title="Distribución por Condición"
            description="Número de evidencias por condición médica."
            defaultChartType={chartTypes === 'advanced' ? 'area' : 'bar'}
            patientId={patientId}
          />
        </Box>
        
        {chartTypes === 'advanced' && (
          <Box sx={{ mb: 4 }}>
            <EvidenceChartVisualizer 
              data={evidenceList.slice(0, 5)}
              title="Relevancia vs. Fiabilidad"
              description="Comparación entre puntuación de relevancia y fiabilidad."
              defaultChartType="comparison"
              patientId={patientId}
              categoryKey="title"
              valueKey="relevanceScore"
            />
          </Box>
        )}
      </TabPanel>
      
      {/* Pestaña de comparación */}
      {showComparison && (
        <TabPanel value={currentTab} index={2}>
          {comparisonList.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" gutterBottom>
                No ha seleccionado ninguna evidencia para comparar.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setCurrentTab(0)}
                sx={{ mt: 2 }}
              >
                Ir a la tabla para seleccionar evidencia
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleClearComparison}
                >
                  Limpiar comparación
                </Button>
              </Box>
              
              <EvidenceComparisonVisualizer 
                evidenceList={comparisonList}
                title="Comparación de Evidencia Seleccionada"
                description={`Comparando ${comparisonList.length} elementos seleccionados.`}
                patientId={patientId}
                maxItems={5}
                onEvidenceRemove={handleRemoveFromComparison}
              />
            </>
          )}
        </TabPanel>
      )}
      
      {/* Pestaña de detalle */}
      {showDetailedEvidence && selectedEvidence && (
        <TabPanel value={currentTab} index={3}>
          <EvidenceVisualizer 
            evidenceId={selectedEvidence.id}
            patientId={patientId}
            onError={() => setError('Error al cargar el detalle de la evidencia.')}
          />
        </TabPanel>
      )}
    </Paper>
  );
}; 