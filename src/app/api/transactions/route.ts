import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, Transaction, CreateTransactionRequest, TransactionFilters, TransactionCategory, TransactionType } from '@/types';
import { ObjectId } from 'mongodb';

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
    const category = searchParams.get('category') as TransactionCategory | null;
    const type = searchParams.get('type') as TransactionType | null;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    const total = await transactionsCollection.countDocuments(query);
    const transactionDocs = await transactionsCollection
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const transactions: Transaction[] = transactionDocs.map(doc => ({
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

    return NextResponse.json<ApiResponse<{ transactions: Transaction[]; total: number }>>(
      { success: true, data: { transactions, total } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body: CreateTransactionRequest = await request.json();
    const { amount, category, type, description, date } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!Object.values(TransactionCategory).includes(category)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!Object.values(TransactionType).includes(type)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid type' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const transactionsCollection = db.collection('transactions');

    const now = new Date();
    const result = await transactionsCollection.insertOne({
      userId: payload.userId,
      amount,
      category,
      type,
      description,
      date: new Date(date),
      createdAt: now,
      updatedAt: now
    });

    const transaction: Transaction = {
      _id: result.insertedId.toString(),
      userId: payload.userId,
      amount,
      category,
      type,
      description,
      date: new Date(date),
      createdAt: now,
      updatedAt: now
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      { success: true, data: transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}