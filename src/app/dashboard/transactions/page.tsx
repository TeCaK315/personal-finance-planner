'use client';

import { useEffect, useState } from 'react';
import { Transaction } from '@/types';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/budget/TransactionForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: undefined as 'income' | 'expense' | undefined,
    category: undefined as string | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleTransactionAdded = () => {
    setShowModal(false);
    fetchTransactions();
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow text-primary text-xl">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-text/70">View and manage your transaction history</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </Button>
      </div>

      <TransactionFilters onFilterChange={handleFilterChange} />

      {error && (
        <Card>
          <div className="p-6 text-center text-red-400">{error}</div>
        </Card>
      )}

      {transactions.length === 0 && !error ? (
        <Card>
          <div className="p-12 text-center">
            <p className="text-text/70 mb-4">No transactions found. Add your first transaction!</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Transaction
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-6">
            <TransactionList transactions={transactions} onUpdate={fetchTransactions} />
          </div>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Transaction">
        <TransactionForm onSuccess={handleTransactionAdded} />
      </Modal>
    </div>
  );
}