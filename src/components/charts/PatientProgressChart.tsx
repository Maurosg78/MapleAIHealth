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
  AreaChart,
  Area
} from 'recharts';

export interface MeasurementData {
  date: string;
  value: number;
  target?: number;
  unit?: string;
}

export interface PatientProgressChartProps {
  title: string;
  data: MeasurementData[];
  dataKey?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  colors?: {
    primary: string;
    secondary?: string;
    target?: string;
  };
  showTarget?: boolean;
  chartType?: 'line' | 'area';
  height?: number;
  className?: string;
}

/**
 * Componente para visualizar el progreso de un paciente a lo largo del tiempo
 */
const PatientProgressChart: React.FC<PatientProgressChartProps> = ({
  title,
  data,
  dataKey = 'value',
  yAxisLabel,
  xAxisLabel,
  colors = {
    primary: '#3b82f6',
    secondary: '#93c5fd',
    target: '#ef4444'
  },
  showTarget = true,
  chartType = 'line',
  height = 300,
  className = ''
}) => {
  // Función para formatear fechas en el eje X
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    } catch {
      return dateStr;
    }
  };

  // Interfaz para el parámetro entry del tooltip
  interface TooltipEntry {
    payload?: {
      unit?: string;
    };
  }

  // Función para formatear valores en el tooltip
  const formatTooltipValue = (value: number, name: string, entry: TooltipEntry) => {
    const unit = entry.payload?.unit || '';
    return [`${value} ${unit}`, name];
  };

  // Renderizar el tipo de gráfico seleccionado
  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
          />
          <YAxis 
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip formatter={formatTooltipValue} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            name="Valor actual" 
            stroke={colors.primary} 
            fill={colors.secondary || colors.primary + '80'} 
          />
          {showTarget && (
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Objetivo" 
              stroke={colors.target} 
              strokeDasharray="5 5" 
              activeDot={false}
            />
          )}
        </AreaChart>
      );
    }

    return (
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate} 
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis 
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip formatter={formatTooltipValue} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          name="Valor actual" 
          stroke={colors.primary} 
          activeDot={{ r: 8 }} 
        />
        {showTarget && (
          <Line 
            type="monotone" 
            dataKey="target" 
            name="Objetivo" 
            stroke={colors.target} 
            strokeDasharray="5 5" 
            activeDot={false}
          />
        )}
      </LineChart>
    );
  };

  return (
    <div className={`patient-progress-chart ${className}`}>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientProgressChart; 