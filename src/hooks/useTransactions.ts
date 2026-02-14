'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFilters, PaginatedResponse } from '@/types';

interface UseTransactionsOptions extends TransactionFilters {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.budgetId) params.append('budgetId', options.budgetId);
      if (options.categoryId) params.append('categoryId', options.categoryId);
      if (options.type) params.append('type', options.type);
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        credentials: 'include',
      });

      const data: PaginatedResponse<Transaction> = await response.json();

      if (data.success && data.data) {
        setTransactions(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [
    options.budgetId,
    options.categoryId,
    options.type,
    options.startDate,
    options.endDate,
    options.page,
    options.limit,
  ]);

  const createTransaction = async (transactionData: {
    budgetId: string;
    type: 'income' | 'expense';
    amount: number;
    categoryId: string;
    categoryName: string;
    description: string;
    date: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (data.success && data.data) {
        await fetchTransactions();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Pick<Transaction, 'amount' | 'categoryId' | 'categoryName' | 'description' | 'date'>>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTransactions();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        await fetchTransactions();
      } else {
        throw new Error(data.error || 'Failed to delete transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchTransactions();
    }
  }, [fetchTransactions, options.autoFetch]);

  return {
    transactions,
    loading,
    error,
    pagination,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}