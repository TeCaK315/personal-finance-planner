import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { Category, ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection<Category>('categories');

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.userId
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, color, icon } = body;

    if (!name && !color && !icon) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection<Category>('categories');

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.userId
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<Category> = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (color) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    await categoriesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedCategory = await categoriesCollection.findOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory as Category
    });

  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = db.collection<Category>('categories');
    const transactionsCollection = db.collection('transactions');

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.userId
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const transactionCount = await transactionsCollection.countDocuments({
      categoryId: id,
      userId: session.userId
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with existing transactions' },
        { status: 400 }
      );
    }

    await categoriesCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}