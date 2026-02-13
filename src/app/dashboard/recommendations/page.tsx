'use client';

import { useEffect, useState } from 'react';
import { AIRecommendation } from '@/types';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { RecommendationGenerator } from '@/components/recommendations/RecommendationGenerator';
import { Card } from '@/components/ui/Card';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      } else {
        setError(data.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRecommendationsGenerated = () => {
    fetchRecommendations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow text-primary text-xl">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Recommendations</h1>
        <p className="text-text/70">Personalized financial insights powered by AI</p>
      </div>

      <RecommendationGenerator onGenerated={handleRecommendationsGenerated} />

      {error && (
        <Card>
          <div className="p-6 text-center text-red-400">{error}</div>
        </Card>
      )}

      {recommendations.length === 0 && !error ? (
        <Card>
          <div className="p-12 text-center">
            <p className="text-text/70 mb-4">No recommendations yet. Generate your first AI-powered insights!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation._id} recommendation={recommendation} />
          ))}
        </div>
      )}
    </div>
  );
}