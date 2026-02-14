import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { calculateBudgetSummary } from '@/lib/calculations';
import type { ApiResponse, BudgetSummary } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const user = await getSession(sessionId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid session'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');
    const budgetsCollection = db.collection('budgets');

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const transactions = await transactionsCollection.find({
      userId: user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();

    const budgetDoc = await budgetsCollection.findOne({
      userId: user.id,
      month
    });

    const budget = budgetDoc ? {
      _id: budgetDoc._id.toString(),
      userId: budgetDoc.userId,
      month: budgetDoc.month,
      categoryLimits: budgetDoc.categoryLimits,
      createdAt: budgetDoc.createdAt,
      updatedAt: budgetDoc.updatedAt
    } : null;

    const transactionsList = transactions.map(t => ({
      _id: t._id.toString(),
      userId: t.userId,
      type: t.type,
      category: t.category,
      amount: t.amount,
      description: t.description,
      date: t.date,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    const summary: BudgetSummary = calculateBudgetSummary(transactionsList, budget, month);

    return NextResponse.json<ApiResponse<BudgetSummary>>({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get budget summary error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}