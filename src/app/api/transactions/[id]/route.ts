import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import type { ApiResponse, Transaction } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const doc = await transactionsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    });

    if (!doc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transaction: Transaction = {
      _id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transaction error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updateFields: Record<string, unknown> = { updatedAt: new Date() };
    if (type) {
      if (type !== 'income' && type !== 'expense') {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Invalid transaction type' },
          { status: 400 }
        );
      }
      updateFields.type = type;
    }
    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Amount must be positive' },
          { status: 400 }
        );
      }
      updateFields.amount = parseFloat(amount);
    }
    if (category) updateFields.category = category;
    if (description) updateFields.description = description;
    if (date) updateFields.date = new Date(date);

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const result = await transactionsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id), userId: user._id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transaction: Transaction = {
      _id: result._id.toString(),
      userId: result.userId,
      type: result.type,
      amount: result.amount,
      category: result.category,
      description: result.description,
      date: result.date,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    const result = await transactionsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      { success: true, message: 'Transaction deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}