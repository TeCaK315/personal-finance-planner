'use client';

import { BudgetCalculator } from '@/components/budget/BudgetCalculator';
import { CategoryBreakdown } from '@/components/budget/CategoryBreakdown';
import { MonthlyTrendChart } from '@/components/budget/MonthlyTrendChart';

export default function BudgetPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Budget Calculator</span>
        </h1>
        <p className="text-gray-400">Analyze your spending and plan your budget</p>
      </div>

      <BudgetCalculator />

      <div className="grid lg:grid-cols-2 gap-8">
        <CategoryBreakdown />
        <MonthlyTrendChart />
      </div>
    </div>
  );
}