'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useBudget } from '@/hooks/useBudget';

export const CategoryBreakdown: React.FC = () => {
  const { summary, loading } = useBudget();

  const getCategoryLabel = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const breakdown = summary?.categoryBreakdown || [];
  const totalSpent = breakdown.reduce((sum, item) => sum + item.spent, 0);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold text-gray-800">Category Breakdown</h3>
        <p className="text-sm text-gray-600">
          Total Expenses: ${totalSpent.toFixed(2)}
        </p>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No expense data yet</p>
            <p className="text-sm mt-2">Add transactions to see breakdown</p>
          </div>
        ) : (
          <div className="space-y-4">
            {breakdown.map((item, index) => {
              const percentage = totalSpent > 0 ? (item.spent / totalSpent) * 100 : 0;
              const limitPercentage = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getColor(index)}`}></div>
                      <span className="font-medium text-gray-800">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ${item.spent.toFixed(2)}
                      </p>
                      {item.limit > 0 && (
                        <p className="text-xs text-gray-600">
                          of ${item.limit.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getColor(index)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    {item.limit > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {percentage.toFixed(1)}% of total
                        </span>
                        <span
                          className={`font-medium ${
                            limitPercentage > 100
                              ? 'text-red-600'
                              : limitPercentage > 80
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {limitPercentage.toFixed(1)}% of budget
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};