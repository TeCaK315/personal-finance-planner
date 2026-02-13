import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { calculateGoalProgress } from '@/lib/calculations';
import type { ApiResponse, FinancialGoal } from '@/types';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'completed' | 'cancelled' | null;
    const type = searchParams.get('type') as 'short-term' | 'long-term' | null;

    const db = await getDb();
    const goalsCollection = db.collection('goals');

    const filter: Record<string, unknown> = { userId: user._id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const docs = await goalsCollection.find(filter).sort({ createdAt: -1 }).toArray();

    const goals: FinancialGoal[] = docs.map((doc) => ({
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
    }));

    return NextResponse.json<ApiResponse<FinancialGoal[]>>(
      { success: true, data: goals },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { name, type, targetAmount, currentAmount, deadline, description } = body;

    if (!name || !type || !targetAmount || currentAmount === undefined || !deadline) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'short-term' && type !== 'long-term') {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid goal type' },
        { status: 400 }
      );
    }

    if (targetAmount <= 0 || currentAmount < 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid amounts' },
        { status: 400 }
      );
    }

    const progress = calculateGoalProgress(parseFloat(currentAmount), parseFloat(targetAmount));
    const status = progress >= 100 ? 'completed' : 'active';

    const db = await getDb();
    const goalsCollection = db.collection('goals');
    const now = new Date();

    const result = await goalsCollection.insertOne({
      userId: user._id,
      name,
      type,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline: new Date(deadline),
      description: description || '',
      progress,
      status,
      createdAt: now,
      updatedAt: now,
    });

    const goal: FinancialGoal = {
      _id: result.insertedId.toString(),
      userId: user._id,
      name,
      type,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline: new Date(deadline),
      description: description || '',
      progress,
      status,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json<ApiResponse<FinancialGoal>>(
      { success: true, data: goal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}