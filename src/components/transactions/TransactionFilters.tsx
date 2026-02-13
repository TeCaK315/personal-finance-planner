'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { TransactionFilters } from '@/types';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'housing', label: 'Housing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'salary', label: 'Salary' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4">Filters</h3>
      <div className="grid md:grid-cols-4 gap-4">
        <Input
          type="date"
          label="Start Date"
          value={filters.startDate || ''}
          onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
        />

        <Input
          type="date"
          label="End Date"
          value={filters.endDate || ''}
          onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
        />

        <Select
          label="Category"
          options={categoryOptions}
          value={filters.category || ''}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as any })}
        />

        <Select
          label="Type"
          options={typeOptions}
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as any })}
        />
      </div>
    </div>
  );
}