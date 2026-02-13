import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { calculateGoalProgress } from '@/lib/calculations';
import type { ApiResponse, FinancialGoal } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const goalsCollection = db.collection('goals');

    const doc = await goalsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    });

    if (!doc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    const goal: FinancialGoal = {
      _id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      type: doc.type,
      targetAmount: doc.targetAmount,
      currentAmount: doc.currentAmount,
      deadline: doc.deadline,
      description: doc.description,
      progress: doc.progress,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return NextResponse.json<ApiResponse<FinancialGoal>>(
      { success: true, data: goal },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get goal error:', error);
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
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, targetAmount, currentAmount, deadline, description, status } = body;

    const db = await getDb();
    const goalsCollection = db.collection('goals');

    const existingGoal = await goalsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    });

    if (!existingGoal) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    const updateFields: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updateFields.name = name;
    if (type) {
      if (type !== 'short-term' && type !== 'long-term') {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Invalid goal type' },
          { status: 400 }
        );
      }
      updateFields.type = type;
    }
    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Target amount must be positive' },
          { status: 400 }
        );
      }
      updateFields.targetAmount = parseFloat(targetAmount);
    }
    if (currentAmount !== undefined) {
      if (currentAmount < 0) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Current amount cannot be negative' },
          { status: 400 }
        );
      }
      updateFields.currentAmount = parseFloat(currentAmount);
    }
    if (deadline) updateFields.deadline = new Date(deadline);
    if (description !== undefined) updateFields.description = description;
    if (status) {
      if (status !== 'active' && status !== 'completed' && status !== 'cancelled') {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateFields.status = status;
    }

    const finalTargetAmount = (updateFields.targetAmount as number) || existingGoal.targetAmount;
    const finalCurrentAmount = (updateFields.currentAmount as number) || existingGoal.currentAmount;
    const progress = calculateGoalProgress(finalCurrentAmount, finalTargetAmount);
    updateFields.progress = progress;

    if (!updateFields.status && progress >= 100) {
      updateFields.status = 'completed';
    }

    const result = await goalsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id), userId: user._id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    const goal: FinancialGoal = {
      _id: result._id.toString(),
      userId: result.userId,
      name: result.name,
      type: result.type,
      targetAmount: result.targetAmount,
      currentAmount: result.currentAmount,
      deadline: result.deadline,
      description: result.description,
      progress: result.progress,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return NextResponse.json<ApiResponse<FinancialGoal>>(
      { success: true, data: goal },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update goal error:', error);
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
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const goalsCollection = db.collection('goals');

    const result = await goalsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      { success: true, message: 'Goal deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}