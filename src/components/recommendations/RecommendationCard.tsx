'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lightbulb, TrendingUp, AlertTriangle, DollarSign, Check, X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { AIRecommendation } from '@/types';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const typeIcons = {
  savings: DollarSign,
  budget_optimization: TrendingUp,
  spending_alert: AlertTriangle,
  investment: Lightbulb,
};

const priorityColors = {
  high: 'border-red-500 bg-red-50',
  medium: 'border-yellow-500 bg-yellow-50',
  low: 'border-blue-500 bg-blue-50',
};

const priorityTextColors = {
  high: 'text-red-700',
  medium: 'text-yellow-700',
  low: 'text-blue-700',
};

export function RecommendationCard({
  recommendation,
  onDismiss,
  onMarkRead,
}: RecommendationCardProps) {
  const Icon = typeIcons[recommendation.type];

  return (
    <Card
      className={`border-l-4 ${priorityColors[recommendation.priority]} ${
        !recommendation.isRead ? 'shadow-md' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${priorityTextColors[recommendation.priority]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {recommendation.title}
                  </h3>
                  {!recommendation.isRead && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {recommendation.priority} Priority • {recommendation.type.replace('_', ' ')}
                </p>
              </div>
              <div className="flex gap-2">
                {!recommendation.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(recommendation._id)}
                    className="text-green-600 hover:text-green-700"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(recommendation._id)}
                  className="text-gray-600 hover:text-red-600"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              {recommendation.description}
            </p>

            {recommendation.potentialSavings && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Potential Savings: {formatCurrency(recommendation.potentialSavings)}
                </p>
              </div>
            )}

            {recommendation.actionItems.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Action Items:
                </p>
                <ul className="space-y-2">
                  {recommendation.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}