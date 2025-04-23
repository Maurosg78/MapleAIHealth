import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';;;;;

export interface TherapeuticGoal {
  name: string;
  current: number;
  target: number;
  initial: number;
}

export interface GoalTrackingChartProps {
  title: string;
  goals: TherapeuticGoal[];
  maxValue?: number;
  colors?: {
    current: string;
    initial: string;
    target: string;
  };
  height?: number;
  className?: string;
}

/**
 * Componente para visualizar el seguimiento de objetivos terapéuticos
 */
const GoalTrackingChart: React.FC<GoalTrackingChartProps> = ({
  title,
  goals,
  maxValue = 100,
  colors = {
    current: '#3b82f6',
    initial: '#9ca3af',
    target: '#10b981'
  },
  height = 400,
  className = '',
}) => {
  // Transformar datos para el gráfico radar
  const formattedData = goals.map(goal => ({
    name: goal.name,
    current: goal.current,
    target: goal.target,
    initial: goal.initial,
    fullMark: maxValue
  }));

  // Calcular el porcentaje de progreso total
  const calculateOverallProgress = (): void => {
    if (goals.length === 0) return 0;
    
    let totalProgress = 0;
    goals.forEach(goal => {
      // Si el valor inicial es igual al objetivo, consideramos 100% de progreso
      if (goal.initial === goal.target) {
        totalProgress += 100;
      } else {
        // Calcular el progreso como porcentaje del camino recorrido
        const totalChange = goal.target - goal.initial;
        const actualChange = goal.current - goal.initial;
        const progressPercent = (actualChange / totalChange) * 100;
        
        // Limitar el progreso entre 0 y 100%
        totalProgress += Math.max(0, Math.min(100, progressPercent));
      }
    });
    
    return Math.round(totalProgress / goals.length);
  };

  const overallProgress = calculateOverallProgress();

  // Interfaz para el tooltip
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        initial: number;
        current: number;
        target: number;
        fullMark: number;
      };
    }>;
  }

  // Formatear el tooltip personalizado
  const CustomTooltip = ({ active, payload }: CustomTooltipProps): void => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-gray-500">Inicial: {data.initial}</p>
          <p className="text-blue-500">Actual: {data.current}</p>
          <p className="text-green-500">Objetivo: {data.target}</p>
          
          {data.initial !== data.target && (
            <p className="text-sm mt-1">
              {`Progreso: ${Math.round(((data.current - data.initial) / (data.target - data.initial)) * 100)}%`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`goal-tracking-chart ${className}`}>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-300 mr-1"></div>
            <div 
              className="h-6 w-24 bg-gray-200 rounded-full overflow-hidden"
              title={`Progreso general: ${overallProgress}%`}
            >
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {overallProgress}%
            </span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={formattedData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, maxValue]} />
            
            <Radar
              name="Inicial"
              dataKey="initial"
              stroke={colors.initial}
              fill={colors.initial}
              fillOpacity={0.3}
            />
            
            <Radar
              name="Actual"
              dataKey="current"
              stroke={colors.current}
              fill={colors.current}
              fillOpacity={0.6}
            />
            
            <Radar
              name="Objetivo"
              dataKey="target"
              stroke={colors.target}
              fill={colors.target}
              fillOpacity={0.1}
              strokeDasharray="5 5"
            />
            
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GoalTrackingChart; 