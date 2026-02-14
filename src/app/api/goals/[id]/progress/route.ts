import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { calculateGoalProgress } from '@/lib/calculations';
import type { ApiResponse, FinancialGoal, GoalProgress, UpdateGoalProgressRequest } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ goal: FinancialGoal; progress: GoalProgress }>>> {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid goal ID' },
        { status: 400 }
      );
    }

    const body: UpdateGoalProgressRequest = await request.json();

    if (typeof body.amount !== 'number' || body.amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const goalsCollection = db.collection<FinancialGoal>('goals');

    const existingGoal = await goalsCollection.findOne({
      _id: new ObjectId(id),
      userId: session.id,
    });

    if (!existingGoal) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    const newCurrentAmount = existingGoal.currentAmount + body.amount;
    const newStatus = newCurrentAmount >= existingGoal.targetAmount ? 'completed' : existingGoal.status;

    const result = await goalsCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.id },
      {
        $set: {
          currentAmount: newCurrentAmount,
          status: newStatus,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to update goal progress' },
        { status: 500 }
      );
    }

    const updatedGoal: FinancialGoal = {
      ...result,
      _id: result._id.toString(),
    };

    const progress = calculateGoalProgress(updatedGoal);

    return NextResponse.json({
      success: true,
      data: {
        goal: updatedGoal,
        progress,
      },
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}