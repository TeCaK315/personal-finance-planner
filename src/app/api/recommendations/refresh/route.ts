import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { generateFinancialRecommendations } from '@/lib/openai';
import type { ApiResponse, AIRecommendation, Transaction, Budget, FinancialGoal } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AIRecommendation[]>>> {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const recommendationsCollection = db.collection<AIRecommendation>('recommendations');
    const transactionsCollection = db.collection<Transaction>('transactions');
    const budgetsCollection = db.collection<Budget>('budgets');
    const goalsCollection = db.collection<FinancialGoal>('goals');

    await recommendationsCollection.updateMany(
      { userId: session.id, dismissed: false },
      { $set: { dismissed: true } }
    );

    const currentMonth = new Date().toISOString().slice(0, 7);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [transactions, budget, goals] = await Promise.all([
      transactionsCollection
        .find({
          userId: session.id,
          date: { $gte: threeMonthsAgo },
        })
        .sort({ date: -1 })
        .limit(100)
        .toArray(),
      budgetsCollection.findOne({
        userId: session.id,
        month: currentMonth,
      }),
      goalsCollection
        .find({
          userId: session.id,
          status: 'active',
        })
        .toArray(),
    ]);

    const recommendations = await generateFinancialRecommendations({
      transactions,
      budget,
      goals,
      userId: session.id,
    });

    const recommendationsToInsert = recommendations.map((rec) => ({
      ...rec,
      userId: session.id,
      generatedAt: new Date(),
      dismissed: false,
    }));

    if (recommendationsToInsert.length > 0) {
      await recommendationsCollection.insertMany(recommendationsToInsert as any);
    }

    const insertedRecommendations = await recommendationsCollection
      .find({
        userId: session.id,
        dismissed: false,
      })
      .sort({ generatedAt: -1 })
      .toArray();

    const formattedRecommendations: AIRecommendation[] = insertedRecommendations.map((rec) => ({
      ...rec,
      _id: rec._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedRecommendations,
      message: 'Recommendations refreshed successfully',
    });
  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}