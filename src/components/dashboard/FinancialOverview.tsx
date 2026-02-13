'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/ui/Chart';
import { StatsCard } from './StatsCard';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatters';

export function FinancialOverview() {
  const { budget, loading } = useBudget();

  const savingsRate = useMemo(() => {
    if (!budget || budget.totalIncome === 0) return 0;
    return ((budget.balance / budget.totalIncome) * 100);
  }, [budget]);

  const chartData = useMemo(() => {
    if (!budget?.monthlyTrend) return [];
    return budget.monthlyTrend.map((item) => ({
      name: item.month,
      income: item.income,
      expenses: item.expenses,
      balance: item.balance,
    }));
  }, [budget]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-primary/10 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <Card className="p-8 text-center">
        <p className="text-text/60">No financial data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Current Balance"
          value={budget.balance}
          icon={DollarSign}
          format="currency"
          iconColor="from-accent to-primary"
        />
        <StatsCard
          title="Total Income"
          value={budget.totalIncome}
          icon={TrendingUp}
          format="currency"
          iconColor="from-green-400 to-green-600"
        />
        <StatsCard
          title="Total Expenses"
          value={budget.totalExpenses}
          icon={TrendingDown}
          format="currency"
          iconColor="from-red-400 to-red-600"
        />
        <StatsCard
          title="Savings Rate"
          value={savingsRate}
          icon={PiggyBank}
          format="percentage"
          iconColor="from-secondary to-primary"
        />
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-text mb-6">Monthly Trend</h3>
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            lines={[
              { dataKey: 'income', stroke: '#22d3ee', name: 'Income' },
              { dataKey: 'expenses', stroke: '#ef4444', name: 'Expenses' },
              { dataKey: 'balance', stroke: '#6366f1', name: 'Balance' },
            ]}
            height={300}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-text/60">
            <p>No trend data available</p>
          </div>
        )}
      </Card>

      {budget.categoryBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-text mb-6">Top Spending Categories</h3>
          <div className="space-y-4">
            {budget.categoryBreakdown.slice(0, 5).map((category) => (
              <div key={category.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text">{category.category}</span>
                  <span className="text-sm text-text/60">
                    {formatCurrency(category.total)} ({category.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}