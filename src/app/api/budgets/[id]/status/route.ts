import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { calculateRemainingBudget, calculateCategoryUsage, getOverspendingCategories } from '@/lib/budget-calculator';
import type { BudgetStatus, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');
    const transactionsCollection = db.collection('transactions');

    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (!budget) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const transactions = await transactionsCollection
      .find({
        budgetId: params.id,
        type: 'expense',
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate,
        },
      })
      .toArray();

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingAmount = calculateRemainingBudget(budget.totalAmount, totalSpent);
    const percentageUsed = budget.totalAmount > 0 ? (totalSpent / budget.totalAmount) * 100 : 0;

    const categoryBreakdown = calculateCategoryUsage(budget.categoryLimits, transactions);
    const overspendingCategories = getOverspendingCategories(categoryBreakdown);

    const status: BudgetStatus = {
      budgetId: params.id,
      totalAmount: budget.totalAmount,
      totalSpent,
      remainingAmount,
      percentageUsed,
      categoryBreakdown,
      overspendingCategories,
    };

    return NextResponse.json<ApiResponse<BudgetStatus>>(
      {
        success: true,
        data: status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budget status error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}