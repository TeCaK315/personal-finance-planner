'use client';

import { useState, useEffect } from 'react';
import type { Budget, BudgetSummary, CreateBudgetRequest, ApiResponse } from '@/types';

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget();
    fetchSummary();
  }, []);

  const fetchBudget = async (month?: string) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      const response = await fetch(`/api/budget?${params}`);
      const data: ApiResponse<Budget> = await response.json();
      if (data.success && data.data) {
        setBudget(data.data);
      } else {
        setBudget(null);
      }
    } catch (error) {
      setBudget(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (month?: string) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      const response = await fetch(`/api/budget/summary?${params}`);
      const data: ApiResponse<BudgetSummary> = await response.json();
      if (data.success && data.data) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const createBudget = async (budgetData: CreateBudgetRequest) => {
    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });
      const data: ApiResponse<Budget> = await response.json();
      if (data.success && data.data) {
        setBudget(data.data);
        await fetchSummary(budgetData.month);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const updateBudget = async (budgetData: CreateBudgetRequest) => {
    try {
      const response = await fetch('/api/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });
      const data: ApiResponse<Budget> = await response.json();
      if (data.success && data.data) {
        setBudget(data.data);
        await fetchSummary(budgetData.month);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return {
    budget,
    summary,
    loading,
    fetchBudget,
    fetchSummary,
    createBudget,
    updateBudget,
  };
};