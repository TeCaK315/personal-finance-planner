import { Budget, Transaction, CategoryUsage, BudgetStatus } from '@/types';

export function calculateRemainingBudget(budget: Budget, transactions: Transaction[]): number {
  const totalSpent = transactions
    .filter(t => t.type === 'expense' && t.budgetId === budget._id)
    .reduce((sum, t) => sum + t.amount, 0);

  return budget.totalAmount - totalSpent;
}

export function checkCategoryLimit(
  categoryId: string,
  categoryLimit: number,
  transactions: Transaction[]
): { isOverLimit: boolean; spent: number; remaining: number } {
  const spent = transactions
    .filter(t => t.type === 'expense' && t.categoryId === categoryId)
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = categoryLimit - spent;
  const isOverLimit = spent > categoryLimit;

  return { isOverLimit, spent, remaining };
}

export function calculateCategoryUsage(
  budget: Budget,
  transactions: Transaction[]
): CategoryUsage[] {
  const categoryUsages: CategoryUsage[] = [];

  for (const categoryLimit of budget.categoryLimits) {
    const spent = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.categoryId === categoryLimit.categoryId &&
        t.budgetId === budget._id
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = categoryLimit.limit - spent;
    const percentageUsed = categoryLimit.limit > 0 ? (spent / categoryLimit.limit) * 100 : 0;
    const isOverspent = spent > categoryLimit.limit;

    categoryUsages.push({
      categoryId: categoryLimit.categoryId,
      categoryName: categoryLimit.categoryName,
      limit: categoryLimit.limit,
      spent,
      remaining,
      percentageUsed,
      isOverspent,
    });
  }

  return categoryUsages;
}

export function getOverspendingCategories(
  budget: Budget,
  transactions: Transaction[]
): string[] {
  const categoryUsages = calculateCategoryUsage(budget, transactions);
  return categoryUsages
    .filter(usage => usage.isOverspent)
    .map(usage => usage.categoryName);
}

export function calculateBudgetStatus(
  budget: Budget,
  transactions: Transaction[]
): BudgetStatus {
  const totalSpent = transactions
    .filter(t => t.type === 'expense' && t.budgetId === budget._id)
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingAmount = budget.totalAmount - totalSpent;
  const percentageUsed = budget.totalAmount > 0 ? (totalSpent / budget.totalAmount) * 100 : 0;

  const categoryBreakdown = calculateCategoryUsage(budget, transactions);
  const overspendingCategories = getOverspendingCategories(budget, transactions);

  return {
    budgetId: budget._id,
    totalAmount: budget.totalAmount,
    totalSpent,
    remainingAmount,
    percentageUsed,
    categoryBreakdown,
    overspendingCategories,
  };
}