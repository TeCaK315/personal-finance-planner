'use client';

import { TrendingUp, TrendingDown, Edit, Trash2, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

  return (
    <Card className="p-4 hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isIncome
                ? 'bg-gradient-to-br from-green-400 to-green-600'
                : 'bg-gradient-to-br from-red-400 to-red-600'
            }`}
          >
            {isIncome ? (
              <TrendingUp className="w-6 h-6 text-white" />
            ) : (
              <TrendingDown className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-text">
                {transaction.description}
              </h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {transaction.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text/60">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(transaction.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={`text-2xl font-bold ${
                isIncome ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-text/40 mt-1">
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-text/60 hover:text-primary"
              aria-label="Edit transaction"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(transaction._id)}
              className="p-2 rounded-lg hover:bg-red-400/10 transition-colors text-text/60 hover:text-red-400"
              aria-label="Delete transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}