'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Category, Budget, ApiResponse } from '@/types';

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  defaultBudgetId?: string;
}

export function TransactionForm({ onSuccess, onCancel, defaultBudgetId }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [formData, setFormData] = useState({
    budgetId: defaultBudgetId || '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (formData.type) {
      fetchCategories(formData.type);
    }
  }, [formData.type]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets', { credentials: 'include' });
      const data: ApiResponse<Budget[]> = await response.json();
      if (data.success && data.data) {
        setBudgets(data.data);
        if (!formData.budgetId && data.data.length > 0) {
          setFormData((prev) => ({ ...prev, budgetId: data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    }
  };

  const fetchCategories = async (type: 'income' | 'expense') => {
    try {
      const response = await fetch(`/api/categories?type=${type}`, { credentials: 'include' });
      const data: ApiResponse<Category[]> = await response.json();
      if (data.success && data.data) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const category = categories.find((c) => c._id === formData.categoryId);
      if (!category) {
        throw new Error('Please select a category');
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          budgetId: formData.budgetId,
          type: formData.type,
          amount: Number(formData.amount),
          categoryId: formData.categoryId,
          categoryName: category.name,
          description: formData.description,
          date: formData.date,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        setFormData({
          budgetId: defaultBudgetId || budgets[0]?._id || '',
          type: 'expense',
          amount: '',
          categoryId: categories[0]?._id || '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        setError(data.error || 'Failed to create transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
        <Select
          value={formData.budgetId}
          onChange={(e) => setFormData({ ...formData, budgetId: e.target.value })}
          required
        >
          {budgets.map((budget) => (
            <option key={budget._id} value={budget._id}>
              {budget.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <Select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <Select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          required
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={loading} className="flex-1">
          Add Transaction
        </Button>
      </div>
    </form>
  );
}