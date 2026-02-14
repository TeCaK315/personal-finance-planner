'use client';

import React from 'react';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AIRecommendationsWidget } from '@/components/dashboard/AIRecommendationsWidget';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your financial health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value="$12,450.00"
          change="+12.5%"
          isPositive={true}
          icon={<Wallet className="w-6 h-6" />}
        />
        <StatCard
          title="Monthly Income"
          value="$5,200.00"
          change="+8.2%"
          isPositive={true}
          icon={<ArrowUpRight className="w-6 h-6" />}
        />
        <StatCard
          title="Monthly Expenses"
          value="$3,840.00"
          change="-5.1%"
          isPositive={true}
          icon={<ArrowDownRight className="w-6 h-6" />}
        />
        <StatCard
          title="Savings Rate"
          value="26.2%"
          change="+3.4%"
          isPositive={true}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetOverview />
        </div>
        <div>
          <AIRecommendationsWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon 
}: { 
  title: string; 
  value: string; 
  change: string; 
  isPositive: boolean; 
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm">{title}</span>
          <div className="text-purple-400">{icon}</div>
        </div>
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        <div className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {change} from last month
        </div>
      </CardContent>
    </Card>
  );
}