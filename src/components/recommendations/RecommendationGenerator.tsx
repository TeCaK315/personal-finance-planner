'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useRecommendations } from '@/hooks/useRecommendations';

interface RecommendationGeneratorProps {
  onGenerated?: () => void;
}

export function RecommendationGenerator({ onGenerated }: RecommendationGeneratorProps) {
  const { generateRecommendations, loading } = useRecommendations();
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const handleGenerate = async () => {
    const success = await generateRecommendations({
      includeTransactions,
      includeGoals,
      timeframe,
    });

    if (success) {
      onGenerated?.();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">AI Recommendations</h2>
          <p className="text-sm text-text/60">Get personalized financial insights</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text/80 mb-2">
            Analysis Timeframe
          </label>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
            options={[
              { value: 'week', label: 'Last Week' },
              { value: 'month', label: 'Last Month' },
              { value: 'quarter', label: 'Last Quarter' },
              { value: 'year', label: 'Last Year' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeTransactions}
              onChange={(e) => setIncludeTransactions(e.target.checked)}
              className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary/50"
            />
            <div>
              <p className="text-sm font-medium text-text">Include Transaction Analysis</p>
              <p className="text-xs text-text/60">Analyze spending patterns and income trends</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeGoals}
              onChange={(e) => setIncludeGoals(e.target.checked)}
              className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary/50"
            />
            <div>
              <p className="text-sm font-medium text-text">Include Goal Progress</p>
              <p className="text-xs text-text/60">Get insights on your financial goals</p>
            </div>
          </label>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={!includeTransactions && !includeGoals}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating Insights...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Recommendations
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-text/60">
          💡 AI will analyze your financial data and provide personalized recommendations to help you achieve your goals.
        </p>
      </div>
    </Card>
  );
}