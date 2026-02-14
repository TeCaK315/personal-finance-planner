import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { Transaction, ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

interface BulkTransactionInput {
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  budgetId?: string;
  tags?: string[];
}

interface BulkImportResult {
  imported: number;
  failed: number;
  errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<BulkImportResult>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactions } = body as { transactions: BulkTransactionInput[] };

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid transactions array' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const transactionsCollection = db.collection<Transaction>('transactions');
    const categoriesCollection = db.collection('categories');

    const errors: string[] = [];
    const validTransactions: Omit<Transaction, '_id'>[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const txn = transactions[i];

      if (!txn.categoryId || !txn.type || !txn.amount || !txn.description || !txn.date) {
        errors.push(`Transaction ${i + 1}: Missing required fields`);
        continue;
      }

      if (txn.type !== 'income' && txn.type !== 'expense') {
        errors.push(`Transaction ${i + 1}: Invalid type (must be 'income' or 'expense')`);
        continue;
      }

      if (typeof txn.amount !== 'number' || txn.amount <= 0) {
        errors.push(`Transaction ${i + 1}: Invalid amount`);
        continue;
      }

      const categoryExists = await categoriesCollection.findOne({
        _id: new ObjectId(txn.categoryId),
        userId: session.userId
      });

      if (!categoryExists) {
        errors.push(`Transaction ${i + 1}: Category not found`);
        continue;
      }

      const transactionDate = new Date(txn.date);
      if (isNaN(transactionDate.getTime())) {
        errors.push(`Transaction ${i + 1}: Invalid date format`);
        continue;
      }

      const validTransaction: Omit<Transaction, '_id'> = {
        userId: session.userId,
        categoryId: txn.categoryId,
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        date: transactionDate,
        budgetId: txn.budgetId,
        tags: txn.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      validTransactions.push(validTransaction);
    }

    let imported = 0;
    if (validTransactions.length > 0) {
      const result = await transactionsCollection.insertMany(validTransactions);
      imported = result.insertedCount;

      for (const txn of validTransactions) {
        if (txn.budgetId) {
          const budgetsCollection = db.collection('budgets');
          const budget = await budgetsCollection.findOne({
            _id: new ObjectId(txn.budgetId),
            userId: session.userId
          });

          if (budget) {
            const categoryIndex = budget.categories.findIndex(
              (cat: { categoryId: string }) => cat.categoryId === txn.categoryId
            );

            if (categoryIndex !== -1) {
              const updateField = txn.type === 'expense' 
                ? `categories.${categoryIndex}.spentAmount`
                : 'totalIncome';

              await budgetsCollection.updateOne(
                { _id: new ObjectId(txn.budgetId) },
                { 
                  $inc: { [updateField]: txn.amount },
                  $set: { updatedAt: new Date() }
                }
              );
            }
          }
        }
      }
    }

    const result: BulkImportResult = {
      imported,
      failed: transactions.length - imported,
      errors: errors.length > 0 ? errors : undefined
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import transactions' },
      { status: 500 }
    );
  }
}