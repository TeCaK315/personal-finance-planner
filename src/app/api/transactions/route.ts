import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import type { ApiResponse, PaginatedResponse, Transaction } from '@/types';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as 'income' | 'expense' | null;
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const filter: Record<string, unknown> = { userId: user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await transactionsCollection.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const docs = await transactionsCollection
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const transactions: Transaction[] = docs.map((doc) => ({
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

    return NextResponse.json<PaginatedResponse<Transaction>>(
      {
        success: true,
        data: transactions,
        pagination: { page, limit, total, totalPages },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { type, amount, category, description, date } = body;

    if (!type || !amount || !category || !description || !date) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');
    const now = new Date();

    const result = await transactionsCollection.insertOne({
      userId: user._id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date),
      createdAt: now,
      updatedAt: now,
    });

    const transaction: Transaction = {
      _id: result.insertedId.toString(),
      userId: user._id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date),
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      { success: true, data: transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}