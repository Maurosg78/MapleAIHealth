import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

export interface PatientProgressData {
  patientId: string;
  patientName: string;
  age: number;
  diagnosis: string;
  color: string;
  data: Array<{
    date: number; // timestamp en milisegundos
    value: number;
  }>;
}

interface PatientComparisonChartProps {
  data: PatientProgressData[];
  normalRange?: [number, number];
  targetValue?: number;
  unit: string;
  title: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: number;
  unit: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: '1px solid #ccc',
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {new Date(label || 0).toLocaleDateString()}
        </Typography>
        {payload.map((entry, index) => (
          <Box
            key={`tooltip-${index}`}
            sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
          >
            <Box
              component="span"
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: entry.color,
                mr: 1,
                display: 'inline-block'
              }}
            />
            <Typography variant="body2" sx={{ mr: 2 }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {entry.value} {unit}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const formatDateTick = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
};

const PatientComparisonChart: React.FC<PatientComparisonChartProps> = ({
  data,
  normalRange,
  targetValue,
  unit,
  title
}) => {
  const theme = useTheme();
  
  // Encontrar el rango de fechas y valores para ajustar el gráfico
  const allDates = data.flatMap(patient => patient.data.map(d => d.date));
  const allValues = data.flatMap(patient => patient.data.map(d => d.value));
  
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.1;

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            type="number" 
            domain={[minDate, maxDate]} 
            tickFormatter={formatDateTick} 
            stroke={theme.palette.text.secondary}
          />
          <YAxis 
            domain={[minValue, maxValue]} 
            stroke={theme.palette.text.secondary}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip 
            content={<CustomTooltip unit={unit} />} 
          />
          <Legend />
          
          {normalRange && (
            <ReferenceArea
              y1={normalRange[0]}
              y2={normalRange[1]}
              fill={theme.palette.success.light}
              fillOpacity={0.2}
            />
          )}
          
          {targetValue && (
            <ReferenceLine
              y={targetValue}
              stroke={theme.palette.success.main}
              strokeDasharray="3 3"
              label={{
                value: `Objetivo: ${targetValue}${unit}`,
                position: 'insideBottomRight',
                fill: theme.palette.success.dark
              }}
            />
          )}
          
          {data.map((patient) => (
            <Line
              key={patient.patientId}
              name={`${patient.patientName} (${patient.age})`}
              data={patient.data}
              dataKey="value"
              stroke={patient.color}
              strokeWidth={2}
              dot={{ fill: patient.color, r: 4 }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PatientComparisonChart; 