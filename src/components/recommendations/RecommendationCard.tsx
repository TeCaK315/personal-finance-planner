'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Lightbulb, TrendingUp, PiggyBank, CreditCard } from 'lucide-react';
import type { Recommendation, RecommendationType } from '@/types';

const recommendationIcons: Record<RecommendationType, any> = {
  savings: PiggyBank,
  investment: TrendingUp,
  budget_optimization: Lightbulb,
  debt_management: CreditCard,
};

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const Icon = recommendationIcons[recommendation.type];

  return (
    <Card className="hover:scale-105 transition-transform duration-300">
      <CardContent>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">{recommendation.title}</h3>
              {recommendation.priority <= 3 && (
                <span className="px-3 py-1 bg-red-500 bg-opacity-20 text-red-500 rounded-full text-sm font-semibold">
                  High Priority
                </span>
              )}
            </div>
            <p className="text-gray-300 mb-4">{recommendation.description}</p>
            {recommendation.estimatedImpact && (
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Estimated Impact</p>
                <p className="font-semibold text-accent">{recommendation.estimatedImpact}</p>
              </div>
            )}
            {recommendation.actionable && (
              <div className="mt-4 flex items-center space-x-2 text-sm text-primary">
                <Lightbulb className="w-4 h-4" />
                <span>Actionable recommendation</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}