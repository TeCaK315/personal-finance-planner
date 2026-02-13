'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TRANSACTION_CATEGORIES } from '@/utils/constants';
import type { TransactionFilters as Filters } from '@/types';

interface TransactionFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: undefined,
    category: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
  });

  const allCategories = [
    ...TRANSACTION_CATEGORIES.income,
    ...TRANSACTION_CATEGORIES.expense,
  ];

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const emptyFilters: Filters = {
      type: undefined,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-text hover:text-primary transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 rounded-full text-xs bg-primary text-white">
              Active
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-text/60 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Type
              </label>
              <Select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value as 'income' | 'expense')}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Category
              </label>
              <Select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...allCategories.map((cat) => ({ value: cat, label: cat })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Min Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-2">
                Max Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="secondary" onClick={() => setIsExpanded(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}