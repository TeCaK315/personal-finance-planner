import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { transactionSchema } from '@/lib/validators';
import type { Transaction, ApiResponse, BulkImportResult, BulkImportError } from '@/types';

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
    const { transactions } = body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transactions array is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const transactionsCollection = db.collection<Transaction>('transactions');

    const validTransactions: Omit<Transaction, '_id'>[] = [];
    const errors: BulkImportError[] = [];

    transactions.forEach((transaction, index) => {
      const validation = transactionSchema.safeParse(transaction);
      if (!validation.success) {
        errors.push({
          row: index + 1,
          field: validation.error.errors[0].path.join('.'),
          message: validation.error.errors[0].message,
        });
      } else {
        validTransactions.push({
          userId: payload.userId,
          budgetId: validation.data.budgetId,
          categoryId: validation.data.categoryId,
          amount: validation.data.amount,
          type: validation.data.type,
          description: validation.data.description,
          date: new Date(validation.data.date),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    let imported = 0;
    if (validTransactions.length > 0) {
      const result = await transactionsCollection.insertMany(validTransactions as Transaction[]);
      imported = result.insertedCount;
    }

    const bulkResult: BulkImportResult = {
      success: true,
      imported,
      failed: errors.length,
      errors,
    };

    return NextResponse.json<ApiResponse<BulkImportResult>>(
      {
        success: true,
        data: bulkResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}