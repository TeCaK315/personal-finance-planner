'use client';

import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, X, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AIRecommendation } from '@/types';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onDismiss: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onDismiss,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50';
      case 'low':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`border-2 ${getPriorityColor(recommendation.priority)}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm">
              {getPriorityIcon(recommendation.priority)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-800">
                  {recommendation.title}
                </h3>
                <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                  {getTypeLabel(recommendation.type)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(recommendation.generatedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(recommendation._id)}
            className="p-1 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <p className="text-gray-700 mb-4">{recommendation.description}</p>

        {recommendation.potentialSavings && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-lg mb-4">
            <p className="text-sm font-semibold text-green-800">
              💰 Potential Savings: ${recommendation.potentialSavings.toFixed(2)}
            </p>
          </div>
        )}

        {recommendation.actionItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Action Items:
            </p>
            <ul className="space-y-2">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};