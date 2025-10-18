'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
      borderWidth?: number;
    }>;
  };
  title?: string;
  height?: number;
  showLegend?: boolean;
  centerText?: string;
}

export default function DoughnutChart({ 
  data, 
  title, 
  height = 300, 
  showLegend = true,
  centerText
}: DoughnutChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: centerText ? '60%' : '50%',
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Doughnut data={data} options={options} />
      {centerText && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#666',
            pointerEvents: 'none',
          }}
        >
          {centerText}
        </div>
      )}
    </div>
  );
}
