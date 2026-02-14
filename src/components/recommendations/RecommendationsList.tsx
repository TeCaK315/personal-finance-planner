'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RecommendationCard } from './RecommendationCard';
import { useRecommendations } from '@/hooks/useRecommendations';

export const RecommendationsList: React.FC = () => {
  const {
    recommendations,
    loading,
    refreshRecommendations,
    refreshing,
    dismissRecommendation,
  } = useRecommendations();
  const [filter, setFilter] = useState<string>('all');

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter === 'all') return true;
    return rec.type === filter;
  });

  const handleDismiss = async (id: string) => {
    await dismissRecommendation(id);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">AI Recommendations</h2>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Types</option>
            <option value="savings">Savings</option>
            <option value="spending">Spending</option>
            <option value="investment">Investment</option>
            <option value="goal">Goal</option>
            <option value="budget">Budget</option>
          </Select>
        </div>
        <Button onClick={refreshRecommendations} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No recommendations yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add more transactions to get personalized AI insights
          </p>
          <Button onClick={refreshRecommendations} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Generate Recommendations
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec._id}
              recommendation={rec}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
};