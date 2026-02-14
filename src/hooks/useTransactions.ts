'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import type { Transaction, TransactionFilters, PaginatedResponse } from '@/types';

interface UseTransactionsParams extends TransactionFilters {
  page?: number;
  limit?: number;
}

export function useTransactions(params?: UseTransactionsParams) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams: any = { ...params };
      if (params?.startDate) {
        queryParams.startDate = params.startDate.toISOString();
      }
      if (params?.endDate) {
        queryParams.endDate = params.endDate.toISOString();
      }

      const response = await apiClient.get<PaginatedResponse<Transaction>>(
        '/api/transactions',
        { params: queryParams }
      );
      if (response.data.success) {
        setTransactions(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [
    params?.page,
    params?.limit,
    params?.startDate,
    params?.endDate,
    params?.categoryId,
    params?.type,
    params?.minAmount,
    params?.maxAmount,
    params?.search,
  ]);

  return { transactions, pagination, isLoading, error, refetch: fetchTransactions };
}

export function useTransaction(transactionId: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = async () => {
    if (!transactionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/transactions/${transactionId}`);
      if (response.data.success) {
        setTransaction(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transaction');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  return { transaction, isLoading, error, refetch: fetchTransaction };
}