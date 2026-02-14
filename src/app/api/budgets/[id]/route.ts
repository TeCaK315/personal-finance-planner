import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { ApiResponse, Budget, CategoryAllocation } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { db } = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid budget ID' } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const budgetData: Budget = {
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
    };

    return NextResponse.json(
      {
        success: true,
        data: budgetData,
      } as ApiResponse<Budget>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, totalAmount, categories } = body;

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid budget ID' } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');

    const existingBudget = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!existingBudget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name;
    }

    if (totalAmount !== undefined) {
      if (typeof totalAmount !== 'number' || totalAmount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid total amount' } as ApiResponse<never>,
          { status: 400 }
        );
      }
      updateData.totalAmount = totalAmount;
    }

    if (categories !== undefined) {
      if (!Array.isArray(categories)) {
        return NextResponse.json(
          { success: false, error: 'Categories must be an array' } as ApiResponse<never>,
          { status: 400 }
        );
      }
      updateData.categories = categories;
    }

    await budgetsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    const updatedBudget = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
    });

    const budgetData: Budget = {
      _id: updatedBudget!._id.toString(),
      userId: updatedBudget!.userId,
      name: updatedBudget!.name,
      totalAmount: updatedBudget!.totalAmount,
      period: updatedBudget!.period,
      startDate: updatedBudget!.startDate,
      endDate: updatedBudget!.endDate,
      categories: updatedBudget!.categories,
      createdAt: updatedBudget!.createdAt,
      updatedAt: updatedBudget!.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: budgetData,
      } as ApiResponse<Budget>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Update budget error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid budget ID' } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');
    const transactionsCollection = db.collection('transactions');

    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' } as ApiResponse<never>,
        { status: 404 }
      );
    }

    await transactionsCollection.deleteMany({ budgetId: params.id });

    await budgetsCollection.deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json(
      {
        success: true,
        message: 'Budget deleted successfully',
      } as ApiResponse<never>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}