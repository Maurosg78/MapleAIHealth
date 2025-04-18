import React, { useState, useEffect } from 'react';
import { ROMProgressChart } from '../charts/ROMProgressChart';
import { Card, CardContent, CardHeader, Typography, Box, Tabs, Tab } from '@mui/material';

// Definir interfaces localmente
interface Patient {
  id?: string;
  firstName?: string;
  lastName?: string;
}

interface Assessment {
  date: string;
  subjectiveData?: {
    painLevel?: number;
  };
  objectiveData?: {
    rangeOfMotion?: {
      [key: string]: number;
    };
  };
  functionalScores?: {
    functionalCapacity?: number;
  };
}

// Interfaces para los datos de estado
interface MovementData {
  name: string;
  data: Array<{date: string; value: number}>;
  color: string;
  normalRange: [number, number];
}

interface PatientProgressDashboardProps {
  patient: Patient;
  assessments: Assessment[];
  className?: string;
}

export const PatientProgressDashboard: React.FC<PatientProgressDashboardProps> = ({
  patient,
  assessments,
  className
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [shoulderData, setShoulderData] = useState<MovementData[]>([]);
  const [kneeData, setKneeData] = useState<MovementData[]>([]);
  const [spineData, setSpineData] = useState<MovementData[]>([]);
  const [painData, setPainData] = useState<MovementData[]>([]);
  const [functionalScores, setFunctionalScores] = useState<MovementData[]>([]);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      // Procesar datos para gráficos de movimiento de hombro
      const flexionData = processMovementData(assessments, 'shoulderFlexion');
      const abductionData = processMovementData(assessments, 'shoulderAbduction');
      const rotationData = processMovementData(assessments, 'shoulderExternalRotation');
      
      setShoulderData([
        { name: 'Flexión', data: flexionData, color: '#8884d8', normalRange: [0, 180] },
        { name: 'Abducción', data: abductionData, color: '#82ca9d', normalRange: [0, 180] },
        { name: 'Rotación Externa', data: rotationData, color: '#ffc658', normalRange: [0, 90] }
      ]);

      // Procesar datos para gráficos de movimiento de rodilla
      const kneeFlexionData = processMovementData(assessments, 'kneeFlexion');
      const kneeExtensionData = processMovementData(assessments, 'kneeExtension');
      
      setKneeData([
        { name: 'Flexión', data: kneeFlexionData, color: '#8884d8', normalRange: [0, 140] },
        { name: 'Extensión', data: kneeExtensionData, color: '#82ca9d', normalRange: [0, 10] }
      ]);

      // Procesar datos para gráficos de columna
      const flexionSpineData = processMovementData(assessments, 'trunkFlexion');
      const extensionSpineData = processMovementData(assessments, 'trunkExtension');
      const lateralFlexionData = processMovementData(assessments, 'trunkLateralFlexion');
      
      setSpineData([
        { name: 'Flexión', data: flexionSpineData, color: '#8884d8', normalRange: [0, 90] },
        { name: 'Extensión', data: extensionSpineData, color: '#82ca9d', normalRange: [0, 30] },
        { name: 'Flexión Lateral', data: lateralFlexionData, color: '#ffc658', normalRange: [0, 35] }
      ]);

      // Procesar datos de dolor
      setPainData([
        { 
          name: 'Nivel de Dolor', 
          data: assessments.map(assessment => ({
            date: new Date(assessment.date).toLocaleDateString(),
            value: assessment.subjectiveData?.painLevel || 0
          })),
          color: '#ff7300',
          normalRange: [0, 10]
        }
      ]);

      // Procesar escalas funcionales
      setFunctionalScores([
        { 
          name: 'Capacidad Funcional', 
          data: assessments.map(assessment => ({
            date: new Date(assessment.date).toLocaleDateString(),
            value: assessment.functionalScores?.functionalCapacity || 0
          })),
          color: '#0088fe',
          normalRange: [0, 100] 
        }
      ]);
    }
  }, [assessments]);

  const processMovementData = (assessments: Assessment[], movementKey: string) => {
    return assessments.map(assessment => {
      const movementValue = assessment.objectiveData?.rangeOfMotion?.[movementKey] || 0;
      return {
        date: new Date(assessment.date).toLocaleDateString(),
        value: movementValue
      };
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box className={className}>
      <Typography variant="h4" component="h1" gutterBottom>
        Evolución de {patient.firstName} {patient.lastName}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Rangos de Movimiento" />
          <Tab label="Dolor y Función" />
          <Tab label="Resumen" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Card>
              <CardHeader title="Hombro - Rangos de Movimiento" />
              <CardContent>
                <ROMProgressChart 
                  movements={shoulderData}
                  height={300}
                  yAxisLabel="Grados"
                  showGrid
                  showNormalRange
                />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Card>
              <CardHeader title="Rodilla - Rangos de Movimiento" />
              <CardContent>
                <ROMProgressChart 
                  movements={kneeData}
                  height={300}
                  yAxisLabel="Grados"
                  showGrid
                  showNormalRange
                />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Card>
              <CardHeader title="Columna - Rangos de Movimiento" />
              <CardContent>
                <ROMProgressChart 
                  movements={spineData}
                  height={300}
                  yAxisLabel="Grados"
                  showGrid
                  showNormalRange
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {currentTab === 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Card>
              <CardHeader title="Evolución del Dolor" />
              <CardContent>
                <ROMProgressChart 
                  movements={painData}
                  height={300}
                  yAxisLabel="Intensidad (0-10)"
                  showGrid
                  showNormalRange={false}
                />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Card>
              <CardHeader title="Capacidad Funcional" />
              <CardContent>
                <ROMProgressChart 
                  movements={functionalScores}
                  height={300}
                  yAxisLabel="Porcentaje (%)"
                  showGrid
                  showNormalRange={false}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {currentTab === 2 && (
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardHeader title="Resumen de Progreso" />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                  <Typography variant="h6">Última evaluación</Typography>
                  <Typography variant="body1">
                    {assessments.length > 0 ? new Date(assessments[assessments.length - 1].date).toLocaleDateString() : 'Sin datos'}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                  <Typography variant="h6">Dolor actual</Typography>
                  <Typography variant="body1">
                    {assessments.length > 0 ? 
                      `${assessments[assessments.length - 1].subjectiveData?.painLevel || 0}/10` : 
                      'Sin datos'}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                  <Typography variant="h6">Capacidad funcional</Typography>
                  <Typography variant="body1">
                    {assessments.length > 0 ? 
                      `${assessments[assessments.length - 1].functionalScores?.functionalCapacity || 0}%` : 
                      'Sin datos'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}; 