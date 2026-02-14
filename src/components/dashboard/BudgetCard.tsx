'use client';

import React from 'react';
import Link from 'next/link';
import { Budget } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { BudgetProgress } from '@/components/budget/BudgetProgress';
import { formatCurrency } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0);
  const percentageUsed = (totalSpent / budget.totalAmount) * 100;
  const remaining = budget.totalAmount - totalSpent;
  const isOverBudget = totalSpent > budget.totalAmount;

  return (
    <Link href={`/budgets/${budget._id}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="capitalize">{budget.period}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budget.totalAmount)}
              </p>
              <p className="text-sm text-gray-600">Total Budget</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <BudgetProgress
            spent={totalSpent}
            total={budget.totalAmount}
            showLabel={false}
          />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Spent</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {percentageUsed.toFixed(1)}% used
              </p>
            </div>

            <div className={`p-3 rounded-lg ${isOverBudget ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2 text-sm mb-1">
                <TrendingUp className={`w-4 h-4 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`} />
                <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                  {isOverBudget ? 'Over Budget' : 'Remaining'}
                </span>
              </div>
              <p className={`text-lg font-semibold ${isOverBudget ? 'text-red-900' : 'text-green-900'}`}>
                {formatCurrency(Math.abs(remaining))}
              </p>
              <p className={`text-xs mt-1 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {isOverBudget ? 'Exceeded' : 'Available'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Top Categories</p>
            <div className="space-y-2">
              {budget.categories
                .sort((a, b) => b.spentAmount - a.spentAmount)
                .slice(0, 3)
                .map((category) => (
                  <div key={category.categoryId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{category.categoryName}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(category.spentAmount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}