'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionType, TransactionCategory } from '@/types';

const incomeCategories: TransactionCategory[] = [
  'salary',
  'freelance',
  'investment',
  'other_income',
];

const expenseCategories: TransactionCategory[] = [
  'housing',
  'transportation',
  'food',
  'utilities',
  'healthcare',
  'entertainment',
  'shopping',
  'education',
  'other_expense',
];

export const TransactionForm: React.FC = () => {
  const { createTransaction, loading } = useTransactions();
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createTransaction({
      type,
      category,
      amount: parseFloat(amount),
      description,
      date: new Date(date),
    });

    if (success) {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory(type === 'income' ? 'salary' : 'food');
    }
  };

  const getCategoryLabel = (cat: string) => {
    return cat
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold text-gray-800">Add Transaction</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'income' ? 'primary' : 'outline'}
                onClick={() => {
                  setType('income');
                  setCategory('salary');
                }}
                className="flex-1"
              >
                Income
              </Button>
              <Button
                type="button"
                variant={type === 'expense' ? 'primary' : 'outline'}
                onClick={() => {
                  setType('expense');
                  setCategory('food');
                }}
                className="flex-1"
              >
                Expense
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
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
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};