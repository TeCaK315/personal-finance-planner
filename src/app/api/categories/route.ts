import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { categorySchema } from '@/lib/validators';
import type { Category, ApiResponse } from '@/types';

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
    const includeDefault = searchParams.get('includeDefault') !== 'false';

    const db = await connectToDatabase();
    const categoriesCollection = db.collection<Category>('categories');

    const query: Record<string, unknown> = includeDefault
      ? { $or: [{ userId: payload.userId }, { isDefault: true }] }
      : { userId: payload.userId };

    const categories = await categoriesCollection
      .find(query)
      .sort({ name: 1 })
      .toArray();

    const categoriesWithStringId = categories.map(category => ({
      ...category,
      _id: category._id.toString(),
    }));

    return NextResponse.json<ApiResponse<Category[]>>(
      {
        success: true,
        data: categoriesWithStringId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get categories error:', error);
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
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, icon, color } = validation.data;

    const db = await connectToDatabase();
    const categoriesCollection = db.collection<Category>('categories');

    const newCategory: Omit<Category, '_id'> = {
      userId: payload.userId,
      name,
      icon,
      color,
      isDefault: false,
      createdAt: new Date(),
    };

    const result = await categoriesCollection.insertOne(newCategory as Category);
    const categoryId = result.insertedId.toString();

    return NextResponse.json<ApiResponse<Category>>(
      {
        success: true,
        data: {
          ...newCategory,
          _id: categoryId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}