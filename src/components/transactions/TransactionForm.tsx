'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/utils/api-client';
import type { Transaction, Budget, Category } from '@/types';

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    budgetId: transaction?.budgetId || '',
    categoryId: transaction?.categoryId || '',
    amount: transaction?.amount || 0,
    type: transaction?.type || 'expense',
    description: transaction?.description || '',
    date: transaction?.date
      ? new Date(transaction.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await apiClient.get('/api/budgets', {
        params: { active: true },
      });
      if (response.data.success) {
        setBudgets(response.data.data);
      }
    } catch (error) {
      showToast('Failed to load budgets', 'error');
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (transaction) {
        await apiClient.put(`/api/transactions/${transaction._id}`, payload);
        showToast('Transaction updated successfully', 'success');
      } else {
        await apiClient.post('/api/transactions', payload);
        showToast('Transaction created successfully', 'success');
      }

      onSuccess();
    } catch (error: any) {
      showToast(
        error.response?.data?.error || 'Failed to save transaction',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type
        </label>
        <Select
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
          }
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget
        </label>
        <Select
          value={formData.budgetId}
          onChange={(e) =>
            setFormData({ ...formData, budgetId: e.target.value })
          }
          required
        >
          <option value="">Select budget</option>
          {budgets.map((budget) => (
            <option key={budget._id} value={budget._id}>
              {budget.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <Select
          value={formData.categoryId}
          onChange={(e) =>
            setFormData({ ...formData, categoryId: e.target.value })
          }
          required
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: Number(e.target.value) })
          }
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="e.g., Grocery shopping"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isLoading}
        >
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}