'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useTransactions } from '@/hooks/useTransactions';
import type { Transaction, TransactionCategory, TransactionType } from '@/types';

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

const categoryOptions = [
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
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const { createTransaction, updateTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || '',
    category: transaction?.category || 'other',
    type: transaction?.type || 'expense',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        amount: parseFloat(formData.amount),
        category: formData.category as TransactionCategory,
        type: formData.type as TransactionType,
        description: formData.description,
        date: formData.date,
      };

      if (transaction) {
        await updateTransaction(transaction._id, data);
      } else {
        await createTransaction(data);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          type="number"
          label="Amount"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <Select
          label="Type"
          options={typeOptions}
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
        />
      </div>

      <Select
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        required
      />

      <Input
        type="text"
        label="Description"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />

      <Input
        type="date"
        label="Date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      <div className="flex items-center space-x-4">
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}