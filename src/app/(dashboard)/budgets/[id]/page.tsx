'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { BudgetProgress } from '@/components/budget/BudgetProgress';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, Plus, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import type { Budget, BudgetSummary, Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;

  const [budget, setBudget] = useState<Budget | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const [budgetRes, summaryRes, transactionsRes] = await Promise.all([
        fetch(`/api/budgets/${budgetId}`),
        fetch(`/api/budgets/${budgetId}/summary`),
        fetch(`/api/transactions?budgetId=${budgetId}&limit=50`)
      ]);

      const budgetData = await budgetRes.json();
      const summaryData = await summaryRes.json();
      const transactionsData = await transactionsRes.json();

      if (budgetData.success) setBudget(budgetData.data);
      if (summaryData.success) setSummary(summaryData.data);
      if (transactionsData.success) setTransactions(transactionsData.data);
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [budgetId]);

  const handleTransactionAdded = () => {
    setIsTransactionModalOpen(false);
    fetchBudgetData();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!budget || !summary) {
    return (
      <div className="text-center py-12">
        <p className="text-[hsl(var(--text-secondary))] mb-4">Budget not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/budgets')}>
          Back to Budgets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/budgets')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{budget.name}</h1>
            <p className="text-[hsl(var(--text-secondary))] capitalize">{budget.period} Budget</p>
          </div>
        </div>
        <Button
          variant="primary"
          className="gap-2"
          onClick={() => setIsTransactionModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Remaining</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.remainingBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-strong border-white/10">
        <CardHeader>
          <h2 className="text-xl font-bold">Budget Progress</h2>
        </CardHeader>
        <CardContent>
          <BudgetProgress
            spent={summary.totalSpent}
            total={summary.totalBudget}
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-strong border-white/10">
          <CardHeader>
            <h2 className="text-xl font-bold">Category Breakdown</h2>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={summary.topSpendingCategories} />
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardHeader>
            <h2 className="text-xl font-bold">Recent Transactions</h2>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={transactions.slice(0, 5)}
              onUpdate={fetchBudgetData}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Add Transaction"
      >
        <TransactionForm
          defaultBudgetId={budgetId}
          onSuccess={handleTransactionAdded}
          onCancel={() => setIsTransactionModalOpen(false)}
        />
      </Modal>
    </div>
  );
}