import { Transaction, TransactionType } from '@/types';
import { generateRecommendations } from '@/lib/openai';
import { calculateBudget, calculateCategoryBreakdown } from '@/lib/budget-calculator';
import { subMonths } from 'date-fns';

interface AnalyzedFinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  transactionCount: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
}

export function analyzeFinancialData(transactions: Transaction[]): AnalyzedFinancialData {
  const threeMonthsAgo = subMonths(new Date(), 3);
  const recentTransactions = transactions.filter(
    t => new Date(t.date) >= threeMonthsAgo
  );

  const budget = calculateBudget(recentTransactions);
  const categoryBreakdown = calculateCategoryBreakdown(recentTransactions);

  const monthlyIncomes: number[] = [];
  const monthlyExpenses: number[] = [];

  for (let i = 0; i < 3; i++) {
    const monthStart = subMonths(new Date(), i + 1);
    const monthEnd = subMonths(new Date(), i);

    const monthTransactions = recentTransactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date < monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyIncomes.push(income);
    monthlyExpenses.push(expenses);
  }

  const averageMonthlyIncome =
    monthlyIncomes.length > 0
      ? monthlyIncomes.reduce((sum, val) => sum + val, 0) / monthlyIncomes.length
      : 0;

  const averageMonthlyExpenses =
    monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((sum, val) => sum + val, 0) / monthlyExpenses.length
      : 0;

  return {
    totalIncome: budget.totalIncome,
    totalExpenses: budget.totalExpenses,
    balance: budget.balance,
    categoryBreakdown: categoryBreakdown.map(cat => ({
      category: cat.category,
      amount: cat.amount,
      percentage: cat.percentage,
    })),
    transactionCount: recentTransactions.length,
    averageMonthlyIncome,
    averageMonthlyExpenses,
  };
}

export async function generatePersonalizedRecommendations(
  userId: string,
  transactions: Transaction[]
) {
  try {
    const financialData = analyzeFinancialData(transactions);
    const recommendations = await generateRecommendations(userId, financialData);
    return recommendations;
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    throw new Error('Failed to generate personalized recommendations');
  }
}