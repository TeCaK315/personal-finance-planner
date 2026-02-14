'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/ui/Chart';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTrendReport } from '@/hooks/useReports';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface SpendingChartProps {
  startDate: Date;
  endDate: Date;
}

export function SpendingChart({ startDate, endDate }: SpendingChartProps) {
  const { report, isLoading, error } = useTrendReport({ startDate, endDate });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Spending Trends</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Spending Trends</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!report || report.dataPoints.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Spending Trends</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No data available for the selected period
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = report.dataPoints.map((point) => ({
    date: formatDate(new Date(point.date)),
    Income: point.income,
    Expenses: point.expenses,
    'Net Savings': point.netSavings,
  }));

  const trendIndicator =
    report.trend === 'increasing' ? '↑' : report.trend === 'decreasing' ? '↓' : '→';
  const trendColor =
    report.trend === 'increasing'
      ? 'text-red-500'
      : report.trend === 'decreasing'
      ? 'text-green-500'
      : 'text-gray-500';

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Spending Trends</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Avg. Monthly</p>
            <p className="text-sm font-semibold">
              {formatCurrency(report.averageMonthlyExpense)}
            </p>
            <p className={`text-xs font-medium ${trendColor}`}>
              {trendIndicator} {Math.abs(report.trendPercentage).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          xKey="date"
          lines={[
            { key: 'Income', color: '#10b981' },
            { key: 'Expenses', color: '#ef4444' },
            { key: 'Net Savings', color: '#3b82f6' },
          ]}
          height={300}
        />
      </CardContent>
    </Card>
  );
}