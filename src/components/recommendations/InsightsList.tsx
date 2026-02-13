'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { RecommendationCard } from './RecommendationCard';
import { useRecommendations } from '@/hooks/useRecommendations';

export function InsightsList() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const { recommendations, loading } = useRecommendations();

  const filteredRecommendations = categoryFilter
    ? recommendations.filter((rec) => rec.category === categoryFilter)
    : recommendations;

  const categories = Array.from(new Set(recommendations.map((rec) => rec.category)));

  if (loading && recommendations.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-32 bg-primary/10 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-text/60 mb-2">No recommendations yet</p>
        <p className="text-sm text-text/40">
          Generate AI recommendations to get personalized financial insights
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">Your Insights</h2>
        {categories.length > 0 && (
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-text/60" />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((cat) => ({
                  value: cat,
                  label: cat.charAt(0).toUpperCase() + cat.slice(1),
                })),
              ]}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation._id}
            recommendation={recommendation}
          />
        ))}
      </div>

      {filteredRecommendations.length === 0 && categoryFilter && (
        <Card className="p-8 text-center">
          <p className="text-text/60">
            No recommendations found for this category
          </p>
        </Card>
      )}
    </div>
  );
}