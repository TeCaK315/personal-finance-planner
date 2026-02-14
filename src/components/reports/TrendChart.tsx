'use client';

import React from 'react';
import { LineChart } from '@/components/ui/Chart';
import { formatDate } from '@/utils/formatters';
import type { TrendDataPoint } from '@/types';

interface TrendChartProps {
  data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: formatDate(new Date(point.date)),
    Income: point.income,
    Expenses: point.expenses,
    'Net Savings': point.netSavings,
  }));

  return (
    <LineChart
      data={chartData}
      xKey="date"
      lines={[
        { key: 'Income', color: '#10b981' },
        { key: 'Expenses', color: '#ef4444' },
        { key: 'Net Savings', color: '#3b82f6' },
      ]}
      height={400}
    />
  );
}