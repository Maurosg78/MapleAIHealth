import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, Tabs, Tab, Paper } from '@mui/material';;;;;

// Importación de componentes de gráficos
import { FunctionalityChart, FunctionalityData } from '../charts/FunctionalityChart';;;;;
import { TreatmentGoalsChart, GoalData } from '../charts/TreatmentGoalsChart';;;;;
import { PainEvolutionChart } from '../charts/PainEvolutionChart';;;;;
import { ROMProgressChart } from '../charts/ROMProgressChart';;;;;

interface FunctionalAssessmentDashboardProps {
  patientName: string;
  className?: string;
  // Datos para los gráficos
  functionalityData: FunctionalityData[];
  treatmentGoals: GoalData[];
  painData: { date: string; value: number }[];
  romData: {
    name: string;
    data: { date: string; value: number }[];
    color: string;
    normalRange?: [number, number];
  }[];
  // Datos de resumen
  summary: {
    initialDate: string;
    sessionsCount: number;
    currentPain: number;
    initialPain: number;
    adherenceRate: number;
    completedGoals: number;
    totalGoals: number;
  };
}

export const FunctionalAssessmentDashboard: React.FC<FunctionalAssessmentDashboardProps> = ({
  patientName,
  className = '',
  functionalityData,
  treatmentGoals,
  painData,
  romData,
  summary
}) => {
  const [currentTab, setCurrentTab] = useState(0);

  // Calcular porcentaje de mejora en dolor
  const painImprovement = summary.initialPain > 0 
    ? Math.round(((summary.initialPain - summary.currentPain) / summary.initialPain) * 100) 
    : 0;

  // Calcular porcentaje de objetivos completados
  const goalsCompletionRate = summary.totalGoals > 0 
    ? Math.round((summary.completedGoals / summary.totalGoals) * 100) 
    : 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTab(newValue);
  };

  return (
    <Box className={className}>
      <Typography variant="h4" gutterBottom>
        Evaluación Funcional: {patientName}
      </Typography>

      {/* Tarjetas de resumen */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 2, flex: '1 1 calc(25% - 24px)', minWidth: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Reducción del Dolor
          </Typography>
          <Box sx={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            background: `conic-gradient(#4caf50 ${painImprovement}%, #e0e0e0 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h6">{painImprovement}%</Typography>
            </Box>
          </Box>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Dolor inicial: {summary.initialPain}/10
          </Typography>
          <Typography variant="body2" align="center">
            Dolor actual: {summary.currentPain}/10
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, flex: '1 1 calc(25% - 24px)', minWidth: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Objetivos de Tratamiento
          </Typography>
          <Typography variant="h3" align="center">
            {summary.completedGoals}/{summary.totalGoals}
          </Typography>
          <Box sx={{ 
            height: 10, 
            width: '80%', 
            bgcolor: '#e0e0e0',
            borderRadius: 5,
            my: 2,
            mx: 'auto'
          }}>
            <Box 
              sx={{ 
                height: '100%', 
                width: `${goalsCompletionRate}%`, 
                bgcolor: goalsCompletionRate > 75 ? '#4caf50' : goalsCompletionRate > 40 ? '#ff9800' : '#f44336',
                borderRadius: 5
              }}
            />
          </Box>
          <Typography variant="body2" align="center">
            {goalsCompletionRate}% completados
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, flex: '1 1 calc(25% - 24px)', minWidth: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Adherencia al Tratamiento
          </Typography>
          <Typography variant="h3" align="center">
            {summary.adherenceRate}%
          </Typography>
          <Box sx={{ 
            height: 10, 
            width: '80%', 
            bgcolor: '#e0e0e0',
            borderRadius: 5,
            my: 2,
            mx: 'auto'
          }}>
            <Box 
              sx={{ 
                height: '100%', 
                width: `${summary.adherenceRate}%`, 
                bgcolor: summary.adherenceRate > 80 ? '#4caf50' : summary.adherenceRate > 50 ? '#ff9800' : '#f44336',
                borderRadius: 5
              }}
            />
          </Box>
          <Typography variant="body2" align="center">
            Basado en asistencia y ejercicios
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, flex: '1 1 calc(25% - 24px)', minWidth: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" align="center" gutterBottom>
            Progreso del Tratamiento
          </Typography>
          <Typography variant="h3" align="center">
            {summary.sessionsCount}
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Sesiones realizadas
          </Typography>
          <Typography variant="body2" align="center">
            Desde: {new Date(summary.initialDate).toLocaleDateString()}
          </Typography>
        </Paper>
      </Box>

      {/* Pestañas para diferentes visualizaciones */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="functional assessment tabs"
          centered
        >
          <Tab label="Evolución Funcional" />
          <Tab label="Objetivos" />
          <Tab label="Dolor" />
          <Tab label="Rango de Movimiento" />
        </Tabs>
      </Box>

      {/* Contenido de las pestañas */}
      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && (
          <Card>
            <CardHeader title="Evaluación de Capacidad Funcional" />
            <CardContent>
              <FunctionalityChart 
                data={functionalityData}
                height={400}
                showLegend
                showPreviousData
              />
            </CardContent>
          </Card>
        )}

        {currentTab === 1 && (
          <Card>
            <CardHeader title="Progreso en Objetivos de Tratamiento" />
            <CardContent>
              <TreatmentGoalsChart 
                data={treatmentGoals}
                height={400}
                showLegend
              />
            </CardContent>
          </Card>
        )}

        {currentTab === 2 && (
          <Card>
            <CardHeader title="Evolución del Dolor" />
            <CardContent>
              <PainEvolutionChart 
                painData={painData}
                height={400}
                showGrid
                title=""
              />
            </CardContent>
          </Card>
        )}

        {currentTab === 3 && (
          <Card>
            <CardHeader title="Rangos de Movimiento" />
            <CardContent>
              <ROMProgressChart 
                movements={romData}
                height={400}
                showGrid
                showNormalRange
              />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}; 