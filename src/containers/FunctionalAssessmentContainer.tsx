import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { FunctionalAssessmentDashboard } from '../components/dashboard/FunctionalAssessmentDashboard';
import { useParams } from 'react-router-dom';

// Importamos interfaces necesarias
import { FunctionalityData } from '../components/charts/FunctionalityChart';
import { GoalData } from '../components/charts/TreatmentGoalsChart';

// Definimos interfaces para los datos
interface FunctionalScores {
  mobility: number;
  selfCare: number;
  dailyActivities: number;
  painDiscomfort: number;
  anxietyDepression: number;
  [key: string]: number;
}

interface Assessment {
  date: string;
  painLevel: number;
  functionalScores: FunctionalScores;
}

interface ROMDataPoint {
  date: string;
  value: number;
}

interface ROMMovement {
  name: string;
  data: ROMDataPoint[];
  color: string;
  normalRange?: [number, number];
}

interface PatientData {
  patientInfo: {
    id: string;
    name: string;
  };
  assessments: Assessment[];
  goals: GoalData[];
  romData: ROMMovement[];
  summary: {
    initialDate: string;
    sessionsCount: number;
    adherenceRate: number;
    completedGoals: number;
    totalGoals: number;
  };
}

// Servicio para obtener datos de evaluación (simulado por ahora)
const fetchPatientAssessmentData = async (patientId: string): Promise<PatientData> => {
  // Simulamos una llamada a API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Datos de ejemplo de un paciente
      resolve({
        patientInfo: {
          id: patientId,
          name: 'Juan Pérez',
        },
        assessments: [
          {
            date: '2023-01-15',
            painLevel: 8,
            functionalScores: {
              mobility: 40,
              selfCare: 45,
              dailyActivities: 35,
              painDiscomfort: 30,
              anxietyDepression: 55,
            }
          },
          {
            date: '2023-02-15',
            painLevel: 6,
            functionalScores: {
              mobility: 50,
              selfCare: 55,
              dailyActivities: 45,
              painDiscomfort: 40,
              anxietyDepression: 60,
            }
          },
          {
            date: '2023-03-15',
            painLevel: 4,
            functionalScores: {
              mobility: 65,
              selfCare: 70,
              dailyActivities: 60,
              painDiscomfort: 65,
              anxietyDepression: 70,
            }
          },
          {
            date: '2023-04-15',
            painLevel: 3,
            functionalScores: {
              mobility: 75,
              selfCare: 80,
              dailyActivities: 70,
              painDiscomfort: 75,
              anxietyDepression: 75,
            }
          }
        ],
        goals: [
          { name: 'Caminar 30 min', initialValue: 5, currentValue: 20, targetValue: 30 },
          { name: 'Subir escaleras', initialValue: 0, currentValue: 1, targetValue: 2 },
          { name: 'Vestirse solo', initialValue: 0, currentValue: 1, targetValue: 1 },
          { name: 'Levantar 5kg', initialValue: 0, currentValue: 3, targetValue: 5 },
        ],
        romData: [
          { 
            name: 'Flexión Lumbar', 
            data: [
              { date: '2023-01-15', value: 30 },
              { date: '2023-02-15', value: 45 },
              { date: '2023-03-15', value: 55 },
              { date: '2023-04-15', value: 65 },
            ],
            color: '#8884d8',
            normalRange: [0, 90]
          },
          { 
            name: 'Extensión Lumbar', 
            data: [
              { date: '2023-01-15', value: 10 },
              { date: '2023-02-15', value: 15 },
              { date: '2023-03-15', value: 20 },
              { date: '2023-04-15', value: 25 },
            ],
            color: '#82ca9d',
            normalRange: [0, 30]
          }
        ],
        summary: {
          initialDate: '2023-01-15',
          sessionsCount: 8,
          adherenceRate: 85,
          completedGoals: 1,
          totalGoals: 4
        }
      });
    }, 1000); // Simulamos un tiempo de carga
  });
};

// Componente contenedor
export const FunctionalAssessmentContainer: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PatientData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!patientId) {
          throw new Error('ID de paciente no proporcionado');
        }

        const result = await fetchPatientAssessmentData(patientId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Transformar datos para los gráficos
  const prepareFunctionalityData = (): FunctionalityData[] => {
    if (!data) return [];

    const latestAssessment = data.assessments[data.assessments.length - 1];
    const previousAssessment = data.assessments.length > 1 
      ? data.assessments[data.assessments.length - 2] 
      : null;

    return Object.entries(latestAssessment.functionalScores).map(([key, value]) => ({
      area: key === 'painDiscomfort' 
        ? 'Dolor/Malestar' 
        : key === 'anxietyDepression' 
          ? 'Ansiedad/Depresión' 
          : key === 'mobility' 
            ? 'Movilidad' 
            : key === 'selfCare' 
              ? 'Autocuidado' 
              : 'Actividades Diarias',
      value: value,
      maxValue: 100,
      prevValue: previousAssessment ? previousAssessment.functionalScores[key] : undefined
    }));
  };

  const preparePainData = () => {
    if (!data) return [];
    
    return data.assessments.map((assessment) => ({
      date: new Date(assessment.date).toLocaleDateString(),
      value: assessment.painLevel
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">No hay datos disponibles</Alert>
      </Box>
    );
  }

  // Preparar datos para el resumen
  const summary = {
    initialDate: data.summary.initialDate,
    sessionsCount: data.summary.sessionsCount,
    currentPain: data.assessments[data.assessments.length - 1].painLevel,
    initialPain: data.assessments[0].painLevel,
    adherenceRate: data.summary.adherenceRate,
    completedGoals: data.summary.completedGoals,
    totalGoals: data.summary.totalGoals
  };

  return (
    <FunctionalAssessmentDashboard
      patientName={data.patientInfo.name}
      functionalityData={prepareFunctionalityData()}
      treatmentGoals={data.goals}
      painData={preparePainData()}
      romData={data.romData}
      summary={summary}
    />
  );
}; 