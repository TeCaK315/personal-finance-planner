'use client';

import React, { useState } from 'react';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/utils/api-client';
import { RefreshCw, Filter } from 'lucide-react';
import type { AIRecommendation } from '@/types';

export function RecommendationsList() {
  const { showToast } = useToast();
  const { recommendations, isLoading, error, refetch } = useRecommendations();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await apiClient.post('/api/ai/recommendations', {
        forceRegenerate: true,
      });
      showToast('Recommendations regenerated successfully', 'success');
      await refetch();
    } catch (error: any) {
      showToast(
        error.response?.data?.error || 'Failed to regenerate recommendations',
        'error'
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await apiClient.put(`/api/ai/recommendations/${id}`, {
        isDismissed: true,
      });
      showToast('Recommendation dismissed', 'success');
      await refetch();
    } catch (error: any) {
      showToast(
        error.response?.data?.error || 'Failed to dismiss recommendation',
        'error'
      );
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.put(`/api/ai/recommendations/${id}`, {
        isRead: true,
      });
      await refetch();
    } catch (error: any) {
      showToast(
        error.response?.data?.error || 'Failed to mark as read',
        'error'
      );
    }
  };

  const filteredRecommendations = recommendations.filter((rec: AIRecommendation) => {
    if (filter === 'unread') return !rec.isRead;
    if (filter === 'high') return rec.priority === 'high';
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="primary" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({recommendations.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({recommendations.filter((r: AIRecommendation) => !r.isRead).length})
            </Button>
            <Button
              variant={filter === 'high' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('high')}
            >
              High Priority ({recommendations.filter((r: AIRecommendation) => r.priority === 'high').length})
            </Button>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={handleRegenerate}
          isLoading={isRegenerating}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No recommendations found</p>
          <p className="text-sm text-gray-400">
            {filter !== 'all'
              ? 'Try changing the filter'
              : 'Add transactions to get personalized recommendations'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec: AIRecommendation) => (
            <RecommendationCard
              key={rec._id}
              recommendation={rec}
              onDismiss={handleDismiss}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}