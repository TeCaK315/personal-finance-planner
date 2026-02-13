import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { generatePersonalizedRecommendations } from '@/lib/recommendation-engine';
import { ApiResponse, Recommendation, GenerateRecommendationsRequest } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const recommendationsCollection = db.collection('recommendations');

    const recommendationDocs = await recommendationsCollection
      .find({ userId: payload.userId })
      .sort({ priority: -1, createdAt: -1 })
      .toArray();

    const recommendations: Recommendation[] = recommendationDocs.map(doc => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      title: doc.title,
      description: doc.description,
      priority: doc.priority,
      actionable: doc.actionable,
      estimatedImpact: doc.estimatedImpact,
      createdAt: doc.createdAt
    }));

    return NextResponse.json<ApiResponse<Recommendation[]>>(
      { success: true, data: recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body: GenerateRecommendationsRequest = await request.json();
    const { forceRegenerate = false } = body;

    const db = await getDatabase();
    const recommendationsCollection = db.collection('recommendations');
    const transactionsCollection = db.collection('transactions');

    const existingRecommendations = await recommendationsCollection
      .find({ userId: payload.userId })
      .toArray();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const hasRecentRecommendations = existingRecommendations.some(
      rec => new Date(rec.createdAt) > oneWeekAgo
    );

    if (hasRecentRecommendations && !forceRegenerate) {
      const recommendations: Recommendation[] = existingRecommendations.map(doc => ({
        _id: doc._id.toString(),
        userId: doc.userId,
        type: doc.type,
        title: doc.title,
        description: doc.description,
        priority: doc.priority,
        actionable: doc.actionable,
        estimatedImpact: doc.estimatedImpact,
        createdAt: doc.createdAt
      }));

      return NextResponse.json<ApiResponse<Recommendation[]>>(
        { success: true, data: recommendations, message: 'Using existing recommendations' },
        { status: 200 }
      );
    }

    const transactions = await transactionsCollection
      .find({ userId: payload.userId })
      .toArray();

    const mappedTransactions = transactions.map(doc => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      amount: doc.amount,
      category: doc.category,
      type: doc.type,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));

    const newRecommendations = await generatePersonalizedRecommendations(
      payload.userId,
      mappedTransactions
    );

    await recommendationsCollection.deleteMany({ userId: payload.userId });

    const now = new Date();
    const recommendationsToInsert = newRecommendations.map(rec => ({
      ...rec,
      createdAt: now
    }));

    const result = await recommendationsCollection.insertMany(recommendationsToInsert);

    const insertedRecommendations: Recommendation[] = newRecommendations.map((rec, index) => ({
      _id: Object.values(result.insertedIds)[index].toString(),
      ...rec,
      createdAt: now
    }));

    return NextResponse.json<ApiResponse<Recommendation[]>>(
      { success: true, data: insertedRecommendations, message: 'Recommendations generated successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Generate recommendations error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}