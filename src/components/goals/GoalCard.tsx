'use client';

import { Target, Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalProgress } from './GoalProgress';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { FinancialGoal } from '@/types';

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onUpdateProgress }: GoalCardProps) {
  const getStatusColor = () => {
    switch (goal.status) {
      case 'completed':
        return 'text-green-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-accent';
    }
  };

  const getTypeColor = () => {
    return goal.type === 'short-term' ? 'from-accent to-primary' : 'from-secondary to-primary';
  };

  return (
    <Card className="p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeColor()} flex items-center justify-center`}>
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">{goal.name}</h3>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-text/60 hover:text-primary"
            aria-label="Edit goal"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal._id)}
            className="p-2 rounded-lg hover:bg-red-400/10 transition-colors text-text/60 hover:text-red-400"
            aria-label="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-text/60 mb-4">{goal.description}</p>
      )}

      <GoalProgress goal={goal} />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-text/60">Current</span>
          </div>
          <p className="text-lg font-bold text-text">
            {formatCurrency(goal.currentAmount)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-secondary" />
            <span className="text-xs text-text/60">Target</span>
          </div>
          <p className="text-lg font-bold text-text">
            {formatCurrency(goal.targetAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm text-text/80">
            Deadline: {formatDate(goal.deadline)}
          </span>
        </div>
      </div>

      {goal.status === 'active' && (
        <Button
          onClick={() => onUpdateProgress(goal._id)}
          variant="primary"
          className="w-full mt-4"
        >
          Update Progress
        </Button>
      )}
    </Card>
  );
}