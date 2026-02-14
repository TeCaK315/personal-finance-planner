import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { calculateBudgetHealth } from '@/lib/budget-calculator';
import { ObjectId } from 'mongodb';
import type { BudgetHealthMetrics, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');
    const transactionsCollection = db.collection('transactions');

    const budgetDoc = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!budgetDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const transactions = await transactionsCollection
      .find({
        userId: session.userId,
        budgetId: params.id,
        date: {
          $gte: budgetDoc.startDate,
          $lte: budgetDoc.endDate,
        },
      })
      .toArray();

    const healthMetrics = calculateBudgetHealth(
      {
        _id: budgetDoc._id.toString(),
        userId: budgetDoc.userId,
        name: budgetDoc.name,
        period: budgetDoc.period,
        startDate: budgetDoc.startDate,
        endDate: budgetDoc.endDate,
        categories: budgetDoc.categories,
        totalIncome: budgetDoc.totalIncome,
        totalExpenses: budgetDoc.totalExpenses,
        status: budgetDoc.status,
        healthScore: budgetDoc.healthScore,
        createdAt: budgetDoc.createdAt,
        updatedAt: budgetDoc.updatedAt,
      },
      transactions.map((t) => ({
        _id: t._id.toString(),
        userId: t.userId,
        budgetId: t.budgetId,
        categoryId: t.categoryId,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        recurring: t.recurring,
        recurringFrequency: t.recurringFrequency,
        tags: t.tags,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );

    await budgetsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { healthScore: healthMetrics.score, updatedAt: new Date() } }
    );

    return NextResponse.json<ApiResponse<BudgetHealthMetrics>>(
      { success: true, data: healthMetrics },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budget health error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}