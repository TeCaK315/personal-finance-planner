'use client';

import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No transactions found</p>
        <p className="text-sm text-gray-500 mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-medium text-gray-900">{transaction.description}</h4>
              <Badge variant={transaction.type === 'income' ? 'success' : 'error'}>
                {transaction.type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{transaction.categoryName}</span>
              <span>•</span>
              <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-lg font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </span>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(transaction._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}