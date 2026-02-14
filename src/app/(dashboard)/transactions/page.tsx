'use client';

import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { BulkImportModal } from '@/components/transactions/BulkImportModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, Upload, Download } from 'lucide-react';
import type { TransactionFilters as TFilters } from '@/types';

export default function TransactionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [filters, setFilters] = useState<TFilters>({});
  const [page, setPage] = useState(1);
  
  const { transactions, pagination, isLoading, createTransaction, updateTransaction, deleteTransaction, refetch } = useTransactions({
    page,
    limit: 20,
    ...filters,
  });

  const handleCreateTransaction = async (data: any) => {
    await createTransaction(data);
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleBulkImportComplete = () => {
    setIsBulkImportOpen(false);
    refetch();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Transactions</h1>
          <p className="text-slate-400">Track and manage all your financial transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setIsBulkImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      <TransactionList
        transactions={transactions}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onUpdate={updateTransaction}
        onDelete={deleteTransaction}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Transaction"
      >
        <TransactionForm 
          onSubmit={handleCreateTransaction} 
          onCancel={() => setIsCreateModalOpen(false)} 
        />
      </Modal>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onComplete={handleBulkImportComplete}
      />
    </div>
  );
}