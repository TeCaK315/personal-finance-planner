import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import type { ApiResponse, Budget, CreateBudgetRequest } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const user = await getSession(sessionId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid session'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const db = await getDb();
    const budgetsCollection = db.collection('budgets');

    const budgetDoc = await budgetsCollection.findOne({
      userId: user.id,
      month
    });

    if (!budgetDoc) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: null
      });
    }

    const budget: Budget = {
      _id: budgetDoc._id.toString(),
      userId: budgetDoc.userId,
      month: budgetDoc.month,
      categoryLimits: budgetDoc.categoryLimits,
      createdAt: budgetDoc.createdAt,
      updatedAt: budgetDoc.updatedAt
    };

    return NextResponse.json<ApiResponse<Budget>>({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const user = await getSession(sessionId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid session'
      }, { status: 401 });
    }

    const body: CreateBudgetRequest = await request.json();
    const { month, categoryLimits } = body;

    if (!month || !categoryLimits || !Array.isArray(categoryLimits)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid budget data'
      }, { status: 400 });
    }

    const db = await getDb();
    const budgetsCollection = db.collection('budgets');

    const existingBudget = await budgetsCollection.findOne({
      userId: user.id,
      month
    });

    if (existingBudget) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Budget for this month already exists'
      }, { status: 409 });
    }

    const newBudget = {
      userId: user.id,
      month,
      categoryLimits,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await budgetsCollection.insertOne(newBudget);

    const budget: Budget = {
      _id: result.insertedId.toString(),
      userId: newBudget.userId,
      month: newBudget.month,
      categoryLimits: newBudget.categoryLimits,
      createdAt: newBudget.createdAt,
      updatedAt: newBudget.updatedAt
    };

    return NextResponse.json<ApiResponse<Budget>>({
      success: true,
      data: budget
    }, { status: 201 });
  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const user = await getSession(sessionId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid session'
      }, { status: 401 });
    }

    const body: CreateBudgetRequest = await request.json();
    const { month, categoryLimits } = body;

    if (!month || !categoryLimits || !Array.isArray(categoryLimits)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid budget data'
      }, { status: 400 });
    }

    const db = await getDb();
    const budgetsCollection = db.collection('budgets');

    const result = await budgetsCollection.findOneAndUpdate(
      { userId: user.id, month },
      {
        $set: {
          categoryLimits,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after', upsert: true }
    );

    if (!result) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to update budget'
      }, { status: 500 });
    }

    const budget: Budget = {
      _id: result._id.toString(),
      userId: result.userId,
      month: result.month,
      categoryLimits: result.categoryLimits,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };

    return NextResponse.json<ApiResponse<Budget>>({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}