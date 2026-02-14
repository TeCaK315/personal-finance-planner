import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { validateTransaction } from '@/lib/validators';
import { Transaction, Budget } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type') as 'income' | 'expense' | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDb();
    
    const filter: any = { userId: session.userId };

    if (budgetId) {
      filter.budgetId = budgetId;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (type) {
      filter.type = type;
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

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      db.collection<Transaction>('transactions')
        .find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<Transaction>('transactions').countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
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
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateTransaction(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { budgetId, type, amount, categoryId, categoryName, description, date } = body;

    const db = await getDb();

    const budget = await db.collection<Budget>('budgets').findOne({
      _id: new ObjectId(budgetId),
      userId: session.userId
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const transactionDate = new Date(date);
    if (transactionDate < budget.startDate || transactionDate > budget.endDate) {
      return NextResponse.json(
        { success: false, error: 'Transaction date must be within budget period' },
        { status: 400 }
      );
    }

    const newTransaction: Omit<Transaction, '_id'> = {
      userId: session.userId,
      budgetId,
      type,
      amount,
      categoryId,
      categoryName,
      description,
      date: transactionDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection<Transaction>('transactions').insertOne(newTransaction as Transaction);

    if (type === 'expense') {
      await db.collection<Budget>('budgets').updateOne(
        {
          _id: new ObjectId(budgetId),
          'categories.categoryId': categoryId
        },
        {
          $inc: { 'categories.$.spentAmount': amount },
          $set: { updatedAt: new Date() }
        }
      );
    }

    const createdTransaction = await db.collection<Transaction>('transactions').findOne({
      _id: result.insertedId
    });

    return NextResponse.json({
      success: true,
      data: createdTransaction
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}