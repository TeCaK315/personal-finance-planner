'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AIRecommendation, ApiResponse, RecommendationRequest } from '@/types';

export function useRecommendations(category?: string, limit?: number) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/recommendations/history?${params.toString()}`);
      const data: ApiResponse<AIRecommendation[]> = await response.json();

      if (data.success && data.data) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const generateRecommendations = async (request: RecommendationRequest): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<AIRecommendation[]> = await response.json();

      if (data.success && data.data) {
        setRecommendations(data.data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    generateRecommendations,
    refetch: fetchRecommendations,
  };
}