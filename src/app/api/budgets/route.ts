import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { budgetSchema } from '@/lib/validators';
import { ObjectId } from 'mongodb';
import type { Budget, ApiResponse, PaginatedResponse } from '@/types';

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
    const status = searchParams.get('status') as 'active' | 'completed' | 'exceeded' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const db = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');

    const query: Record<string, unknown> = { userId: session.userId };
    if (status) {
      query.status = status;
    }

    const total = await budgetsCollection.countDocuments(query);
    const budgetDocs = await budgetsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const budgets: Budget[] = budgetDocs.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      period: doc.period,
      startDate: doc.startDate,
      endDate: doc.endDate,
      categories: doc.categories,
      totalIncome: doc.totalIncome,
      totalExpenses: doc.totalExpenses,
      status: doc.status,
      healthScore: doc.healthScore,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json<PaginatedResponse<Budget>>(
      {
        success: true,
        data: budgets,
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
    console.error('Get budgets error:', error);
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
    
    const validation = budgetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, period, startDate, endDate, categories } = validation.data;

    const db = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');
    const categoriesCollection = db.collection('categories');

    const categoryIds = categories.map((c) => new ObjectId(c.categoryId));
    const categoryDocs = await categoriesCollection
      .find({ _id: { $in: categoryIds }, userId: session.userId })
      .toArray();

    if (categoryDocs.length !== categories.length) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'One or more categories not found' },
        { status: 404 }
      );
    }

    const totalIncome = categories
      .filter((c) => {
        const cat = categoryDocs.find((cd) => cd._id.toString() === c.categoryId);
        return cat?.type === 'income';
      })
      .reduce((sum, c) => sum + c.allocatedAmount, 0);

    const totalExpenses = categories
      .filter((c) => {
        const cat = categoryDocs.find((cd) => cd._id.toString() === c.categoryId);
        return cat?.type === 'expense';
      })
      .reduce((sum, c) => sum + c.allocatedAmount, 0);

    const budgetCategories = categories.map((c) => {
      const cat = categoryDocs.find((cd) => cd._id.toString() === c.categoryId);
      return {
        categoryId: c.categoryId,
        categoryName: cat?.name || '',
        allocatedAmount: c.allocatedAmount,
        spentAmount: 0,
        percentage: totalExpenses > 0 ? (c.allocatedAmount / totalExpenses) * 100 : 0,
      };
    });

    const result = await budgetsCollection.insertOne({
      userId: session.userId,
      name,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categories: budgetCategories,
      totalIncome,
      totalExpenses,
      status: 'active',
      healthScore: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const budget: Budget = {
      _id: result.insertedId.toString(),
      userId: session.userId,
      name,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categories: budgetCategories,
      totalIncome,
      totalExpenses,
      status: 'active',
      healthScore: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json<ApiResponse<Budget>>(
      { success: true, data: budget },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}