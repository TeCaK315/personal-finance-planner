import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { calculateBudgetHealth, calculateSavingsRate } from '@/lib/budget-calculator';
import { FinancialOverview, ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<FinancialOverview>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const budgetId = searchParams.get('budgetId');

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');
    const categoriesCollection = db.collection('categories');
    const budgetsCollection = db.collection('budgets');

    const transactionQuery: {
      userId: string;
      date: { $gte: Date; $lte: Date };
      budgetId?: string;
    } = {
      userId: session.userId,
      date: { $gte: startDate, $lte: endDate }
    };

    if (budgetId) {
      if (!ObjectId.isValid(budgetId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid budget ID' },
          { status: 400 }
        );
      }
      transactionQuery.budgetId = budgetId;
    }

    const transactions = await transactionsCollection.find(transactionQuery).toArray();

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals: Map<string, { name: string; amount: number }> = new Map();

    for (const txn of transactions) {
      if (txn.type === 'income') {
        totalIncome += txn.amount;
      } else {
        totalExpenses += txn.amount;
        
        const existing = categoryTotals.get(txn.categoryId);
        if (existing) {
          existing.amount += txn.amount;
        } else {
          const category = await categoriesCollection.findOne({
            _id: new ObjectId(txn.categoryId)
          });
          categoryTotals.set(txn.categoryId, {
            name: category?.name || 'Unknown',
            amount: txn.amount
          });
        }
      }
    }

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

    const topCategories = Array.from(categoryTotals.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    let budgetHealth = 0;
    if (budgetId) {
      const budget = await budgetsCollection.findOne({
        _id: new ObjectId(budgetId),
        userId: session.userId
      });
      if (budget) {
        const healthMetrics = await calculateBudgetHealth(budget, transactions);
        budgetHealth = healthMetrics.score;
      }
    } else {
      const activeBudgets = await budgetsCollection
        .find({
          userId: session.userId,
          status: 'active'
        })
        .toArray();

      if (activeBudgets.length > 0) {
        let totalHealth = 0;
        for (const budget of activeBudgets) {
          const budgetTransactions = transactions.filter(
            txn => txn.budgetId === budget._id.toString()
          );
          const healthMetrics = await calculateBudgetHealth(budget, budgetTransactions);
          totalHealth += healthMetrics.score;
        }
        budgetHealth = totalHealth / activeBudgets.length;
      }
    }

    const overview: FinancialOverview = {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      budgetHealth,
      topCategories,
      period: {
        startDate,
        endDate
      }
    };

    return NextResponse.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Get analytics overview error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}