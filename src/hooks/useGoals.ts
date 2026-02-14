'use client';

import { useState, useEffect } from 'react';
import type {
  FinancialGoal,
  GoalProgress,
  CreateGoalRequest,
  UpdateGoalRequest,
  ApiResponse,
} from '@/types';

export const useGoals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async (status?: string) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      const response = await fetch(`/api/goals?${params}`);
      const data: ApiResponse<FinancialGoal[]> = await response.json();
      if (data.success && data.data) {
        setGoals(data.data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: CreateGoalRequest) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      const data: ApiResponse<FinancialGoal> = await response.json();
      if (data.success) {
        await fetchGoals();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const updateGoal = async (id: string, updates: UpdateGoalRequest) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data: ApiResponse<FinancialGoal> = await response.json();
      if (data.success) {
        await fetchGoals();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchGoals();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const updateGoalProgress = async (id: string, amount: number) => {
    try {
      const response = await fetch(`/api/goals/${id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchGoals();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const calculateProgress = (goal: FinancialGoal): GoalProgress => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const daysRemaining = Math.max(
      0,
      Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const monthsRemaining = daysRemaining / 30;
    const monthlyRequiredSavings =
      monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
    const onTrack = goal.currentAmount >= (goal.targetAmount * (1 - daysRemaining / 365));

    return {
      goalId: goal._id,
      percentage: Math.min(percentage, 100),
      remainingAmount,
      daysRemaining,
      monthlyRequiredSavings,
      onTrack,
    };
  };

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    calculateProgress,
  };
};