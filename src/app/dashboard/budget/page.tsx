'use client';

import { BudgetCalculator } from '@/components/budget/BudgetCalculator';
import { CategoryBreakdown } from '@/components/budget/CategoryBreakdown';
import { TransactionForm } from '@/components/budget/TransactionForm';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';

export default function BudgetPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Budget Calculator</h1>
        <p className="text-text/70">Track your income and expenses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BudgetCalculator key={refreshKey} />
          <CategoryBreakdown key={`breakdown-${refreshKey}`} />
        </div>
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
              <TransactionForm onSuccess={handleTransactionAdded} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}