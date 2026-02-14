'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import type { SpendingReport, TrendReport, ReportFilters } from '@/types';

export function useSpendingReport(filters: ReportFilters) {
  const [report, setReport] = useState<SpendingReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/reports/spending', {
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        categoryIds: filters.categoryIds,
        budgetId: filters.budgetId,
      });
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate spending report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters.startDate, filters.endDate, filters.categoryIds, filters.budgetId]);

  return { report, isLoading, error, refetch: fetchReport };
}

export function useTrendReport(filters: ReportFilters) {
  const [report, setReport] = useState<TrendReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/reports/trends', {
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        categoryIds: filters.categoryIds,
        budgetId: filters.budgetId,
      });
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate trend report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters.startDate, filters.endDate, filters.categoryIds, filters.budgetId]);

  return { report, isLoading, error, refetch: fetchReport };
}