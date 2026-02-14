'use client';

import { useState, useEffect } from 'react';
import type { AIRecommendation, ApiResponse } from '@/types';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (dismissed?: boolean) => {
    try {
      const params = new URLSearchParams();
      if (dismissed !== undefined) params.append('dismissed', dismissed.toString());
      const response = await fetch(`/api/recommendations?${params}`);
      const data: ApiResponse<AIRecommendation[]> = await response.json();
      if (data.success && data.data) {
        setRecommendations(data.data.filter((rec) => !rec.dismissed));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/recommendations/refresh', {
        method: 'POST',
      });
      const data: ApiResponse<AIRecommendation[]> = await response.json();
      if (data.success && data.data) {
        setRecommendations(data.data.filter((rec) => !rec.dismissed));
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const dismissRecommendation = async (id: string) => {
    try {
      setRecommendations((prev) => prev.filter((rec) => rec._id !== id));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  return {
    recommendations,
    loading,
    refreshing,
    fetchRecommendations,
    refreshRecommendations,
    dismissRecommendation,
  };
};