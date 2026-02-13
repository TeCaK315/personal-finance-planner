'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatters';
import { DATE_RANGES } from '@/utils/constants';

export function BudgetCalculator() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRange, setSelectedRange] = useState('month');
  const { calculateBudget, loading } = useBudget();
  const [calculatedBudget, setCalculatedBudget] = useState<any>(null);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    const now = new Date();
    let start = new Date();

    switch (range) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  const handleCalculate = async () => {
    if (!startDate || !endDate) return;

    const result = await calculateBudget({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (result) {
      setCalculatedBudget(result);
    }
  };

  const balanceColor = useMemo(() => {
    if (!calculatedBudget) return 'text-text';
    return calculatedBudget.balance >= 0 ? 'text-green-400' : 'text-red-400';
  }, [calculatedBudget]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text">Budget Calculator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">
              Quick Range
            </label>
            <Select
              value={selectedRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              options={DATE_RANGES.map((range) => ({
                value: range.value,
                label: range.label,
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!startDate || !endDate || loading}
          loading={loading}
          className="w-full"
        >
          Calculate Budget
        </Button>
      </Card>

      {calculatedBudget && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-text/60">Total Income</p>
                <p className="text-2xl font-bold text-text">
                  {formatCurrency(calculatedBudget.totalIncome)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-text/60">Total Expenses</p>
                <p className="text-2xl font-bold text-text">
                  {formatCurrency(calculatedBudget.totalExpenses)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-text/60">Balance</p>
                <p className={`text-2xl font-bold ${balanceColor}`}>
                  {formatCurrency(calculatedBudget.balance)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}