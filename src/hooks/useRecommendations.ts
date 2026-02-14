'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import type { AIRecommendation } from '@/types';

export function useRecommendations(budgetId?: string) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/ai/recommendations', {
        budgetId,
      });
      if (response.data.success) {
        setRecommendations(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [budgetId]);

  return { recommendations, isLoading, error, refetch: fetchRecommendations };
}

export function useGenerateRecommendations() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (budgetId?: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/ai/recommendations', {
        budgetId,
        forceRegenerate: true,
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate recommendations');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, error };
}