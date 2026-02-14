import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { validateGoal } from '@/lib/validators';
import type { ApiResponse, FinancialGoal, CreateGoalRequest } from '@/types';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<FinancialGoal[]>>> {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'completed' | 'cancelled' | null;

    const db = await getDb();
    const goalsCollection = db.collection<FinancialGoal>('goals');

    const query: any = { userId: session.id };
    if (status) {
      query.status = status;
    }

    const goals = await goalsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formattedGoals: FinancialGoal[] = goals.map((goal) => ({
      ...goal,
      _id: goal._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedGoals,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<FinancialGoal>>> {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateGoalRequest = await request.json();

    const validation = validateGoal(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const db = await getDb();
    const goalsCollection = db.collection<FinancialGoal>('goals');

    const newGoal = {
      userId: session.id,
      title: body.title,
      description: body.description,
      targetAmount: body.targetAmount,
      currentAmount: body.currentAmount,
      deadline: new Date(body.deadline),
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await goalsCollection.insertOne(newGoal as any);

    const createdGoal: FinancialGoal = {
      ...newGoal,
      _id: result.insertedId.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: createdGoal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}