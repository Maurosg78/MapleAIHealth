import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';;;;;
import { Box, Typography } from '@mui/material';;;;;

interface MovementData {
  date: string;
  value: number;
}

interface Movement {
  name: string;
  data: MovementData[];
  color: string;
  normalRange?: [number, number];
}

interface ROMProgressChartProps {
  movements: Movement[];
  height?: number;
  yAxisLabel?: string;
  showGrid?: boolean;
  showNormalRange?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
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
        {payload.map((item, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: item.color }}
          >
            {`${item.name}: ${item.value}°`}
          </Typography>
        ))}
      </Box>
    );
  }

  return null;
};

export const ROMProgressChart: React.FC<ROMProgressChartProps> = ({
  movements,
  height = 400,
  yAxisLabel = 'ROM (grados)',
  showGrid = true,
  showNormalRange = true,
}) => {
  // Ordenar las fechas para asegurar que los datos se muestran cronológicamente
  // const sortedDates = Array.from(new Set(movements.flatMap(m => m.data.map(d => d.date))))
  //   .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // No usado actualmente

  // Encontrar el rango máximo para el eje Y
  const allValues = movements.flatMap(m => m.data.map(d => d.value));
  const maxValue = Math.max(...allValues, 0);
  const yAxisMax = Math.ceil(maxValue * 1.1); // Añadir un 10% extra para visualización

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="date"
            allowDuplicatedCategory={false}
            type="category"
          />
          <YAxis
            domain={[0, yAxisMax]}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {showNormalRange &&
            movements
              .filter(m => m.normalRange)
              .map((movement, index) => (
                <ReferenceLine
                  key={`ref-${index}-max`}
                  y={movement.normalRange ?? undefined[1]}
                  stroke={movement.color}
                  strokeDasharray="3 3"
                  label={`Máx. Normal ${movement.name}`}
                />
              ))}

          {movements.map((movement, index) => (
            <Line
              key={`line-${index}`}
              name={movement.name}
              data={movement.data}
              dataKey="value"
              stroke={movement.color}
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}; 