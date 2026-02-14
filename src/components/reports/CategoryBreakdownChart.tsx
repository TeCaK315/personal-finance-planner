'use client';

import React from 'react';
import { PieChart } from '@/components/ui/Chart';
import type { CategorySpending } from '@/types';

interface CategoryBreakdownChartProps {
  data: CategorySpending[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No category data available</p>
      </div>
    );
  }

  const chartData = data.map((cat) => ({
    name: cat.categoryName,
    value: cat.totalAmount,
    percentage: cat.percentage,
  }));

  return (
    <div className="space-y-6">
      <PieChart data={chartData} height={300} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((cat, index) => (
          <div
            key={cat.categoryId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: `hsl(${(index * 360) / data.length}, 70%, 60%)`,
                }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {cat.categoryName}
                </p>
                <p className="text-xs text-gray-500">
                  {cat.transactionCount} transactions
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${cat.totalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {cat.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}