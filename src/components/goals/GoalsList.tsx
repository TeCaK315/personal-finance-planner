'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GoalCard } from './GoalCard';
import { GoalForm } from './GoalForm';
import { useGoals } from '@/hooks/useGoals';
import type { FinancialGoal } from '@/types';

export const GoalsList: React.FC = () => {
  const {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    calculateProgress,
  } = useGoals();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const handleCreateGoal = async (data: any) => {
    await createGoal(data);
    setIsFormOpen(false);
  };

  const handleUpdateGoal = async (data: any) => {
    if (editingGoal) {
      await updateGoal(editingGoal._id, data);
      setEditingGoal(null);
      setIsFormOpen(false);
    }
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleDelete = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId);
    }
  };

  const handleUpdateProgress = async (goalId: string, amount: number) => {
    await updateGoalProgress(goalId, amount);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Financial Goals</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No goals yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first financial goal
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            return (
              <GoalCard
                key={goal._id}
                goal={goal}
                progress={progress}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateProgress={handleUpdateProgress}
              />
            );
          })}
        </div>
      )}

      <GoalForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        goal={editingGoal}
      />
    </div>
  );
};