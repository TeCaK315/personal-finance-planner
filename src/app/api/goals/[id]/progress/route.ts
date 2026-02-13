import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { calculateGoalProgress } from '@/lib/calculations';
import type { ApiResponse, FinancialGoal } from '@/types';

export async function POST(
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
    const { amount } = body;

    if (amount === undefined || amount < 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

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

    const newCurrentAmount = parseFloat(amount);
    const progress = calculateGoalProgress(newCurrentAmount, existingGoal.targetAmount);
    const status = progress >= 100 ? 'completed' : existingGoal.status;

    const result = await goalsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id), userId: user._id },
      {
        $set: {
          currentAmount: newCurrentAmount,
          progress,
          status,
          updatedAt: new Date(),
        },
      },
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
    console.error('Update goal progress error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}