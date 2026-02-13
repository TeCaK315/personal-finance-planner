'use client';

import { BudgetOverview } from '@/components/dashboard/BudgetOverview';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { RecommendationsPreview } from '@/components/dashboard/RecommendationsPreview';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-gray-400">Here's your financial overview</p>
      </div>

      <BudgetOverview />

      <div className="grid lg:grid-cols-2 gap-8">
        <RecentTransactions />
        <RecommendationsPreview />
      </div>
    </div>
  );
}