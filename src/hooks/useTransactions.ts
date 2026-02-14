'use client';

import { useState, useEffect } from 'react';
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  PaginatedResponse,
  TransactionFilters,
} from '@/types';

interface UseTransactionsOptions extends TransactionFilters {
  page?: number;
  limit?: number;
}

export const useTransactions = (options: UseTransactionsOptions = {}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [
    options.page,
    options.limit,
    options.type,
    options.category,
    options.startDate,
    options.endDate,
  ]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.type) params.append('type', options.type);
      if (options.category) params.append('category', options.category);
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());

      const response = await fetch(`/api/transactions?${params}`);
      const data: PaginatedResponse<Transaction> = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: CreateTransactionRequest) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTransactions();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const updateTransaction = async (id: string, updates: UpdateTransactionRequest) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTransactions();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchTransactions();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return {
    transactions,
    pagination,
    loading,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};