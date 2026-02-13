'use client';

import { useState, useEffect } from 'react';
import type { Transaction, TransactionFilters, CreateTransactionRequest, UpdateTransactionRequest, ApiResponse } from '@/types';

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const response = await fetch(`/api/transactions?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: ApiResponse<{ transactions: Transaction[]; total: number }> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.data.transactions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transaction: CreateTransactionRequest) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transaction),
    });

    const data: ApiResponse<Transaction> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to create transaction');
    }

    await fetchTransactions();
  };

  const updateTransaction = async (id: string, transaction: UpdateTransactionRequest) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transaction),
    });

    const data: ApiResponse<Transaction> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to update transaction');
    }

    await fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: ApiResponse<null> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete transaction');
    }

    await fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters?.startDate, filters?.endDate, filters?.category, filters?.type, filters?.limit, filters?.offset]);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}