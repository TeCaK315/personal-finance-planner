import type { Transaction, CategoryTotal, MonthlyData } from '@/types';
import { startOfMonth, format, parseISO } from 'date-fns';

export function calculateBalance(transactions: Transaction[]): {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
} {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}

export function calculateGoalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount === 0) return 0;
  const progress = (currentAmount / targetAmount) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100);
}

export function calculateCategoryTotals(transactions: Transaction[]): CategoryTotal[] {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryMap)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function calculateMonthlyTrends(transactions: Transaction[]): MonthlyData[] {
  const monthlyMap = transactions.reduce((acc, t) => {
    const date = t.date instanceof Date ? t.date : parseISO(t.date.toString());
    const monthKey = format(startOfMonth(date), 'yyyy-MM');

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: format(startOfMonth(date), 'MMM yyyy'),
        income: 0,
        expenses: 0,
        balance: 0,
      };
    }

    if (t.type === 'income') {
      acc[monthKey].income += t.amount;
    } else {
      acc[monthKey].expenses += t.amount;
    }

    return acc;
  }, {} as Record<string, MonthlyData>);

  Object.values(monthlyMap).forEach((month) => {
    month.balance = month.income - month.expenses;
  });

  return Object.values(monthlyMap).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });
}