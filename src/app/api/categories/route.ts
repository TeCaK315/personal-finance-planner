import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { Category, ApiResponse } from '@/types';
import { categorySchema } from '@/lib/validators';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Category[]>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'income' | 'expense' | null;

    const db = await getDb();
    const categoriesCollection = db.collection<Category>('categories');

    const query: { userId: string; type?: 'income' | 'expense' } = {
      userId: session.userId
    };

    if (type && (type === 'income' || type === 'expense')) {
      query.type = type;
    }

    const categories = await categoriesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, type, color, icon } = validation.data;

    const db = await getDb();
    const categoriesCollection = db.collection<Omit<Category, '_id'>>('categories');

    const existingCategory = await categoriesCollection.findOne({
      userId: session.userId,
      name: name,
      type: type
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const newCategory: Omit<Category, '_id'> = {
      userId: session.userId,
      name,
      type,
      color,
      icon,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await categoriesCollection.insertOne(newCategory);
    
    const createdCategory = await categoriesCollection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      data: createdCategory as Category
    }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}