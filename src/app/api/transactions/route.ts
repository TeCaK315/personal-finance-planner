import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { validateTransaction } from '@/lib/validators';
import type { ApiResponse, Transaction, CreateTransactionRequest, PaginatedResponse } from '@/types';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const filter: any = { userId: user.id };

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const total = await transactionsCollection.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const transactionDocs = await transactionsCollection
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const transactions: Transaction[] = transactionDocs.map(doc => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      category: doc.category,
      amount: doc.amount,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

    return NextResponse.json<PaginatedResponse<Transaction>>({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body: CreateTransactionRequest = await request.json();

    const validation = validateTransaction(body);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validation.error || 'Invalid transaction data'
      }, { status: 400 });
    }

    const { type, category, amount, description, date } = body;

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const newTransaction = {
      userId: user.id,
      type,
      category,
      amount,
      description,
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await transactionsCollection.insertOne(newTransaction);

    const transaction: Transaction = {
      _id: result.insertedId.toString(),
      userId: newTransaction.userId,
      type: newTransaction.type,
      category: newTransaction.category,
      amount: newTransaction.amount,
      description: newTransaction.description,
      date: newTransaction.date,
      createdAt: newTransaction.createdAt,
      updatedAt: newTransaction.updatedAt
    };

    return NextResponse.json<ApiResponse<Transaction>>({
      success: true,
      data: transaction
    }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}