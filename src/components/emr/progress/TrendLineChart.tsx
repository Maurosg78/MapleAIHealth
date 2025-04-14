import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar componentes ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TooltipContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number;
  };
}

interface TrendLineChartProps {
  data: {
    date: string;
    value: number;
    label?: string;
  }[];
  title: string;
  maxValue?: number;
  normalValue?: number;
  className?: string;
  yAxisLabel?: string;
  colors?: {
    line: string;
    point: string;
    normalLine?: string;
  };
}

export const TrendLineChart = ({
  data,
  title,
  maxValue,
  normalValue,
  className,
  yAxisLabel = 'Valor',
  colors = { line: 'rgb(53, 162, 235)', point: 'rgb(53, 162, 235)', normalLine: 'rgba(255, 99, 132, 0.5)' }
}: TrendLineChartProps) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Ordenar datos por fecha
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Formatear fechas para mostrar
    const labels = sortedData.map(item => 
      new Date(item.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    );

    // Dataset principal
    const datasets = [
      {
        label: title,
        data: sortedData.map(item => item.value),
        borderColor: colors.line,
        backgroundColor: colors.point,
        tension: 0.2
      }
    ];

    // Si hay un valor normal, añadir línea de referencia
    if (normalValue !== undefined) {
      datasets.push({
        label: 'Valor Normal',
        data: Array(labels.length).fill(normalValue),
        borderColor: colors.normalLine || 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointStyle: false,
        tension: 0
      });
    }

    return {
      labels,
      datasets
    };
  }, [data, title, normalValue, colors]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: TooltipContext) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + (yAxisLabel ? ` ${yAxisLabel}` : '');
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: maxValue,
          title: {
            display: true,
            text: yAxisLabel
          }
        }
      }
    };
  }, [maxValue, yAxisLabel]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos suficientes para mostrar la tendencia</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className || ''}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-[250px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}; 