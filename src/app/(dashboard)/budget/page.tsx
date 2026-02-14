'use client';

import React from 'react';
import { BudgetCalculator } from '@/components/budget/BudgetCalculator';
import { CategoryBreakdown } from '@/components/budget/CategoryBreakdown';
import { useBudget } from '@/hooks/useBudget';

export default function BudgetPage() {
  const { summary, isLoading } = useBudget();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Budget Calculator</h1>
        <p className="text-slate-400">Track your income and expenses to maintain financial balance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetCalculator />
        <CategoryBreakdown summary={summary} isLoading={isLoading} />
      </div>
    </div>
  );
}