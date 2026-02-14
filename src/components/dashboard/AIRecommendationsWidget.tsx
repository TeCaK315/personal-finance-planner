'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Lightbulb, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import type { AIRecommendation } from '@/types';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-blue-500',
};

const typeIcons = {
  savings: DollarSign,
  budget_optimization: TrendingUp,
  spending_alert: AlertTriangle,
  investment: Lightbulb,
};

export function AIRecommendationsWidget() {
  const { recommendations, isLoading, error } = useRecommendations();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const topRecommendations = recommendations.slice(0, 3);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
          </div>
          {recommendations.length > 3 && (
            <span className="text-xs text-gray-500">
              +{recommendations.length - 3} more
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {topRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No recommendations yet. Add transactions to get personalized advice.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topRecommendations.map((rec: AIRecommendation) => {
              const Icon = typeIcons[rec.type];
              return (
                <div
                  key={rec._id}
                  className="p-3 rounded-lg bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm border border-white/20 hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${priorityColors[rec.priority]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {rec.description}
                      </p>
                      {rec.potentialSavings && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Potential savings: ${rec.potentialSavings.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}