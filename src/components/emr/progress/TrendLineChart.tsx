import { Chart as ChartJS, registerables, ChartData, ChartOptions, TooltipItem } from 'chart.js';;;;;
import { Line } from 'react-chartjs-2';;;;;

ChartJS.register(...registerables);

interface TrendLineChartProps {
  data: ChartData<'line'>;
  normalValue?: number;
}

export const TrendLineChart = ({ data, normalValue }: TrendLineChartProps): void => {
  const chartData: ChartData<'line'> = {
    ...data,
    labels: data.labels || [],
    datasets: [
      ...data.datasets,
      ...(normalValue
        ? [
            {
              label: 'Valor Normal',
              data: (data.labels || []).map(() => normalValue),
              borderColor: '#6B7280',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              borderDash: [5, 5],
              tension: 0,
              pointStyle: 'none' as const,
            },
          ]
        : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: TooltipItem<'line'>) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}; 