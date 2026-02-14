import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { budgetSchema } from '@/lib/validators';
import type { Budget, ApiResponse } from '@/types';

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
    const budgetsCollection = db.collection<Budget>('budgets');

    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (!budget) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Budget>>(
      {
        success: true,
        data: {
          ...budget,
          _id: budget._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budget error:', error);
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
    const validation = budgetSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const budgetsCollection = db.collection<Budget>('budgets');

    const updateData: Record<string, unknown> = {
      ...validation.data,
      updatedAt: new Date(),
    };

    if (validation.data.startDate) {
      updateData.startDate = new Date(validation.data.startDate);
    }
    if (validation.data.endDate) {
      updateData.endDate = new Date(validation.data.endDate);
    }

    if (validation.data.categoryLimits) {
      const categoriesCollection = db.collection('categories');
      const categoryIds = validation.data.categoryLimits.map(cl => new ObjectId(cl.categoryId));
      const categories = await categoriesCollection
        .find({ _id: { $in: categoryIds } })
        .toArray();

      const categoryMap = new Map(categories.map(cat => [cat._id.toString(), cat.name]));

      updateData.categoryLimits = validation.data.categoryLimits.map(cl => ({
        categoryId: cl.categoryId,
        categoryName: categoryMap.get(cl.categoryId) || 'Unknown',
        limit: cl.limit,
        spent: 0,
      }));
    }

    const result = await budgetsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id), userId: payload.userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Budget>>(
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
    console.error('Update budget error:', error);
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
    const budgetsCollection = db.collection<Budget>('budgets');

    const result = await budgetsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      {
        success: true,
        message: 'Budget deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}