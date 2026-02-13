'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useTransactions } from '@/hooks/useTransactions';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowRight, ShoppingBag, Home, Car, Utensils, Heart, GraduationCap, Tv, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { TransactionCategory } from '@/types';
import { format } from 'date-fns';

const categoryIcons: Record<TransactionCategory, any> = {
  [TransactionCategory.FOOD]: Utensils,
  [TransactionCategory.TRANSPORT]: Car,
  [TransactionCategory.HOUSING]: Home,
  [TransactionCategory.UTILITIES]: DollarSign,
  [TransactionCategory.ENTERTAINMENT]: Tv,
  [TransactionCategory.HEALTHCARE]: Heart,
  [TransactionCategory.EDUCATION]: GraduationCap,
  [TransactionCategory.SHOPPING]: ShoppingBag,
  [TransactionCategory.SALARY]: TrendingUp,
  [TransactionCategory.INVESTMENT]: TrendingUp,
  [TransactionCategory.OTHER]: DollarSign,
};

export function RecentTransactions() {
  const { transactions, loading, error } = useTransactions({ limit: 5 });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
          <Link href="/transactions" className="text-primary hover:text-secondary transition-colors flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No transactions yet. Add your first transaction!
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const Icon = categoryIcons[transaction.category];
              const isIncome = transaction.type === 'income';
              return (
                <div key={transaction._id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full ${isIncome ? 'gradient-primary' : 'bg-slate-700'} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-400">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400 capitalize">{transaction.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}