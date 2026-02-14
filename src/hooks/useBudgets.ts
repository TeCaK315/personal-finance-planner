'use client';

import { useState, useEffect, useCallback } from 'react';
import { Budget, ApiResponse } from '@/types';

interface UseBudgetsOptions {
  period?: string;
  active?: boolean;
  autoFetch?: boolean;
}

export function useBudgets(options: UseBudgetsOptions = {}) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.period) params.append('period', options.period);
      if (options.active !== undefined) params.append('active', String(options.active));

      const response = await fetch(`/api/budgets?${params.toString()}`, {
        credentials: 'include',
      });

      const data: ApiResponse<Budget[]> = await response.json();

      if (data.success && data.data) {
        setBudgets(data.data);
      } else {
        setError(data.error || 'Failed to fetch budgets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [options.period, options.active]);

  const createBudget = async (budgetData: {
    name: string;
    totalAmount: number;
    period: 'monthly' | 'weekly' | 'yearly';
    startDate: string;
    endDate: string;
    categories: { categoryId: string; categoryName: string; allocatedAmount: number }[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(budgetData),
      });

      const data: ApiResponse<Budget> = await response.json();

      if (data.success && data.data) {
        setBudgets((prev) => [...prev, data.data!]);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create budget');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create budget';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (
    id: string,
    updates: Partial<Pick<Budget, 'name' | 'totalAmount' | 'categories'>>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const data: ApiResponse<Budget> = await response.json();

      if (data.success && data.data) {
        setBudgets((prev) => prev.map((b) => (b._id === id ? data.data! : b)));
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update budget');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update budget';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data: ApiResponse<never> = await response.json();

      if (data.success) {
        setBudgets((prev) => prev.filter((b) => b._id !== id));
      } else {
        throw new Error(data.error || 'Failed to delete budget');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete budget';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchBudgets();
    }
  }, [fetchBudgets, options.autoFetch]);

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}