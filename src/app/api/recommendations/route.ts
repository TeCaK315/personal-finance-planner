import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { generateRecommendations } from '@/lib/recommendation-engine';
import { FinancialRecommendation, ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<FinancialRecommendation[]>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { budgetId, forceRegenerate } = body;

    const db = await getDb();
    const recommendationsCollection = db.collection<FinancialRecommendation>('recommendations');

    if (!forceRegenerate) {
      const recentRecommendations = await recommendationsCollection
        .find({
          userId: session.userId,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
        .sort({ createdAt: -1 })
        .toArray();

      if (recentRecommendations.length > 0) {
        return NextResponse.json({
          success: true,
          data: recentRecommendations
        });
      }
    }

    const budgetsCollection = db.collection('budgets');
    const transactionsCollection = db.collection('transactions');
    const categoriesCollection = db.collection('categories');

    let budgetQuery: { userId: string; _id?: ObjectId } = { userId: session.userId };
    if (budgetId) {
      if (!ObjectId.isValid(budgetId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid budget ID' },
          { status: 400 }
        );
      }
      budgetQuery._id = new ObjectId(budgetId);
    }

    const budgets = await budgetsCollection.find(budgetQuery).toArray();
    
    const transactionQuery: { userId: string; budgetId?: string } = { userId: session.userId };
    if (budgetId) {
      transactionQuery.budgetId = budgetId;
    }

    const transactions = await transactionsCollection
      .find(transactionQuery)
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    const categories = await categoriesCollection
      .find({ userId: session.userId })
      .toArray();

    const recommendations = await generateRecommendations({
      userId: session.userId,
      budgets,
      transactions,
      categories
    });

    const recommendationsToInsert = recommendations.map(rec => ({
      ...rec,
      userId: session.userId,
      status: 'new' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    if (recommendationsToInsert.length > 0) {
      await recommendationsCollection.insertMany(recommendationsToInsert);
    }

    const savedRecommendations = await recommendationsCollection
      .find({
        userId: session.userId,
        createdAt: { $gte: new Date(Date.now() - 1000) }
      })
      .sort({ priority: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: savedRecommendations
    });

  } catch (error) {
    console.error('Generate recommendations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}