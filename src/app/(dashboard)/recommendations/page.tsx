'use client';

import React from 'react';
import { useRecommendations, useGenerateRecommendations } from '@/hooks/useRecommendations';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent } from '@/components/ui/Card';
import { Brain, RefreshCw, Sparkles } from 'lucide-react';

export default function RecommendationsPage() {
  const { recommendations, isLoading, refetch } = useRecommendations();
  const { generate, isGenerating } = useGenerateRecommendations();

  const handleGenerate = async () => {
    await generate({ forceRegenerate: true });
    refetch();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">AI Recommendations</h1>
          <p className="text-slate-400">Personalized financial advice powered by AI</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New
            </>
          )}
        </Button>
      </div>

      <Card className="gradient-primary p-[1px]">
        <CardContent className="bg-slate-900 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">AI-Powered Insights</h2>
              <p className="text-slate-300">
                Our AI analyzes your spending patterns, budget usage, and financial goals to provide 
                personalized recommendations that help you save money and optimize your budget.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-4">No recommendations yet</p>
            <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RecommendationsList recommendations={recommendations} />
      )}
    </div>
  );
}