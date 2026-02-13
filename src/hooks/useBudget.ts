'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Budget, ApiResponse, BudgetCalculationRequest } from '@/types';

export function useBudget(startDate?: Date, endDate?: Date) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/budget?${params.toString()}`);
      const data: ApiResponse<Budget> = await response.json();

      if (data.success && data.data) {
        setBudget(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const calculateBudget = async (request: BudgetCalculationRequest): Promise<Budget | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/budget/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: request.startDate.toISOString(),
          endDate: request.endDate.toISOString(),
          categories: request.categories,
        }),
      });

      const data: ApiResponse<Budget> = await response.json();

      if (data.success && data.data) {
        setBudget(data.data);
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to calculate budget:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    budget,
    loading,
    calculateBudget,
    refetch: fetchBudget,
  };
}