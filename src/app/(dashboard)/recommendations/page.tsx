'use client';

import React from 'react';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Brain } from 'lucide-react';

export default function RecommendationsPage() {
  const { recommendations, isLoading, refresh, isRefreshing } = useRecommendations();

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-primary" />
            AI Recommendations
          </h1>
          <p className="text-slate-400">Personalized financial advice powered by artificial intelligence.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Generating...' : 'Refresh'}
        </Button>
      </div>

      {isLoading ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-slate-400 mb-6">
            Add some transactions and set up your budget to get personalized AI recommendations.
          </p>
          <Button variant="primary" onClick={handleRefresh}>
            Generate Recommendations
          </Button>
        </div>
      ) : (
        <RecommendationsList recommendations={recommendations} />
      )}
    </div>
  );
}