import type { Budget, Transaction, BudgetHealthMetrics, BudgetAlert } from '@/types';

export function calculateCategoryTotals(
  budget: Budget,
  transactions: Transaction[]
): Budget {
  const categoryMap = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (transaction.type === 'expense') {
      const current = categoryMap.get(transaction.categoryId) || 0;
      categoryMap.set(transaction.categoryId, current + transaction.amount);
    }
  });

  const updatedCategories = budget.categories.map((category) => {
    const spentAmount = categoryMap.get(category.categoryId) || 0;
    const percentage = category.allocatedAmount > 0 
      ? (spentAmount / category.allocatedAmount) * 100 
      : 0;

    return {
      ...category,
      spentAmount,
      percentage,
    };
  });

  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);

  return {
    ...budget,
    categories: updatedCategories,
    totalExpenses,
  };
}

export function calculateBudgetHealth(
  budget: Budget,
  transactions: Transaction[]
): BudgetHealthMetrics {
  const updatedBudget = calculateCategoryTotals(budget, transactions);

  const totalAllocated = updatedBudget.categories.reduce(
    (sum, cat) => sum + cat.allocatedAmount,
    0
  );
  const totalSpent = updatedBudget.totalExpenses;

  const spendingRatio = totalAllocated > 0 ? totalSpent / totalAllocated : 0;
  
  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalSpent;
  const savingsRatio = totalIncome > 0 ? netSavings / totalIncome : 0;

  const categoryVariances = updatedBudget.categories.map((cat) => {
    const variance = cat.allocatedAmount > 0 
      ? Math.abs(cat.spentAmount - cat.allocatedAmount) / cat.allocatedAmount 
      : 0;
    return variance;
  });
  const avgVariance = categoryVariances.length > 0
    ? categoryVariances.reduce((sum, v) => sum + v, 0) / categoryVariances.length
    : 0;
  const categoryBalance = Math.max(0, 1 - avgVariance);

  const consistency = spendingRatio <= 1 ? 1 : Math.max(0, 2 - spendingRatio);

  const score = Math.round(
    (1 - Math.min(spendingRatio, 1)) * 30 +
    savingsRatio * 30 +
    categoryBalance * 20 +
    consistency * 20
  );

  let status: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'good';
  else if (score >= 40) status = 'fair';
  else status = 'poor';

  const recommendations: string[] = [];
  if (spendingRatio > 0.9) {
    recommendations.push('You are approaching your budget limit. Consider reducing discretionary spending.');
  }
  if (savingsRatio < 0.2) {
    recommendations.push('Try to increase your savings rate to at least 20% of your income.');
  }
  if (avgVariance > 0.3) {
    recommendations.push('Some categories have high variance. Review and adjust your budget allocations.');
  }

  return {
    score,
    status,
    metrics: {
      spendingRatio,
      savingsRatio,
      categoryBalance,
      consistency,
    },
    recommendations,
  };
}

export function checkBudgetAlerts(
  budget: Budget,
  transactions: Transaction[],
  userId: string
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];
  const updatedBudget = calculateCategoryTotals(budget, transactions);

  updatedBudget.categories.forEach((category) => {
    const percentage = category.percentage;

    if (percentage >= 100) {
      alerts.push({
        _id: `alert-${budget._id}-${category.categoryId}-exceeded`,
        userId,
        budgetId: budget._id,
        categoryId: category.categoryId,
        type: 'budget_exceeded',
        severity: 'critical',
        title: `Budget Exceeded: ${category.categoryName}`,
        message: `You have exceeded your budget for ${category.categoryName} by ${(percentage - 100).toFixed(1)}%.`,
        threshold: category.allocatedAmount,
        currentAmount: category.spentAmount,
        dismissed: false,
        createdAt: new Date(),
      });
    } else if (percentage >= 80) {
      alerts.push({
        _id: `alert-${budget._id}-${category.categoryId}-approaching`,
        userId,
        budgetId: budget._id,
        categoryId: category.categoryId,
        type: 'approaching_limit',
        severity: 'warning',
        title: `Approaching Limit: ${category.categoryName}`,
        message: `You have used ${percentage.toFixed(1)}% of your ${category.categoryName} budget.`,
        threshold: category.allocatedAmount,
        currentAmount: category.spentAmount,
        dismissed: false,
        createdAt: new Date(),
      });
    }
  });

  const recentTransactions = transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (recentTransactions.length >= 5) {
    const avgAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length;
    const unusualTransactions = recentTransactions.filter((t) => t.amount > avgAmount * 2);

    if (unusualTransactions.length > 0) {
      alerts.push({
        _id: `alert-${budget._id}-unusual-spending`,
        userId,
        budgetId: budget._id,
        type: 'unusual_spending',
        severity: 'info',
        title: 'Unusual Spending Detected',
        message: `We detected ${unusualTransactions.length} transaction(s) significantly higher than your average spending.`,
        dismissed: false,
        createdAt: new Date(),
      });
    }
  }

  return alerts;
}

export function calculateSavingsRate(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): number {
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  return totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
}