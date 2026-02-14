'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useBudget } from '@/hooks/useBudget';
import type { TransactionCategory } from '@/types';

const expenseCategories: TransactionCategory[] = [
  'housing',
  'transportation',
  'food',
  'utilities',
  'healthcare',
  'entertainment',
  'shopping',
  'education',
  'other_expense',
];

export const BudgetCalculator: React.FC = () => {
  const { budget, summary, createBudget, updateBudget, loading } = useBudget();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [categoryLimits, setCategoryLimits] = useState<
    { category: TransactionCategory; limit: number }[]
  >([]);

  useEffect(() => {
    if (budget) {
      setCategoryLimits(budget.categoryLimits);
      setMonth(budget.month);
    } else {
      setCategoryLimits(
        expenseCategories.map((cat) => ({ category: cat, limit: 0 }))
      );
    }
  }, [budget]);

  const handleLimitChange = (category: TransactionCategory, value: string) => {
    const limit = parseFloat(value) || 0;
    setCategoryLimits((prev) => {
      const existing = prev.find((item) => item.category === category);
      if (existing) {
        return prev.map((item) =>
          item.category === category ? { ...item, limit } : item
        );
      }
      return [...prev, { category, limit }];
    });
  };

  const handleSave = async () => {
    const validLimits = categoryLimits.filter((item) => item.limit > 0);
    if (budget) {
      await updateBudget({ month, categoryLimits: validLimits });
    } else {
      await createBudget({ month, categoryLimits: validLimits });
    }
  };

  const totalBudget = categoryLimits.reduce((sum, item) => sum + item.limit, 0);

  const getCategoryLabel = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold text-gray-800">Budget Calculator</h3>
        <p className="text-sm text-gray-600">Set spending limits for each category</p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="space-y-4 mb-6">
          {expenseCategories.map((category) => {
            const limit =
              categoryLimits.find((item) => item.category === category)?.limit || 0;
            const spent =
              summary?.categoryBreakdown.find((item) => item.category === category)
                ?.spent || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {getCategoryLabel(category)}
                  </label>
                  {limit > 0 && (
                    <span className="text-sm text-gray-600">
                      ${spent.toFixed(2)} / ${limit.toFixed(2)}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={limit || ''}
                  onChange={(e) => handleLimitChange(category, e.target.value)}
                  placeholder="0.00"
                />
                {limit > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage > 100
                          ? 'bg-red-500'
                          : percentage > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mb-6">
          <span className="font-semibold text-gray-800">Total Budget</span>
          <span className="text-2xl font-bold text-primary">
            ${totalBudget.toFixed(2)}
          </span>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Saving...' : budget ? 'Update Budget' : 'Create Budget'}
        </Button>
      </CardContent>
    </Card>
  );
};