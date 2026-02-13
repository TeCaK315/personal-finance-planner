'use client';

import { useState } from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import type { RecommendationType } from '@/types';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'budget_optimization', label: 'Budget Optimization' },
  { value: 'debt_management', label: 'Debt Management' },
];

export function RecommendationsList() {
  const { recommendations, loading, error } = useRecommendations();
  const [filterType, setFilterType] = useState<RecommendationType | ''>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error}
      </div>
    );
  }

  const filteredRecommendations = filterType
    ? recommendations.filter(r => r.type === filterType)
    : recommendations;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <Select
          label="Filter by Type"
          options={typeOptions}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as RecommendationType | '')}
        />
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No recommendations found. Generate your first recommendations!
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation._id} recommendation={recommendation} />
          ))}
        </div>
      )}
    </div>
  );
}