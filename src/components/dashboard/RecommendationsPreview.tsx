'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowRight, Lightbulb, TrendingUp, PiggyBank, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { RecommendationType } from '@/types';

const recommendationIcons: Record<RecommendationType, any> = {
  [RecommendationType.SAVINGS]: PiggyBank,
  [RecommendationType.INVESTMENT]: TrendingUp,
  [RecommendationType.BUDGET_OPTIMIZATION]: Lightbulb,
  [RecommendationType.DEBT_MANAGEMENT]: CreditCard,
};

export function RecommendationsPreview() {
  const { recommendations, loading, error } = useRecommendations();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topRecommendations = recommendations.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
          <Link href="/recommendations" className="text-primary hover:text-secondary transition-colors flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {topRecommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No recommendations yet. Generate your first recommendations!
          </div>
        ) : (
          <div className="space-y-4">
            {topRecommendations.map((recommendation) => {
              const Icon = recommendationIcons[recommendation.type];
              return (
                <div key={recommendation._id} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{recommendation.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {recommendation.description}
                      </p>
                      {recommendation.estimatedImpact && (
                        <p className="text-sm text-accent mt-2">
                          {recommendation.estimatedImpact}
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