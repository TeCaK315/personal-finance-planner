'use client';

import { useState } from 'react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { TransactionFilters as Filters, Transaction } from '@/types';

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<Filters>({});

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Transactions</span>
          </h1>
          <p className="text-gray-400">Manage your income and expenses</p>
        </div>
        <Button variant="primary" onClick={handleAddTransaction}>
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </Button>
      </div>

      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      <TransactionList 
        filters={filters} 
        onEdit={handleEditTransaction}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}>
        <TransactionForm 
          transaction={editingTransaction || undefined}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}