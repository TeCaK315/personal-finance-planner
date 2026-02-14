'use client';

import React from 'react';
import { Target, Calendar, TrendingUp, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { FinancialGoal, GoalProgress } from '@/types';

interface GoalCardProps {
  goal: FinancialGoal;
  progress: GoalProgress;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (goalId: string) => void;
  onUpdateProgress: (goalId: string, amount: number) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  progress,
  onEdit,
  onDelete,
  onUpdateProgress,
}) => {
  const [addAmount, setAddAmount] = React.useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAddProgress = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      onUpdateProgress(goal._id, amount);
      setAddAmount('');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-full">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{goal.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(goal)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onDelete(goal._id)}
              className="p-2 hover:bg-red-100 rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </span>
          </div>

          <ProgressBar value={progress.percentage} />

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Deadline</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(goal.deadline)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Days Left</p>
                <p className="text-sm font-medium text-gray-800">
                  {progress.daysRemaining} days
                </p>
              </div>
            </div>
          </div>

          {goal.status === 'active' && (
            <>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Monthly target:</span>{' '}
                  {formatCurrency(progress.monthlyRequiredSavings)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {progress.onTrack
                    ? '✓ On track to reach your goal'
                    : '⚠ Need to increase savings'}
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Add amount"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={handleAddProgress} disabled={!addAmount}>
                  Add
                </Button>
              </div>
            </>
          )}

          {goal.status === 'completed' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800">
                🎉 Goal Completed!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};