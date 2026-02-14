import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { FinancialRecommendation, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<FinancialRecommendation>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'new' | 'viewed' | 'applied' | 'dismissed' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const recommendationsCollection = db.collection<FinancialRecommendation>('recommendations');

    const query: { userId: string; status?: string } = {
      userId: session.userId
    };

    if (status && ['new', 'viewed', 'applied', 'dismissed'].includes(status)) {
      query.status = status;
    }

    const total = await recommendationsCollection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const recommendations = await recommendationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: recommendations,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get recommendation history error:', error);
    return NextResponse.json(
      { 
        success: false, 
        data: [], 
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } 
      },
      { status: 500 }
    );
  }
}