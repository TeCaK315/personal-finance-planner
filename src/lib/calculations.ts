import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';
import { BudgetSummary, GoalProgress, TransactionCategory } from '@/types';
import { differenceInDays, differenceInMonths } from 'date-fns';

export async function calculateBudgetSummary(userId: string, month: string): Promise<BudgetSummary> {
  const db = await getDb();

  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const transactions = await db
    .collection('transactions')
    .find({
      userId: new ObjectId(userId),
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    })
    .toArray();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const budget = await db.collection('budgets').findOne({
    userId: new ObjectId(userId),
    month,
  });

  const categorySpending: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;
  
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const category = t.category as TransactionCategory;
      categorySpending[category] = (categorySpending[category] || 0) + t.amount;
    });

  const categoryBreakdown = budget?.categoryLimits.map((limit: any) => {
    const spent = categorySpending[limit.category as TransactionCategory] || 0;
    const percentage = limit.limit > 0 ? (spent / limit.limit) * 100 : 0;

    return {
      category: limit.category as TransactionCategory,
      spent,
      limit: limit.limit,
      percentage: Math.round(percentage * 100) / 100,
    };
  }) || [];

  return {
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    month,
  };
}

export async function calculateGoalProgress(goalId: string): Promise<GoalProgress> {
  const db = await getDb();

  const goal = await db.collection('financial_goals').findOne({
    _id: new ObjectId(goalId),
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  const percentage = goal.targetAmount > 0 
    ? (goal.currentAmount / goal.targetAmount) * 100 
    : 0;

  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

  const today = new Date();
  const deadline = new Date(goal.deadline);
  const daysRemaining = Math.max(0, differenceInDays(deadline, today));

  const monthsRemaining = Math.max(1, differenceInMonths(deadline, today) || 1);
  const monthlyRequiredSavings = remainingAmount / monthsRemaining;

  const expectedProgress = goal.targetAmount > 0
    ? ((differenceInDays(today, new Date(goal.createdAt)) / differenceInDays(deadline, new Date(goal.createdAt))) * 100)
    : 0;

  const onTrack = percentage >= expectedProgress || percentage >= 100;

  return {
    goalId: goal._id.toString(),
    percentage: Math.round(percentage * 100) / 100,
    remainingAmount,
    daysRemaining,
    monthlyRequiredSavings: Math.round(monthlyRequiredSavings * 100) / 100,
    onTrack,
  };
}

export async function calculateMonthlyProjection(userId: string): Promise<{
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
}> {
  const db = await getDb();

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await db
    .collection('transactions')
    .find({
      userId: new ObjectId(userId),
      date: { $gte: threeMonthsAgo },
    })
    .toArray();

  const monthlyData: Record<string, { income: number; expenses: number }> = {};

  transactions.forEach((t) => {
    const monthKey = new Date(t.date).toISOString().slice(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    if (t.type === 'income') {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expenses += t.amount;
    }
  });

  const months = Object.values(monthlyData);
  const monthCount = months.length || 1;

  const averageMonthlyIncome = months.reduce((sum, m) => sum + m.income, 0) / monthCount;
  const averageMonthlyExpenses = months.reduce((sum, m) => sum + m.expenses, 0) / monthCount;

  const projectedIncome = Math.round(averageMonthlyIncome * 100) / 100;
  const projectedExpenses = Math.round(averageMonthlyExpenses * 100) / 100;
  const projectedBalance = projectedIncome - projectedExpenses;

  return {
    projectedIncome,
    projectedExpenses,
    projectedBalance,
    averageMonthlyIncome: Math.round(averageMonthlyIncome * 100) / 100,
    averageMonthlyExpenses: Math.round(averageMonthlyExpenses * 100) / 100,
  };
}