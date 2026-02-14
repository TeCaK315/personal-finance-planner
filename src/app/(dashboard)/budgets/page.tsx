'use client';

import React, { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Filter } from 'lucide-react';

export default function BudgetsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const { budgets, isLoading, createBudget, updateBudget, deleteBudget } = useBudgets({ active: showActiveOnly });

  const handleCreateBudget = async (data: any) => {
    await createBudget(data);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Budgets</h1>
          <p className="text-slate-400">Manage your spending limits and track progress</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Budget
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant={showActiveOnly ? 'primary' : 'secondary'}
          onClick={() => setShowActiveOnly(!showActiveOnly)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showActiveOnly ? 'Active Budgets' : 'All Budgets'}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 text-lg mb-4">No budgets found</p>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            Create Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onUpdate={updateBudget}
              onDelete={deleteBudget}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Budget"
      >
        <BudgetForm onSubmit={handleCreateBudget} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
}