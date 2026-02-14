'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useBudgetStatus } from '@/hooks/useBudgets';
import { Skeleton } from '@/components/ui/Skeleton';
import { Edit, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Budget } from '@/types';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { status, isLoading } = useBudgetStatus(budget._id);

  const handleEdit = () => {
    onEdit(budget);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      onDelete(budget._id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(new Date(budget.startDate))} -{' '}
              {formatDate(new Date(budget.endDate))}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-gray-600 hover:text-primary"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-gray-600 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Budget
                </span>
                <span className="text-sm font-semibold">
                  {formatCurrency(status.totalSpent)} /{' '}
                  {formatCurrency(status.totalAmount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    status.percentageUsed > 100
                      ? 'bg-red-500'
                      : status.percentageUsed > 80
                      ? 'bg-yellow-500'
                      : 'bg-gradient-to-r from-primary to-accent'
                  }`}
                  style={{
                    width: `${Math.min(status.percentageUsed, 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {status.percentageUsed.toFixed(1)}% used
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {formatCurrency(status.remainingAmount)} remaining
                </span>
              </div>
            </div>

            {status.overspendingCategories.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-red-700">
                    Overspending Alert
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {status.overspendingCategories.join(', ')}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <TrendingUp className="w-4 h-4" />
                <span>Category Breakdown</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {status.categoryBreakdown.map((cat) => (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">
                        {cat.categoryName}
                      </span>
                      <span
                        className={
                          cat.isOverspent ? 'text-red-600' : 'text-gray-600'
                        }
                      >
                        {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cat.isOverspent
                            ? 'bg-red-500'
                            : cat.percentageUsed > 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(cat.percentageUsed, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Unable to load budget status</p>
        )}
      </CardContent>
    </Card>
  );
}