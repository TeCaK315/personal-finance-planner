'use client';

import { useState, useEffect } from 'react';
import type { Recommendation, ApiResponse } from '@/types';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: ApiResponse<Recommendation[]> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      setRecommendations(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (forceRegenerate: boolean = false) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ forceRegenerate }),
      });

      const data: ApiResponse<Recommendation[]> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to generate recommendations');
      }

      setRecommendations(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
    refetch: fetchRecommendations,
  };
}