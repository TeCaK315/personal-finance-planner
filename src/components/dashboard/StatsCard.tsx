'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  format?: 'currency' | 'number' | 'percentage';
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  format = 'currency',
  iconColor = 'from-primary to-secondary',
}: StatsCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    return trend > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getTrendText = () => {
    if (!trend) return null;
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <Card className="p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-text/60 mb-2">{title}</p>
          <p className="text-3xl font-bold text-text mb-2">{formatValue()}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {getTrendText()}
              </span>
              <span className="text-xs text-text/40">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}