import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { calculateBalance, calculateCategoryTotals, calculateMonthlyTrends } from '@/lib/calculations';
import type { ApiResponse, Budget } from '@/types';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { startDate, endDate, categories } = body;

    if (!startDate || !endDate) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const filter: Record<string, unknown> = {
      userId: user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (categories && Array.isArray(categories) && categories.length > 0) {
      filter.category = { $in: categories };
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
    console.error('Calculate budget error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}