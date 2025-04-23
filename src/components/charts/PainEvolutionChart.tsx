import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';;;;;
import { Box, Typography } from '@mui/material';;;;;

interface PainDataPoint {
  date: string;
  value: number;
}

interface PainEvolutionChartProps {
  painData: PainDataPoint[];
  height?: number;
  showGrid?: boolean;
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <Typography variant="body2">{label}</Typography>
        <Typography 
          variant="body2" 
          sx={{ color: payload[0].color }}
        >
          {`Dolor: ${payload[0].value}/10`}
        </Typography>
      </Box>
    );
  }

  return null;
};

export const PainEvolutionChart: React.FC<PainEvolutionChartProps> = ({
  painData,
  height = 300,
  showGrid = true,
  title = 'Evolución del Dolor',
}) => {
  // Colores para el gradiente
  const painColor = '#e11d48'; // Rojo para dolor
  const gradientEndColor = '#fff1f2'; // Muy claro para el área

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={painData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={painColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={gradientEndColor} stopOpacity={0.3} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="date" 
            type="category"
            allowDuplicatedCategory={false}
          />
          <YAxis 
            domain={[0, 10]} 
            ticks={[0, 2, 4, 6, 8, 10]}
            label={{ value: 'Intensidad (0-10)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke={painColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#painGradient)"
            activeDot={{ r: 6 }}
            name="Dolor"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}; 