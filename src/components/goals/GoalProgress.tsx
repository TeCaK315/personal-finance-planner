'use client';

import { useMemo } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { formatPercentage } from '@/utils/formatters';
import type { FinancialGoal } from '@/types';

interface GoalProgressProps {
  goal: FinancialGoal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const milestones = useMemo(() => {
    return [0, 25, 50, 75, 100];
  }, []);

  const getProgressColor = () => {
    if (goal.progress >= 100) return 'from-green-400 to-green-600';
    if (goal.progress >= 75) return 'from-accent to-primary';
    if (goal.progress >= 50) return 'from-primary to-secondary';
    return 'from-secondary to-primary';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text/80">Progress</span>
        <span className="text-lg font-bold text-text">
          {formatPercentage(goal.progress)}
        </span>
      </div>

      <div className="relative">
        <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500 relative`}
            style={{ width: `${Math.min(goal.progress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between mt-2">
          {milestones.map((milestone) => {
            const isReached = goal.progress >= milestone;
            return (
              <div
                key={milestone}
                className="flex flex-col items-center"
                style={{ width: '20%' }}
              >
                <div className="relative">
                  {isReached ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-text/20" />
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    isReached ? 'text-text font-medium' : 'text-text/40'
                  }`}
                >
                  {milestone}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {goal.progress >= 100 && (
        <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
          <p className="text-sm text-green-400 font-medium text-center">
            🎉 Congratulations! Goal achieved!
          </p>
        </div>
      )}

      {goal.progress < 100 && goal.progress > 0 && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-text/60 text-center">
            {(100 - goal.progress).toFixed(1)}% remaining to reach your goal
          </p>
        </div>
      )}
    </div>
  );
}