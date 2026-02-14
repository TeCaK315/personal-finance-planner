'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import type { TransactionFilters as Filters, Category } from '@/types';

interface TransactionFiltersProps {
  filters: Filters;
  categories: Category[];
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export function TransactionFilters({
  filters,
  categories,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.categoryId ||
    filters.type ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.search;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search description..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type
          </label>
          <Select
            value={filters.type || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                type: e.target.value as 'income' | 'expense' | undefined,
              })
            }
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            value={filters.categoryId || ''}
            onChange={(e) =>
              onChange({ ...filters, categoryId: e.target.value })
            }
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={
              filters.startDate
                ? new Date(filters.startDate).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) =>
              onChange({
                ...filters,
                startDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={
              filters.endDate
                ? new Date(filters.endDate).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) =>
              onChange({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Min Amount
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={filters.minAmount || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minAmount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Amount
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={filters.maxAmount || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxAmount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-600"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}