'use client';

import React from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { GenerateButton } from '@/components/recommendations/GenerateButton';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Sparkles } from 'lucide-react';

export default function RecommendationsPage() {
  const { recommendations, loading, refetch } = useRecommendations();

  const handleGenerate = async () => {
    await refetch();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Recommendations</h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Personalized financial insights powered by AI
          </p>
        </div>
        <GenerateButton onGenerate={handleGenerate} />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <RecommendationsList 
          recommendations={recommendations}
        />
      ) : (
        <Card className="glass-strong border-white/10">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Recommendations Yet</h2>
            <p className="text-[hsl(var(--text-secondary))] mb-6 max-w-md mx-auto">
              Generate AI-powered recommendations based on your spending patterns and financial goals.
            </p>
            <GenerateButton onGenerate={handleGenerate} size="lg" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}