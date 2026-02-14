'use client';

import React, { useState } from 'react';
import { AIRecommendation } from '@/types';
import { RecommendationCard } from './RecommendationCard';
import { Select } from '@/components/ui/Select';

interface RecommendationsListProps {
  recommendations: AIRecommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(recommendations.map((r) => r.category)));

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || rec.category === categoryFilter;
    return matchesPriority && matchesCategory;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No recommendations available</p>
        <p className="text-sm text-gray-500 mt-1">
          Generate recommendations to get personalized financial insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </Select>

        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      {sortedRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No recommendations match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation._id} recommendation={recommendation} />
          ))}
        </div>
      )}
    </div>
  );
}