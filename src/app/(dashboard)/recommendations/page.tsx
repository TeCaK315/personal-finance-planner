'use client';

import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { GenerateButton } from '@/components/recommendations/GenerateButton';

export default function RecommendationsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">AI Recommendations</span>
          </h1>
          <p className="text-gray-400">Personalized financial advice powered by AI</p>
        </div>
        <GenerateButton />
      </div>

      <RecommendationsList />
    </div>
  );
}