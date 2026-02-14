'use client';

import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Receipt } from 'lucide-react';
import type { TransactionFilters as TFilters } from '@/types';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TFilters>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { transactions, loading, refetch } = useTransactions(filters);

  const handleTransactionAdded = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleFiltersChange = (newFilters: TFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Track and manage all your transactions
          </p>
        </div>
        <Button 
          variant="primary" 
          className="gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </Button>
      </div>

      <Card className="glass-strong border-white/10">
        <CardHeader>
          <h2 className="text-xl font-bold">Filters</h2>
        </CardHeader>
        <CardContent>
          <TransactionFilters 
            filters={filters}
            onChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : transactions && transactions.length > 0 ? (
        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <TransactionList 
              transactions={transactions}
              onUpdate={refetch}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-strong border-white/10">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Transactions Found</h2>
            <p className="text-[hsl(var(--text-secondary))] mb-6 max-w-md mx-auto">
              {Object.keys(filters).length > 0
                ? 'No transactions match your current filters. Try adjusting them.'
                : 'Add your first transaction to start tracking your finances.'}
            </p>
            <Button 
              variant="primary" 
              size="lg"
              className="gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Transaction"
      >
        <TransactionForm
          onSuccess={handleTransactionAdded}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}