import { Transaction, Budget, CategoryBreakdown, MonthlyTrendData, TransactionType, TransactionCategory } from '@/types';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

function filterTransactionsByDate(
  transactions: Transaction[],
  startDate?: Date,
  endDate?: Date
): Transaction[] {
  if (!startDate && !endDate) {
    return transactions;
  }

  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;
    return true;
  });
}

export function calculateBudget(
  transactions: Transaction[],
  startDate?: Date,
  endDate?: Date
): Budget {
  const filteredTransactions = filterTransactionsByDate(transactions, startDate, endDate);

  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryBreakdown = calculateCategoryBreakdown(filteredTransactions);
  const monthlyTrend = calculateMonthlyTrend(transactions, 6);

  return {
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    monthlyTrend,
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[]
): CategoryBreakdown[] {
  const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<TransactionCategory, { amount: number; count: number }>();

  expenseTransactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
    categoryMap.set(transaction.category, {
      amount: existing.amount + transaction.amount,
      count: existing.count + 1,
    });
  });

  const breakdown: CategoryBreakdown[] = [];

  categoryMap.forEach((value, category) => {
    breakdown.push({
      category,
      amount: value.amount,
      percentage: totalExpenses > 0 ? (value.amount / totalExpenses) * 100 : 0,
      transactionCount: value.count,
    });
  });

  return breakdown.sort((a, b) => b.amount - a.amount);
}

export function calculateMonthlyTrend(
  transactions: Transaction[],
  months: number = 6
): MonthlyTrendData[] {
  const trendData: MonthlyTrendData[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    trendData.push({
      month: format(monthDate, 'MMM'),
      year: monthDate.getFullYear(),
      income,
      expenses,
      balance: income - expenses,
    });
  }

  return trendData;
}