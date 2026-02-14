'use client';

import React, { useState } from 'react';
import { Budget } from '@/types';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

interface BudgetListProps {
  budgets: Budget[];
}

export function BudgetList({ budgets }: BudgetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date'>('date');

  const filteredBudgets = budgets
    .filter((budget) => {
      const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPeriod = periodFilter === 'all' || budget.period === periodFilter;
      return matchesSearch && matchesPeriod;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search budgets..."
            className="pl-10"
          />
        </div>

        <Select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
          <option value="all">All Periods</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Select>

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="amount">Sort by Amount</option>
        </Select>
      </div>

      {filteredBudgets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No budgets found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm || periodFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first budget to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => (
            <BudgetCard key={budget._id} budget={budget} />
          ))}
        </div>
      )}
    </div>
  );
}