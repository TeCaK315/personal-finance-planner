import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Budget, Transaction, CategorySpending } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateBudgetProgress(budget: Budget, transactions: Transaction[]): {
  totalSpent: number;
  totalIncome: number;
  remainingBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
} {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');

  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = budget.totalAmount - totalSpent;
  const percentageUsed = (totalSpent / budget.totalAmount) * 100;
  const isOverBudget = totalSpent > budget.totalAmount;

  return {
    totalSpent,
    totalIncome,
    remainingBudget,
    percentageUsed,
    isOverBudget
  };
}

export function groupTransactionsByCategory(transactions: Transaction[]): CategorySpending[] {
  const categoryMap = new Map<string, {
    amount: number;
    count: number;
  }>();

  transactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.categoryName) || { amount: 0, count: 0 };
    categoryMap.set(transaction.categoryName, {
      amount: existing.amount + transaction.amount,
      count: existing.count + 1
    });
  });

  const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

  return Array.from(categoryMap.entries())
    .map(([categoryName, data]) => ({
      categoryName,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      transactionCount: data.count
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function groupTransactionsByDate(
  transactions: Transaction[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    let key: string;

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    const existing = grouped.get(key) || [];
    grouped.set(key, [...existing, transaction]);
  });

  return grouped;
}

export function calculateDailyAverage(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): number {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const daysDiff = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  return totalExpenses / daysDiff;
}

export function projectEndBalance(
  budget: Budget,
  transactions: Transaction[]
): number {
  const now = new Date();
  const endDate = new Date(budget.endDate);
  
  if (now >= endDate) {
    const { remainingBudget } = calculateBudgetProgress(budget, transactions);
    return remainingBudget;
  }

  const dailyAverage = calculateDailyAverage(transactions, new Date(budget.startDate), now);
  const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const projectedSpending = dailyAverage * remainingDays;

  const { remainingBudget } = calculateBudgetProgress(budget, transactions);
  return remainingBudget - projectedSpending;
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'text-red-500';
  if (percentage >= 80) return 'text-orange-500';
  if (percentage >= 60) return 'text-yellow-500';
  return 'text-green-500';
}

export function getBudgetStatus(percentage: number): 'healthy' | 'warning' | 'danger' | 'over' {
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'danger';
  if (percentage >= 60) return 'warning';
  return 'healthy';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}