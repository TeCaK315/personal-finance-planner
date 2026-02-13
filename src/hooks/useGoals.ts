'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FinancialGoal, ApiResponse } from '@/types';

export function useGoals(status?: 'active' | 'completed' | 'cancelled', type?: 'short-term' | 'long-term') {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (type) params.append('type', type);

      const response = await fetch(`/api/goals?${params.toString()}`);
      const data: ApiResponse<FinancialGoal[]> = await response.json();

      if (data.success && data.data) {
        setGoals(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  }, [status, type]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (data: {
    name: string;
    type: 'short-term' | 'long-term';
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    description?: string;
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to create goal:', error);
      return false;
    }
  };

  const updateGoal = async (id: string, data: Partial<FinancialGoal>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to update goal:', error);
      return false;
    }
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to delete goal:', error);
      return false;
    }
  };

  const updateProgress = async (id: string, amount: number, note?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/goals/${id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, note }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to update progress:', error);
      return false;
    }
  };

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    refetch: fetchGoals,
  };
}