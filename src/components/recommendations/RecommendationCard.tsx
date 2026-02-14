'use client';

import React from 'react';
import { AIRecommendation } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getPriorityIcon = () => {
    switch (recommendation.priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
    }
  };

  return (
    <Card className={`border-l-4 ${getPriorityColor()}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getPriorityIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={recommendation.priority === 'high' ? 'error' : 'default'}>
                  {recommendation.priority} priority
                </Badge>
                <span className="text-sm text-gray-600">{recommendation.category}</span>
              </div>
            </div>
          </div>

          {recommendation.potentialSavings && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Potential Savings</span>
              </div>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(recommendation.potentialSavings)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 mb-4">{recommendation.description}</p>

        {recommendation.actionItems.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Action Items:</h4>
            <ul className="space-y-2">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Generated on {format(new Date(recommendation.generatedAt), 'MMM dd, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}