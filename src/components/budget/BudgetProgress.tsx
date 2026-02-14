'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface BudgetProgressProps {
  spent: number;
  total: number;
  showLabel?: boolean;
}

export function BudgetProgress({ spent, total, showLabel = true }: BudgetProgressProps) {
  const percentage = Math.min((spent / total) * 100, 100);
  const isOverBudget = spent > total;

  const getColorClass = () => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {formatCurrency(spent)} of {formatCurrency(total)}
          </span>
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}

      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${getColorClass()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
        </div>
      </div>

      {isOverBudget && (
        <p className="text-xs text-red-600 font-medium">
          Over budget by {formatCurrency(spent - total)}
        </p>
      )}
    </div>
  );
}