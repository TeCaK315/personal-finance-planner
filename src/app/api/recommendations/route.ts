import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { generateFinancialRecommendations } from '@/lib/openai';
import type { ApiResponse, AIRecommendation, Transaction, FinancialGoal } from '@/types';

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
    const { includeTransactions, includeGoals, timeframe } = body;

    if (includeTransactions === undefined || includeGoals === undefined || !timeframe) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validTimeframes = ['week', 'month', 'quarter', 'year'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid timeframe' },
        { status: 400 }
      );
    }

    const db = await getDb();
    let transactions: Transaction[] = [];
    let goals: FinancialGoal[] = [];

    if (includeTransactions) {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const transactionsCollection = db.collection('transactions');
      const transactionDocs = await transactionsCollection
        .find({
          userId: user._id,
          date: { $gte: startDate },
        })
        .sort({ date: -1 })
        .toArray();

      transactions = transactionDocs.map((doc) => ({
        _id: doc._id.toString(),
        userId: doc.userId,
        type: doc.type,
        amount: doc.amount,
        category: doc.category,
        description: doc.description,
        date: doc.date,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    }

    if (includeGoals) {
      const goalsCollection = db.collection('goals');
      const goalDocs = await goalsCollection
        .find({ userId: user._id, status: 'active' })
        .toArray();

      goals = goalDocs.map((doc) => ({
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
    }

    const recommendations = await generateFinancialRecommendations(
      transactions,
      goals,
      timeframe
    );

    const recommendationsCollection = db.collection('recommendations');
    const now = new Date();

    const recommendationDocs = recommendations.map((rec) => ({
      userId: user._id,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      priority: rec.priority,
      actionItems: rec.actionItems,
      impact: rec.impact,
      generatedAt: now,
      isRead: false,
    }));

    if (recommendationDocs.length > 0) {
      await recommendationsCollection.insertMany(recommendationDocs);
    }

    const savedRecommendations: AIRecommendation[] = recommendationDocs.map((doc, index) => ({
      _id: recommendations[index]._id,
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      priority: doc.priority,
      actionItems: doc.actionItems,
      impact: doc.impact,
      generatedAt: doc.generatedAt,
      isRead: doc.isRead,
    }));

    return NextResponse.json<ApiResponse<AIRecommendation[]>>(
      { success: true, data: savedRecommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate recommendations error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}