import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { validateBudget } from '@/lib/validators';
import { ObjectId } from 'mongodb';
import type { ApiResponse, Budget } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const active = searchParams.get('active');

    const { db } = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');

    const query: Record<string, unknown> = { userId: session.userId };

    if (period) {
      query.period = period;
    }

    if (active === 'true') {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const budgets = await budgetsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const budgetsData: Budget[] = budgets.map(budget => ({
      _id: budget._id.toString(),
      userId: budget.userId,
      name: budget.name,
      totalAmount: budget.totalAmount,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      categories: budget.categories,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: budgetsData,
      } as ApiResponse<Budget[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, totalAmount, period, startDate, endDate, categories } = body;

    const validation = validateBudget({
      name,
      totalAmount,
      period,
      startDate,
      endDate,
      categories,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');

    const categoriesWithSpent = categories.map((cat: { categoryId: string; categoryName: string; allocatedAmount: number }) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      allocatedAmount: cat.allocatedAmount,
      spentAmount: 0,
    }));

    const newBudget = {
      userId: session.userId,
      name,
      totalAmount,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categories: categoriesWithSpent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await budgetsCollection.insertOne(newBudget);

    const budgetData: Budget = {
      _id: result.insertedId.toString(),
      userId: newBudget.userId,
      name: newBudget.name,
      totalAmount: newBudget.totalAmount,
      period: newBudget.period,
      startDate: newBudget.startDate,
      endDate: newBudget.endDate,
      categories: newBudget.categories,
      createdAt: newBudget.createdAt,
      updatedAt: newBudget.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: budgetData,
      } as ApiResponse<Budget>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}