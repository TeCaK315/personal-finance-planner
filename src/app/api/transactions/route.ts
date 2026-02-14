import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { transactionSchema } from '@/lib/validators';
import type { Transaction, ApiResponse, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const search = searchParams.get('search');

    const db = await connectToDatabase();
    const transactionsCollection = db.collection<Transaction>('transactions');

    const query: Record<string, unknown> = { userId: payload.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (categoryId) query.categoryId = categoryId;
    if (type) query.type = type;

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const total = await transactionsCollection.countDocuments(query);
    const transactions = await transactionsCollection
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const transactionsWithStringId = transactions.map(transaction => ({
      ...transaction,
      _id: transaction._id.toString(),
    }));

    return NextResponse.json<PaginatedResponse<Transaction>>(
      {
        success: true,
        data: transactionsWithStringId,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
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

    const body = await request.json();
    const validation = transactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { budgetId, categoryId, amount, type, description, date } = validation.data;

    const db = await connectToDatabase();
    const transactionsCollection = db.collection<Transaction>('transactions');

    const newTransaction: Omit<Transaction, '_id'> = {
      userId: payload.userId,
      budgetId,
      categoryId,
      amount,
      type,
      description,
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(newTransaction as Transaction);
    const transactionId = result.insertedId.toString();

    return NextResponse.json<ApiResponse<Transaction>>(
      {
        success: true,
        data: {
          ...newTransaction,
          _id: transactionId,
        },
      },
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