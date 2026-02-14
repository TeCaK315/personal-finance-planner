import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { transactionSchema } from '@/lib/validators';
import { ObjectId } from 'mongodb';
import type { Transaction, ApiResponse, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');

    const query: Record<string, unknown> = { userId: session.userId };
    
    if (budgetId) {
      query.budgetId = budgetId;
    }
    
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.date as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    const total = await transactionsCollection.countDocuments(query);
    const transactionDocs = await transactionsCollection
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const transactions: Transaction[] = transactionDocs.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      budgetId: doc.budgetId,
      categoryId: doc.categoryId,
      type: doc.type,
      amount: doc.amount,
      description: doc.description,
      date: doc.date,
      recurring: doc.recurring,
      recurringFrequency: doc.recurringFrequency,
      tags: doc.tags,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json<PaginatedResponse<Transaction>>(
      {
        success: true,
        data: transactions,
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
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
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

    const {
      budgetId,
      categoryId,
      type,
      amount,
      description,
      date,
      recurring,
      recurringFrequency,
      tags,
    } = validation.data;

    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const categoriesCollection = db.collection('categories');
    const budgetsCollection = db.collection('budgets');

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
      userId: session.userId,
    });

    if (!category) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (budgetId) {
      const budget = await budgetsCollection.findOne({
        _id: new ObjectId(budgetId),
        userId: session.userId,
      });

      if (!budget) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Budget not found' },
          { status: 404 }
        );
      }
    }

    const result = await transactionsCollection.insertOne({
      userId: session.userId,
      budgetId: budgetId || null,
      categoryId,
      type,
      amount,
      description,
      date: new Date(date),
      recurring: recurring || false,
      recurringFrequency: recurringFrequency || null,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (budgetId) {
      const budgetCategory = await budgetsCollection.findOne(
        {
          _id: new ObjectId(budgetId),
          'categories.categoryId': categoryId,
        },
        { projection: { 'categories.$': 1 } }
      );

      if (budgetCategory && budgetCategory.categories && budgetCategory.categories[0]) {
        const currentSpent = budgetCategory.categories[0].spentAmount || 0;
        const newSpent = type === 'expense' ? currentSpent + amount : currentSpent;

        await budgetsCollection.updateOne(
          {
            _id: new ObjectId(budgetId),
            'categories.categoryId': categoryId,
          },
          {
            $set: {
              'categories.$.spentAmount': newSpent,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    const transaction: Transaction = {
      _id: result.insertedId.toString(),
      userId: session.userId,
      budgetId: budgetId || undefined,
      categoryId,
      type,
      amount,
      description,
      date: new Date(date),
      recurring: recurring || false,
      recurringFrequency: recurringFrequency || undefined,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
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