import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { calculateBalance, calculateCategoryTotals, calculateMonthlyTrends } from '@/lib/calculations';
import type { ApiResponse, Budget } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const filter: Record<string, unknown> = { userId: user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
    }

    const transactions = await transactionsCollection.find(filter).toArray();

    const mappedTransactions = transactions.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const { totalIncome, totalExpenses, balance } = calculateBalance(mappedTransactions);
    const categoryBreakdown = calculateCategoryTotals(mappedTransactions);
    const monthlyTrend = calculateMonthlyTrends(mappedTransactions);

    const budget: Budget = {
      totalIncome,
      totalExpenses,
      balance,
      categoryBreakdown,
      monthlyTrend,
    };

    return NextResponse.json<ApiResponse<Budget>>(
      { success: true, data: budget },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}