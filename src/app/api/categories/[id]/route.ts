import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { categorySchema } from '@/lib/validators';
import type { Category, ApiResponse } from '@/types';

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
    const validation = categorySchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const categoriesCollection = db.collection<Category>('categories');

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (!category) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.isDefault) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Cannot update default category' },
        { status: 403 }
      );
    }

    const result = await categoriesCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id), userId: payload.userId },
      { $set: validation.data },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Category>>(
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
    console.error('Update category error:', error);
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
    const categoriesCollection = db.collection<Category>('categories');

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (!category) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.isDefault) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Cannot delete default category' },
        { status: 403 }
      );
    }

    const result = await categoriesCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: payload.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      {
        success: true,
        message: 'Category deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}