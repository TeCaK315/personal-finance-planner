import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { generateFinancialRecommendations } from '@/lib/ai-service';
import type { AIRecommendation, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { budgetId, forceRegenerate } = body;

    const db = await connectToDatabase();
    const recommendationsCollection = db.collection<AIRecommendation>('recommendations');

    if (!forceRegenerate) {
      const existingRecommendations = await recommendationsCollection
        .find({
          userId: payload.userId,
          isDismissed: false,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        })
        .sort({ priority: 1, createdAt: -1 })
        .toArray();

      if (existingRecommendations.length > 0) {
        const recommendationsWithStringId = existingRecommendations.map(rec => ({
          ...rec,
          _id: rec._id.toString(),
        }));

        return NextResponse.json<ApiResponse<AIRecommendation[]>>(
          {
            success: true,
            data: recommendationsWithStringId,
          },
          { status: 200 }
        );
      }
    }

    const recommendations = await generateFinancialRecommendations(
      db,
      payload.userId,
      budgetId
    );

    const newRecommendations = recommendations.map(rec => ({
      ...rec,
      userId: payload.userId,
      createdAt: new Date(),
      isRead: false,
      isDismissed: false,
    }));

    if (newRecommendations.length > 0) {
      await recommendationsCollection.insertMany(newRecommendations as AIRecommendation[]);
    }

    return NextResponse.json<ApiResponse<AIRecommendation[]>>(
      {
        success: true,
        data: newRecommendations,
      },
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