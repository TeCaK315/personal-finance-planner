'use client';

import { useState, useCallback } from 'react';
import { AIRecommendation, ApiResponse } from '@/types';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = useCallback(async (budgetId?: string, forceRegenerate = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ budgetId, forceRegenerate }),
      });

      const data: ApiResponse<AIRecommendation[]> = await response.json();

      if (data.success && data.data) {
        setRecommendations(data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await generateRecommendations(undefined, false);
  }, [generateRecommendations]);

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
    refetch,
  };
}