'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useGoals } from '@/hooks/useGoals';
import { GOAL_TYPES } from '@/utils/constants';
import { validateAmount, validateDate } from '@/utils/validators';
import type { FinancialGoal } from '@/types';

interface GoalFormProps {
  goal?: FinancialGoal;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GoalForm({ goal, onClose, onSuccess }: GoalFormProps) {
  const { createGoal, updateGoal, loading } = useGoals();
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    type: goal?.type || 'short-term' as 'short-term' | 'long-term',
    targetAmount: goal?.targetAmount.toString() || '',
    currentAmount: goal?.currentAmount.toString() || '0',
    deadline: goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    description: goal?.description || '',
    status: goal?.status || 'active' as 'active' | 'completed' | 'cancelled',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    const targetValidation = validateAmount(parseFloat(formData.targetAmount));
    if (!targetValidation.valid) {
      newErrors.targetAmount = targetValidation.error || 'Invalid target amount';
    }

    const currentValidation = validateAmount(parseFloat(formData.currentAmount));
    if (!currentValidation.valid) {
      newErrors.currentAmount = currentValidation.error || 'Invalid current amount';
    }

    if (parseFloat(formData.currentAmount) > parseFloat(formData.targetAmount)) {
      newErrors.currentAmount = 'Current amount cannot exceed target amount';
    }

    const dateValidation = validateDate(formData.deadline);
    if (!dateValidation.valid) {
      newErrors.deadline = dateValidation.error || 'Invalid deadline';
    }

    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate < new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data = {
      name: formData.name,
      type: formData.type,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      deadline: formData.deadline,
      description: formData.description || undefined,
      status: formData.status,
    };

    let success = false;
    if (goal) {
      success = await updateGoal(goal._id, data);
    } else {
      success = await createGoal(data);
    }

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={goal ? 'Edit Goal' : 'Create Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g., Emergency Fund"
        />

        <div>
          <label className="block text-sm font-medium text-text/80 mb-2">
            Goal Type
          </label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'short-term' | 'long-term' })}
            options={GOAL_TYPES.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
          />
        </div>

        <Input
          label="Target Amount"
          type="number"
          step="0.01"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          error={errors.targetAmount}
          placeholder="0.00"
        />

        <Input
          label="Current Amount"
          type="number"
          step="0.01"
          value={formData.currentAmount}
          onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
          error={errors.currentAmount}
          placeholder="0.00"
        />

        <Input
          label="Deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          error={errors.deadline}
        />

        <div>
          <label className="block text-sm font-medium text-text/80 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
            placeholder="Add details about your goal..."
          />
        </div>

        {goal && (
          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">
              Status
            </label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'cancelled' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={loading} className="flex-1">
            {goal ? 'Update' : 'Create'} Goal
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}