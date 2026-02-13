'use client';

import { useMemo } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PieChart } from '@/components/ui/Chart';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatters';

export function CategoryBreakdown() {
  const { budget, loading } = useBudget();

  const chartData = useMemo(() => {
    if (!budget?.categoryBreakdown) return [];
    return budget.categoryBreakdown.map((item, index) => ({
      name: item.category,
      value: item.total,
      percentage: item.percentage,
      fill: `hsl(${(index * 360) / budget.categoryBreakdown.length}, 70%, 60%)`,
    }));
  }, [budget]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-primary/10 rounded w-1/3 mb-6" />
          <div className="h-64 bg-primary/10 rounded" />
        </div>
      </Card>
    );
  }

  if (!budget || chartData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text">Category Breakdown</h2>
        </div>
        <div className="h-64 flex items-center justify-center text-text/60">
          <p>No expense data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <PieChartIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-text">Category Breakdown</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
          <PieChart data={chartData} height={300} />
        </div>

        <div className="space-y-3">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm font-medium text-text">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text">
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-text/60">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text">Total Expenses</span>
          <span className="text-lg font-bold text-text">
            {formatCurrency(budget.totalExpenses)}
          </span>
        </div>
      </div>
    </Card>
  );
}