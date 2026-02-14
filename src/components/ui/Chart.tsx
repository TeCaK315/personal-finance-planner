'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#cbd5e1',
        font: {
          family: 'Inter, sans-serif',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(99, 102, 241, 0.5)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
      },
    },
  },
};

interface ChartProps {
  data: any;
  options?: any;
  height?: number;
}

export function LineChart({ data, options = {}, height = 300 }: ChartProps) {
  return (
    <div style={{ height }}>
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

export function BarChart({ data, options = {}, height = 300 }: ChartProps) {
  return (
    <div style={{ height }}>
      <Bar data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

export function PieChart({ data, options = {}, height = 300 }: ChartProps) {
  const pieOptions = {
    ...defaultOptions,
    ...options,
    scales: undefined,
  };
  return (
    <div style={{ height }}>
      <Pie data={data} options={pieOptions} />
    </div>
  );
}

export function DonutChart({ data, options = {}, height = 300 }: ChartProps) {
  const donutOptions = {
    ...defaultOptions,
    ...options,
    scales: undefined,
  };
  return (
    <div style={{ height }}>
      <Doughnut data={data} options={donutOptions} />
    </div>
  );
}