'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Category, ApiResponse } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryAllocation {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
}

export function CreateBudgetModal({ isOpen, onClose, onSuccess }: CreateBudgetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    startDate: '',
    endDate: '',
  });
  const [allocations, setAllocations] = useState<CategoryAllocation[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=expense', {
        credentials: 'include',
      });
      const data: ApiResponse<Category[]> = await response.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const addAllocation = () => {
    if (categories.length > 0) {
      setAllocations([
        ...allocations,
        {
          categoryId: categories[0]._id,
          categoryName: categories[0].name,
          allocatedAmount: 0,
        },
      ]);
    }
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: keyof CategoryAllocation, value: any) => {
    const updated = [...allocations];
    if (field === 'categoryId') {
      const category = categories.find((c) => c._id === value);
      if (category) {
        updated[index].categoryId = value;
        updated[index].categoryName = category.name;
      }
    } else {
      updated[index][field] = value;
    }
    setAllocations(updated);
  };

  const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.allocatedAmount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const totalAmount = Number(formData.totalAmount);

    if (totalAllocated > totalAmount) {
      setError('Total allocated amount exceeds budget total');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          totalAmount,
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate,
          categories: allocations.map((a) => ({
            categoryId: a.categoryId,
            categoryName: a.categoryName,
            allocatedAmount: Number(a.allocatedAmount),
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({
          name: '',
          totalAmount: '',
          period: 'monthly',
          startDate: '',
          endDate: '',
        });
        setAllocations([]);
      } else {
        setError(data.error || 'Failed to create budget');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Budget">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Monthly Budget"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="5000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <Select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Category Allocations
            </label>
            <Button type="button" variant="outline" size="sm" onClick={addAllocation}>
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {allocations.map((allocation, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Select
                  value={allocation.categoryId}
                  onChange={(e) => updateAllocation(index, 'categoryId', e.target.value)}
                  className="flex-1"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  value={allocation.allocatedAmount}
                  onChange={(e) => updateAllocation(index, 'allocatedAmount', Number(e.target.value))}
                  placeholder="Amount"
                  className="w-32"
                />
                <button
                  type="button"
                  onClick={() => removeAllocation(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {allocations.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Total Allocated:</span>
                <span className="font-medium text-gray-900">${totalAllocated.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-700">Remaining:</span>
                <span className="font-medium text-gray-900">
                  ${(Number(formData.totalAmount) - totalAllocated).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading} className="flex-1">
            Create Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
}