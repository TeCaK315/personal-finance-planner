'use client';

import { useState, useEffect } from 'react';
import type { Budget, ApiResponse } from '@/types';

export function useBudget(startDate?: string, endDate?: string) {
  const [budget, setBudget] = useState<Budget>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categoryBreakdown: [],
    monthlyTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBudget = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`/api/budget?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: ApiResponse<Budget> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch budget');
      }

      setBudget(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [startDate, endDate]);

  return {
    budget,
    loading,
    error,
    refetch: fetchBudget,
  };
}