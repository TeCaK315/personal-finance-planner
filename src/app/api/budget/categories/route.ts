import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { calculateCategoryBreakdown } from '@/lib/budget-calculator';
import { ApiResponse, CategoryBreakdown } from '@/types';

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDatabase();
    const transactionsCollection = db.collection('transactions');

    const query: any = { userId: payload.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const transactions = await transactionsCollection.find(query).toArray();

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

    const categoryBreakdown = calculateCategoryBreakdown(mappedTransactions);

    return NextResponse.json<ApiResponse<CategoryBreakdown[]>>(
      { success: true, data: categoryBreakdown },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get category breakdown error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}