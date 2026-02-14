'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoryLimitInput } from '@/components/budgets/CategoryLimitInput';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/utils/api-client';
import { Plus, X } from 'lucide-react';
import type { Budget, Category } from '@/types';

interface BudgetFormProps {
  budget?: Budget;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CategoryLimitForm {
  categoryId: string;
  limit: number;
}

export function BudgetForm({ budget, onSuccess, onCancel }: BudgetFormProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    totalAmount: budget?.totalAmount || 0,
    startDate: budget?.startDate
      ? new Date(budget.startDate).toISOString().split('T')[0]
      : '',
    endDate: budget?.endDate
      ? new Date(budget.endDate).toISOString().split('T')[0]
      : '',
  });
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimitForm[]>(
    budget?.categoryLimits.map((cl) => ({
      categoryId: cl.categoryId,
      limit: cl.limit,
    })) || []
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      showToast('Failed to load categories', 'error');
    }
  };

  const handleAddCategoryLimit = () => {
    const availableCategories = categories.filter(
      (cat) => !categoryLimits.some((cl) => cl.categoryId === cat._id)
    );
    if (availableCategories.length > 0) {
      setCategoryLimits([
        ...categoryLimits,
        { categoryId: availableCategories[0]._id, limit: 0 },
      ]);
    }
  };

  const handleRemoveCategoryLimit = (index: number) => {
    setCategoryLimits(categoryLimits.filter((_, i) => i !== index));
  };

  const handleCategoryLimitChange = (
    index: number,
    categoryId: string,
    limit: number
  ) => {
    const updated = [...categoryLimits];
    updated[index] = { categoryId, limit };
    setCategoryLimits(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        totalAmount: Number(formData.totalAmount),
        categoryLimits: categoryLimits.map((cl) => ({
          categoryId: cl.categoryId,
          limit: Number(cl.limit),
        })),
      };

      if (budget) {
        await apiClient.put(`/api/budgets/${budget._id}`, payload);
        showToast('Budget updated successfully', 'success');
      } else {
        await apiClient.post('/api/budgets', payload);
        showToast('Budget created successfully', 'success');
      }

      onSuccess();
    } catch (error: any) {
      showToast(
        error.response?.data?.error || 'Failed to save budget',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Name
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Monthly Budget"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Amount
        </label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={formData.totalAmount}
          onChange={(e) =>
            setFormData({ ...formData, totalAmount: Number(e.target.value) })
          }
          placeholder="0.00"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Category Limits
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddCategoryLimit}
            disabled={categoryLimits.length >= categories.length}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
        </div>
        <div className="space-y-3">
          {categoryLimits.map((cl, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <CategoryLimitInput
                  categories={categories}
                  selectedCategoryId={cl.categoryId}
                  limit={cl.limit}
                  onChange={(categoryId, limit) =>
                    handleCategoryLimitChange(index, categoryId, limit)
                  }
                  usedCategoryIds={categoryLimits
                    .filter((_, i) => i !== index)
                    .map((c) => c.categoryId)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCategoryLimit(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {categoryLimits.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No category limits set. Click "Add Category" to add one.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isLoading}
        >
          {budget ? 'Update Budget' : 'Create Budget'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}