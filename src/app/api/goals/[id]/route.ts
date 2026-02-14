import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { validateGoal } from '@/lib/validators';
import type { ApiResponse, FinancialGoal, UpdateGoalRequest } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<FinancialGoal>>> {
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

    const body: UpdateGoalRequest = await request.json();

    const validation = validateGoal(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
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

    const updateData: Partial<FinancialGoal> = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.deadline) {
      updateData.deadline = new Date(body.deadline);
    }

    const result = await goalsCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to update goal' },
        { status: 500 }
      );
    }

    const updatedGoal: FinancialGoal = {
      ...result,
      _id: result._id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedGoal,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
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

    const db = await getDb();
    const goalsCollection = db.collection('goals');

    const result = await goalsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: session.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}