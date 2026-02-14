import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { Category } from '@/types';

const DEFAULT_CATEGORIES: Omit<Category, '_id'>[] = [
  { name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#10b981', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#3b82f6', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#8b5cf6', isDefault: true },
  { name: 'Utilities', type: 'expense', icon: 'Zap', color: '#f59e0b', isDefault: true },
  { name: 'Healthcare', type: 'expense', icon: 'Heart', color: '#ef4444', isDefault: true },
  { name: 'Dining Out', type: 'expense', icon: 'Coffee', color: '#ec4899', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#06b6d4', isDefault: true },
  { name: 'Housing', type: 'expense', icon: 'Home', color: '#84cc16', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'BookOpen', color: '#6366f1', isDefault: true },
  { name: 'Insurance', type: 'expense', icon: 'Shield', color: '#14b8a6', isDefault: true },
  { name: 'Salary', type: 'income', icon: 'DollarSign', color: '#22c55e', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'Briefcase', color: '#3b82f6', isDefault: true },
  { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#8b5cf6', isDefault: true },
  { name: 'Gift', type: 'income', icon: 'Gift', color: '#ec4899', isDefault: true },
  { name: 'Other Income', type: 'income', icon: 'Plus', color: '#06b6d4', isDefault: true }
];

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
    const type = searchParams.get('type') as 'income' | 'expense' | null;

    const db = await getDb();

    await db.collection<Category>('categories').createIndex({ isDefault: 1, userId: 1 });

    const existingDefaults = await db.collection<Category>('categories')
      .countDocuments({ isDefault: true });

    if (existingDefaults === 0) {
      await db.collection<Category>('categories').insertMany(DEFAULT_CATEGORIES as Category[]);
    }

    const filter: any = {
      $or: [
        { isDefault: true },
        { userId: session.userId }
      ]
    };

    if (type) {
      filter.type = type;
    }

    const categories = await db.collection<Category>('categories')
      .find(filter)
      .sort({ isDefault: -1, name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
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
    const { name, type, icon, color } = body;

    if (!name || !type || !icon || !color) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { success: false, error: 'Type must be income or expense' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const existingCategory = await db.collection<Category>('categories').findOne({
      name: name.trim(),
      userId: session.userId
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const newCategory: Omit<Category, '_id'> = {
      name: name.trim(),
      type,
      icon,
      color,
      isDefault: false,
      userId: session.userId
    };

    const result = await db.collection<Category>('categories').insertOne(newCategory as Category);

    const createdCategory = await db.collection<Category>('categories').findOne({
      _id: result.insertedId
    });

    return NextResponse.json({
      success: true,
      data: createdCategory
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}