'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import type { Budget, BudgetStatus, PaginatedResponse } from '@/types';

export function useBudgets(params?: { page?: number; limit?: number; active?: boolean }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PaginatedResponse<Budget>>('/api/budgets', {
        params,
      });
      if (response.data.success) {
        setBudgets(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [params?.page, params?.limit, params?.active]);

  return { budgets, pagination, isLoading, error, refetch: fetchBudgets };
}

export function useBudget(budgetId: string) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = async () => {
    if (!budgetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/budgets/${budgetId}`);
      if (response.data.success) {
        setBudget(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch budget');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [budgetId]);

  return { budget, isLoading, error, refetch: fetchBudget };
}

export function useBudgetStatus(budgetId: string) {
  const [status, setStatus] = useState<BudgetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!budgetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/budgets/${budgetId}/status`);
      if (response.data.success) {
        setStatus(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch budget status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [budgetId]);

  return { status, isLoading, error, refetch: fetchStatus };
}