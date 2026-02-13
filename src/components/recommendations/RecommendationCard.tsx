'use client';

import { AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/formatters';
import type { AIRecommendation } from '@/types';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getPriorityIcon = () => {
    switch (recommendation.priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <Info className="w-5 h-5 text-accent" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'from-red-400 to-red-600';
      case 'medium':
        return 'from-accent to-primary';
      case 'low':
        return 'from-green-400 to-green-600';
    }
  };

  const getCategoryIcon = () => {
    return <TrendingUp className="w-5 h-5 text-white" />;
  };

  return (
    <Card className="p-6 hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getPriorityColor()} flex items-center justify-center flex-shrink-0`}>
          {getCategoryIcon()}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-text mb-1">
                {recommendation.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {recommendation.category}
                </span>
                <div className="flex items-center gap-1">
                  {getPriorityIcon()}
                  <span className="text-xs text-text/60">
                    {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-text/80 mb-4 leading-relaxed">
            {recommendation.description}
          </p>

          {recommendation.impact && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm font-medium text-primary mb-1">Expected Impact</p>
              <p className="text-sm text-text/80">{recommendation.impact}</p>
            </div>
          )}

          {recommendation.actionItems.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-text/80">Action Items:</p>
              <ul className="space-y-2">
                {recommendation.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-primary/10">
            <span className="text-xs text-text/40">
              Generated {formatDate(recommendation.generatedAt)}
            </span>
            {!recommendation.isRead && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                New
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}