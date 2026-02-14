import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { generateFinancialRecommendations } from '@/lib/openai';
import { AIRecommendation, Budget, Transaction } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { budgetId, forceRegenerate } = body;

    const db = await getDb();

    if (!forceRegenerate) {
      const recentRecommendations = await db.collection<AIRecommendation>('recommendations')
        .find({
          userId: session.userId,
          generatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
        .sort({ generatedAt: -1 })
        .toArray();

      if (recentRecommendations.length > 0) {
        return NextResponse.json({
          success: true,
          data: recentRecommendations
        });
      }
    }

    const budgetFilter: any = { userId: session.userId };
    if (budgetId) {
      if (!ObjectId.isValid(budgetId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid budget ID' },
          { status: 400 }
        );
      }
      budgetFilter._id = new ObjectId(budgetId);
    }

    const budgets = await db.collection<Budget>('budgets')
      .find(budgetFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    if (budgets.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const budgetIds = budgets.map(b => b._id.toString());
    const transactions = await db.collection<Transaction>('transactions')
      .find({
        userId: session.userId,
        budgetId: { $in: budgetIds }
      })
      .sort({ date: -1 })
      .limit(200)
      .toArray();

    const userData = {
      budgets,
      transactions,
      userName: session.name
    };

    const aiRecommendations = await generateFinancialRecommendations(userData);

    const recommendationsToInsert: Omit<AIRecommendation, '_id'>[] = aiRecommendations.map(rec => ({
      userId: session.userId,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      category: rec.category,
      potentialSavings: rec.potentialSavings,
      actionItems: rec.actionItems,
      generatedAt: new Date(),
      isRead: false
    }));

    if (recommendationsToInsert.length > 0) {
      const result = await db.collection<AIRecommendation>('recommendations')
        .insertMany(recommendationsToInsert as AIRecommendation[]);

      const insertedRecommendations = await db.collection<AIRecommendation>('recommendations')
        .find({
          _id: { $in: Object.values(result.insertedIds) }
        })
        .toArray();

      return NextResponse.json({
        success: true,
        data: insertedRecommendations
      });
    }

    return NextResponse.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}