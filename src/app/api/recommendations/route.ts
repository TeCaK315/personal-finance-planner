import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { generateFinancialRecommendations } from '@/lib/openai';
import type { ApiResponse, AIRecommendation, Transaction, Budget, FinancialGoal, GenerateRecommendationsRequest } from '@/types';

export async function GET(
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

    const { searchParams } = new URL(request.url);
    const dismissedParam = searchParams.get('dismissed');

    const db = await getDb();
    const recommendationsCollection = db.collection<AIRecommendation>('recommendations');

    const query: any = { userId: session.id };
    if (dismissedParam !== null) {
      query.dismissed = dismissedParam === 'true';
    }

    const recommendations = await recommendationsCollection
      .find(query)
      .sort({ generatedAt: -1 })
      .limit(20)
      .toArray();

    const formattedRecommendations: AIRecommendation[] = recommendations.map((rec) => ({
      ...rec,
      _id: rec._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedRecommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const body: GenerateRecommendationsRequest = await request.json();
    const forceRefresh = body.forceRefresh || false;

    const db = await getDb();
    const recommendationsCollection = db.collection<AIRecommendation>('recommendations');

    if (!forceRefresh) {
      const recentRecommendations = await recommendationsCollection
        .find({
          userId: session.id,
          generatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        })
        .toArray();

      if (recentRecommendations.length > 0) {
        const formattedRecommendations: AIRecommendation[] = recentRecommendations.map((rec) => ({
          ...rec,
          _id: rec._id.toString(),
        }));

        return NextResponse.json({
          success: true,
          data: formattedRecommendations,
          message: 'Using cached recommendations',
        });
      }
    }

    const transactionsCollection = db.collection<Transaction>('transactions');
    const budgetsCollection = db.collection<Budget>('budgets');
    const goalsCollection = db.collection<FinancialGoal>('goals');

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

    const formattedRecommendations: AIRecommendation[] = recommendationsToInsert.map((rec, index) => ({
      ...rec,
      _id: new ObjectId().toString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedRecommendations,
      message: 'Recommendations generated successfully',
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}