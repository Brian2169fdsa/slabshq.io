'use client';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export function ProfitChart({ labels, values }: { labels: string[]; values: number[] }) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#3B82F6',
      },
    ],
  };
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => '$' + (c.parsed.y ?? 0).toLocaleString() } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } } },
      y: { grid: { color: '#EDF1F6' }, ticks: { color: '#94A3B8', font: { size: 11 }, callback: (v) => '$' + v } },
    },
  };
  return (
    <div className="chart-wrap">
      <Line data={data} options={options} />
    </div>
  );
}
