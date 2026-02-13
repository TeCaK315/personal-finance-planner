import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { calculateMonthlyTrend } from '@/lib/budget-calculator';
import { ApiResponse, MonthlyTrendData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12');

    const db = await getDatabase();
    const transactionsCollection = db.collection('transactions');

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await transactionsCollection
      .find({
        userId: payload.userId,
        date: { $gte: startDate }
      })
      .sort({ date: 1 })
      .toArray();

    const mappedTransactions = transactions.map(doc => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      amount: doc.amount,
      category: doc.category,
      type: doc.type,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

    const monthlyTrend = calculateMonthlyTrend(mappedTransactions, months);

    return NextResponse.json<ApiResponse<MonthlyTrendData[]>>(
      { success: true, data: monthlyTrend },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get monthly trend error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}