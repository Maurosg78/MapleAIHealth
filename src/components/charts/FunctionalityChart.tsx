import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip,  } from 'recharts';;;;;
import { Box, Typography } from '@mui/material';;;;;

export interface FunctionalityData {
  area: string;
  value: number;
  maxValue: number;
  prevValue?: number;
}

interface FunctionalityChartProps {
  data: FunctionalityData[];
  height?: number;
  title?: string;
  showLegend?: boolean;
  showPreviousData?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: FunctionalityData & {
      normalizedValue: number;
      normalizedPrevValue?: number;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = Math.round((data.value / data.maxValue) * 100);
    
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
          {data.area}
        </Typography>
        <Typography variant="body2">
          Valor actual: {data.value}/{data.maxValue} ({percentage}%)
        </Typography>
        {data.prevValue !== undefined && (
          <Typography variant="body2">
            Evaluación anterior: {data.prevValue}/{data.maxValue} ({Math.round((data.prevValue / data.maxValue) * 100)}%)
          </Typography>
        )}
      </Box>
    );
  }

  return null;
};

// Normalizar los datos para el gráfico de radar
const normalizeData = (data: FunctionalityData[]): void => {
  return data.map(item => ({
    ...item,
    normalizedValue: (item.value / item.maxValue) * 100,
    normalizedPrevValue: item.prevValue ? (item.prevValue / item.maxValue) * 100 : undefined
  }));
};

export const FunctionalityChart: React.FC<FunctionalityChartProps> = ({
  data,
  height = 400,
  title = 'Evaluación de Funcionalidad',
  showLegend = true,
  showPreviousData = false,
}) => {
  const normalizedData = normalizeData(data);

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={normalizedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="area" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend />
          )}
          <Radar
            name="Funcionalidad Actual"
            dataKey="normalizedValue"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.6}
          />
          {showPreviousData && (
            <Radar
              name="Evaluación Anterior"
              dataKey="normalizedPrevValue"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}; 