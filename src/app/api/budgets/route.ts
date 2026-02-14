import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { budgetSchema } from '@/lib/validators';
import type { Budget, ApiResponse, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const active = searchParams.get('active');

    const db = await connectToDatabase();
    const budgetsCollection = db.collection<Budget>('budgets');

    const query: Record<string, unknown> = { userId: payload.userId };
    
    if (active === 'true') {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const skip = (page - 1) * limit;
    const total = await budgetsCollection.countDocuments(query);
    const budgets = await budgetsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const budgetsWithStringId = budgets.map(budget => ({
      ...budget,
      _id: budget._id.toString(),
    }));

    return NextResponse.json<PaginatedResponse<Budget>>(
      {
        success: true,
        data: budgetsWithStringId,
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
    const validation = budgetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, totalAmount, startDate, endDate, categoryLimits } = validation.data;

    const db = await connectToDatabase();
    const budgetsCollection = db.collection<Budget>('budgets');
    const categoriesCollection = db.collection('categories');

    const categoryIds = categoryLimits.map(cl => new ObjectId(cl.categoryId));
    const categories = await categoriesCollection
      .find({ _id: { $in: categoryIds } })
      .toArray();

    const categoryMap = new Map(categories.map(cat => [cat._id.toString(), cat.name]));

    const enrichedCategoryLimits = categoryLimits.map(cl => ({
      categoryId: cl.categoryId,
      categoryName: categoryMap.get(cl.categoryId) || 'Unknown',
      limit: cl.limit,
      spent: 0,
    }));

    const newBudget: Omit<Budget, '_id'> = {
      userId: payload.userId,
      name,
      totalAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categoryLimits: enrichedCategoryLimits,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await budgetsCollection.insertOne(newBudget as Budget);
    const budgetId = result.insertedId.toString();

    return NextResponse.json<ApiResponse<Budget>>(
      {
        success: true,
        data: {
          ...newBudget,
          _id: budgetId,
        },
      },
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