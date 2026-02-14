'use client';

import React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Link from 'next/link';

export function RecentTransactions() {
  const { transactions, isLoading } = useTransactions({ page: 1, limit: 5 });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">No transactions yet</p>
          <Link href="/transactions" className="text-purple-400 hover:text-purple-300 font-semibold">
            Add your first transaction
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
          <Link href="/transactions" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">{transaction.description}</p>
                  <p className="text-xs text-slate-400">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <span className={`font-bold ${
                transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}