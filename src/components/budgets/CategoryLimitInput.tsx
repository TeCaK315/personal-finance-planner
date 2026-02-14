'use client';

import React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import type { Category } from '@/types';

interface CategoryLimitInputProps {
  categories: Category[];
  selectedCategoryId: string;
  limit: number;
  onChange: (categoryId: string, limit: number) => void;
  usedCategoryIds?: string[];
}

export function CategoryLimitInput({
  categories,
  selectedCategoryId,
  limit,
  onChange,
  usedCategoryIds = [],
}: CategoryLimitInputProps) {
  const availableCategories = categories.filter(
    (cat) => cat._id === selectedCategoryId || !usedCategoryIds.includes(cat._id)
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Category
        </label>
        <Select
          value={selectedCategoryId}
          onChange={(e) => onChange(e.target.value, limit)}
          required
        >
          <option value="">Select category</option>
          {availableCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Limit
        </label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={limit}
          onChange={(e) => onChange(selectedCategoryId, Number(e.target.value))}
          placeholder="0.00"
          required
        />
      </div>
    </div>
  );
}