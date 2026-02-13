'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Edit2, Trash2, ShoppingBag, Home, Car, Utensils, Heart, GraduationCap, Tv, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction, TransactionFilters, TransactionCategory } from '@/types';

const categoryIcons: Record<TransactionCategory, any> = {
  food: Utensils,
  transport: Car,
  housing: Home,
  utilities: DollarSign,
  entertainment: Tv,
  healthcare: Heart,
  education: GraduationCap,
  shopping: ShoppingBag,
  salary: TrendingUp,
  investment: TrendingUp,
  other: DollarSign,
};

interface TransactionListProps {
  filters: TransactionFilters;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({ filters, onEdit }: TransactionListProps) {
  const { transactions, loading, error, deleteTransaction } = useTransactions(filters);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    setDeletingId(id);
    await deleteTransaction(id);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            No transactions found. Add your first transaction!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">All Transactions</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const Icon = categoryIcons[transaction.category];
            const isIncome = transaction.type === 'income';
            return (
              <div key={transaction._id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-full ${isIncome ? 'gradient-primary' : 'bg-slate-700'} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{transaction.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="capitalize">{transaction.category}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(transaction)}
                    className="p-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(transaction._id)}
                    disabled={deletingId === transaction._id}
                    className="p-2"
                  >
                    {deletingId === transaction._id ? (
                      <Spinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}