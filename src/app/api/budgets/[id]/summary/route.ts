import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { BudgetSummary, Budget, Transaction, CategoryBreakdown, CategorySpending } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const budgetId = params.id;
    if (!ObjectId.isValid(budgetId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid budget ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const budget = await db.collection<Budget>('budgets').findOne({
      _id: new ObjectId(budgetId),
      userId: session.userId
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const transactions = await db.collection<Transaction>('transactions')
      .find({
        budgetId: budgetId,
        userId: session.userId,
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate
        }
      })
      .toArray();

    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const remainingBudget = budget.totalAmount - totalSpent;
    const percentageUsed = budget.totalAmount > 0 
      ? (totalSpent / budget.totalAmount) * 100 
      : 0;

    const categoryBreakdown: CategoryBreakdown[] = budget.categories.map(cat => {
      const categoryTransactions = transactions.filter(
        t => t.categoryId === cat.categoryId && t.type === 'expense'
      );
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = cat.allocatedAmount - spent;
      const percentageUsed = cat.allocatedAmount > 0 
        ? (spent / cat.allocatedAmount) * 100 
        : 0;

      return {
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        allocated: cat.allocatedAmount,
        spent,
        remaining,
        percentageUsed
      };
    });

    const categorySpendingMap = new Map<string, { amount: number; count: number }>();
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const existing = categorySpendingMap.get(t.categoryName) || { amount: 0, count: 0 };
        categorySpendingMap.set(t.categoryName, {
          amount: existing.amount + t.amount,
          count: existing.count + 1
        });
      });

    const topSpendingCategories: CategorySpending[] = Array.from(categorySpendingMap.entries())
      .map(([categoryName, data]) => ({
        categoryName,
        amount: data.amount,
        percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const daysInPeriod = Math.max(
      1,
      Math.ceil(
        (new Date(budget.endDate).getTime() - new Date(budget.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const dailyAverageSpending = totalSpent / daysInPeriod;

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(budget.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const projectedEndBalance = remainingBudget - dailyAverageSpending * daysRemaining;

    const summary: BudgetSummary = {
      budgetId: budget._id.toString(),
      totalBudget: budget.totalAmount,
      totalSpent,
      totalIncome,
      remainingBudget,
      percentageUsed,
      categoryBreakdown,
      topSpendingCategories,
      dailyAverageSpending,
      projectedEndBalance
    };

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}