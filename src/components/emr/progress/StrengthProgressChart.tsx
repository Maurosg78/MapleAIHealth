import { useMemo } from 'react';;;;;
import clsx from 'clsx';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';;;;;
import { Radar } from 'react-chartjs-2';;;;;

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface StrengthMeasurement {
  value: number;
}

interface StrengthProgressChartProps {
  data: {
    date: string;
    strength: Record<string, StrengthMeasurement>;
  }[];
  muscleGroups: {
    id: string;
    label: string;
  }[];
  className?: string;
}

// Definir interfaz para el contexto del tooltip
interface ChartTooltipContext {
  dataset: {
    label?: string;
  };
  raw: number;
}

export const StrengthProgressChart = ({
  data,
  muscleGroups,
  className
}: StrengthProgressChartProps) => {
  // Procesar los datos para la visualización
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !muscleGroups || muscleGroups.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Ordenar datos por fecha
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Crear labels a partir de los grupos musculares
    const labels = muscleGroups.map(group => group.label);

    // Crear datasets para cada fecha de evaluación
    const datasets = sortedData.map((item, index) => {
      // Crear colores que varían en intensidad según la fecha (más reciente = más intenso)
      const opacity = 0.5 + (index / sortedData.length) * 0.5;
      const color = `rgba(54, 162, 235, ${opacity})`;
      
      return {
        label: new Date(item.date).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit',
          year: '2-digit' 
        }),
        data: muscleGroups.map(group => 
          item.strength[group.id]?.value || 0
        ),
        backgroundColor: `rgba(54, 162, 235, 0.2)`,
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color
      };
    });

    return {
      labels,
      datasets
    };
  }, [data, muscleGroups]);

  // Opciones para el gráfico radar
  const options = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: ChartTooltipContext): string {
            return `${context.dataset.label || ''}: ${context.raw}/5`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  if (!data || data.length === 0 || !muscleGroups || muscleGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles de fuerza muscular</p>
      </div>
    );
  }

  return (
    <div className={clsx("p-4 bg-white rounded-lg shadow", className)}>
      <h3 className="font-medium text-gray-900 mb-4">Progreso de Fuerza Muscular</h3>
      
      <div className="h-[350px]">
        {/* @ts-expect-error - La API de Chart.js tiene tipos complejos que no coinciden exactamente */}
        <Radar data={chartData} options={options} />
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Escala: 0 (Ausente) - 5 (Normal)</p>
      </div>
    </div>
  );
}; 