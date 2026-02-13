'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useTransactions } from '@/hooks/useTransactions';
import { TRANSACTION_CATEGORIES } from '@/utils/constants';
import { validateAmount, validateDate } from '@/utils/validators';
import type { Transaction } from '@/types';

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransactionForm({ transaction, onClose, onSuccess }: TransactionFormProps) {
  const { createTransaction, updateTransaction, loading } = useTransactions();
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    amount: transaction?.amount.toString() || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const amountValidation = validateAmount(parseFloat(formData.amount));
    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const dateValidation = validateDate(formData.date);
    if (!dateValidation.valid) {
      newErrors.date = dateValidation.error || 'Invalid date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    };

    let success = false;
    if (transaction) {
      success = await updateTransaction(transaction._id, data);
    } else {
      success = await createTransaction(data);
    }

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const categoryOptions = TRANSACTION_CATEGORIES[formData.type].map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <Modal isOpen={true} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text/80 mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.type === 'income'
                  ? 'border-green-400 bg-green-400/10 text-green-400'
                  : 'border-primary/20 bg-background/50 text-text/60 hover:border-primary/40'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.type === 'expense'
                  ? 'border-red-400 bg-red-400/10 text-red-400'
                  : 'border-primary/20 bg-background/50 text-text/60 hover:border-primary/40'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          error={errors.amount}
          placeholder="0.00"
        />

        <div>
          <label className="block text-sm font-medium text-text/80 mb-2">
            Category
          </label>
          <Select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categoryOptions}
            placeholder="Select category"
          />
          {errors.category && (
            <p className="text-red-400 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        <Input
          label="Description"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
          placeholder="Enter description"
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={loading} className="flex-1">
            {transaction ? 'Update' : 'Add'} Transaction
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}