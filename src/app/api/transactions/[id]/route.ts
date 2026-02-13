import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, Transaction, UpdateTransactionRequest, TransactionCategory, TransactionType } from '@/types';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const body: UpdateTransactionRequest = await request.json();
    const { amount, category, type, description, date } = body;

    if (amount !== undefined && amount <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (category && !Object.values(TransactionCategory).includes(category)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (type && !Object.values(TransactionType).includes(type)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid type' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const transactionsCollection = db.collection('transactions');

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
      userId: payload.userId
    });

    if (!existingTransaction) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (amount !== undefined) updateData.amount = amount;
    if (category) updateData.category = category;
    if (type) updateData.type = type;
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date);

    await transactionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedDoc = await transactionsCollection.findOne({ _id: new ObjectId(id) });

    const transaction: Transaction = {
      _id: updatedDoc!._id.toString(),
      userId: updatedDoc!.userId,
      amount: updatedDoc!.amount,
      category: updatedDoc!.category,
      type: updatedDoc!.type,
      description: updatedDoc!.description,
      date: updatedDoc!.date,
      createdAt: updatedDoc!.createdAt,
      updatedAt: updatedDoc!.updatedAt
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json<ApiResponse<null>>(
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

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const transactionsCollection = db.collection('transactions');

    const result = await transactionsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: payload.userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: 'Transaction deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}