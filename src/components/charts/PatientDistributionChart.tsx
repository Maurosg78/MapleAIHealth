import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';;;;;

export interface DistributionData {
  name: string;
  value: number;
  color?: string;
}

export interface PatientDistributionChartProps {
  title: string;
  data: DistributionData[];
  type?: 'pie' | 'bar';
  colors?: string[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe',
  '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554',
];

/**
 * Componente para visualizar la distribución de diagnósticos o tratamientos
 */
const PatientDistributionChart: React.FC<PatientDistributionChartProps> = ({
  title,
  data,
  type = 'pie',
  colors = DEFAULT_COLORS,
  height = 300,
  className = '',
  showLegend = true,
  showLabels = true,
}) => {
  // Asignar colores a cada segmento
  const getColors = (): void => {
    return data.map((entry, index) => 
      entry.color || colors[index % colors.length]
    );
  };

  // Formatear valores para el tooltip
  const formatTooltipValue = (value: number) => [`${value}`, 'Cantidad'];

  // Interfaz para las props del label
  interface PieLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }

  // Función para renderizar el label en el gráfico de torta
  const renderCustomizedLabel = (props: PieLabelProps): void => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    
    if (!showLabels || percent < 0.05) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Renderizar el tipo de gráfico seleccionado
  const renderChart = (): void => {
    if (type === 'pie') {
      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColors()[index]} />
            ))}
          </Pie>
          {showLegend && <Legend layout="vertical" align="right" verticalAlign="middle" />}
          <Tooltip formatter={formatTooltipValue} />
        </PieChart>
      );
    }

    return (
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={70}
          tickFormatter={(value) => 
            value.length > 15 ? `${value.substring(0, 15)}...` : value
          }
        />
        <Tooltip formatter={formatTooltipValue} />
        {showLegend && <Legend />}
        <Bar dataKey="value" name="Cantidad">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColors()[index]} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div className={`patient-distribution-chart ${className}`}>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientDistributionChart; 