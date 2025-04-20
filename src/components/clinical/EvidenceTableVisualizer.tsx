import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  IconButton,
  useMediaQuery
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useTheme } from '@mui/material/styles';
import { ClinicalEvidence } from '../../types/clinicalDashboard';
import { CacheManagerFactory } from '../../services/cache/CacheManagerFactory';

interface EvidenceTableVisualizerProps {
  evidenceList: ClinicalEvidence[];
  title: string;
  description?: string;
  patientId?: string;
  showDetails?: boolean;
  onEvidenceClick?: (evidence: ClinicalEvidence) => void;
}

interface TableCacheMetadata {
  lastAccess: number;
  accessCount: number;
  size: number;
  patientId?: string;
  section: string;
}

export const EvidenceTableVisualizer: React.FC<EvidenceTableVisualizerProps> = ({
  evidenceList,
  title,
  description,
  patientId,
  showDetails = true,
  onEvidenceClick
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cacheManager = CacheManagerFactory.getInstance<{ page: number, rowsPerPage: number }>('evidence-tables');
  
  // Recuperar preferencias de paginación desde caché
  useEffect(() => {
    const loadCachedPreferences = async () => {
      const cacheKey = `table-prefs-${title}`;
      const cachedPrefs = await cacheManager.get(cacheKey);
      
      if (cachedPrefs) {
        setPage(cachedPrefs.page);
        setRowsPerPage(cachedPrefs.rowsPerPage);
      }
    };
    
    loadCachedPreferences();
  }, [title]);
  
  // Guardar preferencias de paginación en caché
  useEffect(() => {
    const savePreferences = async () => {
      const cacheKey = `table-prefs-${title}`;
      const prefs = { page, rowsPerPage };
      
      const metadata: TableCacheMetadata = {
        lastAccess: Date.now(),
        accessCount: 1,
        size: JSON.stringify(prefs).length,
        patientId,
        section: 'evidence-tables'
      };
      
      await cacheManager.set(cacheKey, prefs, metadata);
    };
    
    savePreferences();
  }, [page, rowsPerPage, title, patientId]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleRowClick = (evidence: ClinicalEvidence) => {
    if (onEvidenceClick) {
      onEvidenceClick(evidence);
    }
  };
  
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
      role="region"
      aria-labelledby="table-title"
    >
      <Box sx={{ mb: 2 }}>
        <Typography 
          id="table-title" 
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
      
      {evidenceList.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography variant="body1" color="text.secondary">
            No hay evidencia disponible para mostrar
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="Tabla de evidencia clínica">
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  {!isMobile && <TableCell>Resumen</TableCell>}
                  <TableCell>Fiabilidad</TableCell>
                  {!isMobile && showDetails && (
                    <>
                      <TableCell>Condiciones</TableCell>
                      <TableCell>Actualizado</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {evidenceList
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((evidence) => (
                    <TableRow 
                      key={evidence.id}
                      hover
                      onClick={() => handleRowClick(evidence)}
                      sx={{ 
                        cursor: onEvidenceClick ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: onEvidenceClick ? theme.palette.action.hover : undefined
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 200 }}>
                            {evidence.title}
                          </Typography>
                          {!showDetails && (
                            <Tooltip title={evidence.summary}>
                              <IconButton size="small" aria-label="Ver resumen" sx={{ ml: 1 }}>
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      
                      {!isMobile && (
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {evidence.summary}
                          </Typography>
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <Chip 
                          label={evidence.reliability} 
                          size="small"
                          color={
                            evidence.reliability >= 4 ? 'success' : 
                            evidence.reliability >= 3 ? 'primary' : 
                            evidence.reliability >= 2 ? 'default' : 
                            'warning'
                          }
                        />
                      </TableCell>
                      
                      {!isMobile && showDetails && (
                        <>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 200 }}>
                              {evidence.conditionTags.slice(0, 2).map((tag, index) => (
                                <Chip 
                                  key={index} 
                                  label={tag} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ))}
                              {evidence.conditionTags.length > 2 && (
                                <Tooltip 
                                  title={evidence.conditionTags.slice(2).join(', ')}
                                  aria-label="Más condiciones"
                                >
                                  <Chip 
                                    label={`+${evidence.conditionTags.length - 2}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(evidence.lastUpdated).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={evidenceList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </>
      )}
    </Paper>
  );
}; 