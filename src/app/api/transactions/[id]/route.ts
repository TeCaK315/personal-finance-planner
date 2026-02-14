import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { transactionSchema } from '@/lib/validators';
import type { Transaction, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const db = await connectToDatabase();
    const transactionsCollection = db.collection<Transaction>('transactions');

    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (!transaction) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Transaction>>(
      {
        success: true,
        data: {
          ...transaction,
          _id: transaction._id.toString(),
        },
      },
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
    const validation = transactionSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const transactionsCollection = db.collection<Transaction>('transactions');

    const updateData: Record<string, unknown> = {
      ...validation.data,
      updatedAt: new Date(),
    };

    if (validation.data.date) {
      updateData.date = new Date(validation.data.date);
    }

    const result = await transactionsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id), userId: payload.userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Transaction>>(
      {
        success: true,
        data: {
          ...result,
          _id: result._id.toString(),
        },
      },
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

    const db = await connectToDatabase();
    const transactionsCollection = db.collection<Transaction>('transactions');

    const result = await transactionsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      {
        success: true,
        message: 'Transaction deleted successfully',
      },
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