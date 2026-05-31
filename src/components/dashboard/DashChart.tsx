'use client';

import { useMemo, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { HuntingListing } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type Metric = 'profit' | 'margin' | 'score';

function barColor(score: number) {
  if (score >= 90) return '#3B82F6';
  if (score >= 80) return '#16A34A';
  return '#64748B';
}

function abbr(name: string) {
  return name.replace(/ (PSA|BGS).*/, '').split(' ').slice(0, 2).join(' ');
}

export function DashChart({ listings }: { listings: HuntingListing[] }) {
  const [metric, setMetric] = useState<Metric>('profit');
  const top = useMemo(
    () => [...listings].sort((a, b) => b.est_monthly_profit - a.est_monthly_profit).slice(0, 8),
    [listings],
  );

  const values = top.map((l) =>
    metric === 'profit' ? l.est_monthly_profit : metric === 'margin' ? l.margin_pct : l.score,
  );

  const data = {
    labels: top.map((l) => abbr(l.name)),
    datasets: [
      {
        data: values,
        backgroundColor: top.map((l) => barColor(l.score)),
        borderRadius: 6,
        maxBarThickness: 46,
      },
    ],
  };

  const prefix = metric === 'profit' ? '$' : '';
  const suffix = metric === 'margin' ? '%' : '';
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${prefix}${ctx.parsed.y}${suffix}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'var(--font-inter), Inter, sans-serif', size: 11 }, color: '#94A3B8' } },
      y: {
        grid: { color: '#EDF1F6' },
        ticks: {
          font: { family: 'var(--font-inter), Inter, sans-serif', size: 11 },
          color: '#94A3B8',
          callback: (v) => `${prefix}${v}${suffix}`,
        },
      },
    },
  };

  const segs: { key: Metric; label: string }[] = [
    { key: 'profit', label: 'Monthly Profit' },
    { key: 'margin', label: 'Margin %' },
    { key: 'score', label: 'Match Score' },
  ];

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">Top Listings by Performance</h3>
        <div className="seg" id="chart-seg">
          {segs.map((s) => (
            <button key={s.key} className={metric === s.key ? 'on' : ''} onClick={() => setMetric(s.key)} type="button">
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="legend">
        <span><i style={{ background: 'var(--blue)' }} /> Score 90+</span>
        <span><i style={{ background: 'var(--green)' }} /> Score 80–89</span>
        <span><i style={{ background: 'var(--gray)' }} /> Score 60–79</span>
      </div>
      <div className="chart-wrap">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
