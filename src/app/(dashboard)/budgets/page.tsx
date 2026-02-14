'use client';

import React, { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { BudgetList } from '@/components/budget/BudgetList';
import { CreateBudgetModal } from '@/components/budget/CreateBudgetModal';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Target } from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, loading, refetch } = useBudgets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleBudgetCreated = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budgets</h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Manage your budgets and track spending
          </p>
        </div>
        <Button 
          variant="primary" 
          className="gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Create Budget
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : budgets && budgets.length > 0 ? (
        <BudgetList budgets={budgets} />
      ) : (
        <Card className="glass-strong border-white/10">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Budgets Yet</h2>
            <p className="text-[hsl(var(--text-secondary))] mb-6 max-w-md mx-auto">
              Create your first budget to start tracking your spending and achieving your financial goals.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleBudgetCreated}
      />
    </div>
  );
}