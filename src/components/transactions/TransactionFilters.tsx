'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TransactionFilters as Filters } from '@/types';
import { X } from 'lucide-react';

interface TransactionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories?: Array<{ _id: string; name: string }>;
}

export function TransactionFilters({ filters, onFiltersChange, categories = [] }: TransactionFiltersProps) {
  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.type || filters.categoryId || filters.startDate || filters.endDate || filters.search;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <Input
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Search transactions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <Select
            value={filters.type || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                type: e.target.value ? (e.target.value as 'income' | 'expense') : undefined,
              })
            }
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <Select
            value={filters.categoryId || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, categoryId: e.target.value || undefined })
            }
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <Input
            type="date"
            value={filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                startDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <Input
            type="date"
            value={filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
          <Input
            type="number"
            step="0.01"
            value={filters.minAmount || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                minAmount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
          <Input
            type="number"
            step="0.01"
            value={filters.maxAmount || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                maxAmount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="0.00"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}