import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';;;;;
import { Box, Typography } from '@mui/material';;;;;

export interface GoalData {
  name: string;
  currentValue: number;
  targetValue: number;
  initialValue: number;
}

interface TreatmentGoalsChartProps {
  data: GoalData[];
  height?: number;
  title?: string;
  showLegend?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: GoalData;
    value?: number;
    dataKey?: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const goalData = payload[0].payload as GoalData;
    const progress = Math.round(((goalData.currentValue - goalData.initialValue) / 
                                (goalData.targetValue - goalData.initialValue)) * 100);
    
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {goalData.name}
        </Typography>
        <Typography variant="body2">
          Valor inicial: {goalData.initialValue}
        </Typography>
        <Typography variant="body2">
          Valor actual: {goalData.currentValue}
        </Typography>
        <Typography variant="body2">
          Objetivo: {goalData.targetValue}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          Progreso: {progress}%
        </Typography>
      </Box>
    );
  }

  return null;
};

export const TreatmentGoalsChart: React.FC<TreatmentGoalsChartProps> = ({
  data,
  height = 400,
  title = 'Progreso en Objetivos de Tratamiento',
  showLegend = true,
}) => {
  // Colores para las barras
  const getBarColor = (goalData: GoalData): void => {
    // Si el valor actual es mayor o igual al objetivo, verde
    if (goalData.currentValue >= goalData.targetValue) {
      return '#10b981'; // Verde
    }
    
    // Calcular el progreso (0-100%)
    const progress = (goalData.currentValue - goalData.initialValue) / 
                    (goalData.targetValue - goalData.initialValue);
    
    if (progress >= 0.7) {
      return '#0ea5e9'; // Azul - buen progreso
    } else if (progress >= 0.4) {
      return '#f59e0b'; // Amarillo - progreso moderado
    } else {
      return '#ef4444'; // Rojo - progreso bajo
    }
  };

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              payload={[
                { value: 'Valor actual', type: 'rect', color: '#0ea5e9' },
                { value: 'Objetivo', type: 'line', color: '#000' }
              ]}
            />
          )}
          <Bar dataKey="currentValue" name="Valor actual">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
          {data.map((entry, index) => (
            <ReferenceLine
              key={`target-${index}`}
              x={entry.targetValue}
              stroke="black"
              strokeWidth={2}
              isFront={true}
              ifOverflow="extendDomain"
              segment={[
                { y: index - 0.4 },
                { y: index + 0.4 }
              ]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}; 