import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { analyzeSpendingPatterns } from '@/lib/ai-service';
import type { AIAnalysis, ApiResponse } from '@/types';

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
    const { startDate, endDate, budgetId } = body;

    if (!startDate || !endDate) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const analysis = await analyzeSpendingPatterns(
      db,
      payload.userId,
      new Date(startDate),
      new Date(endDate),
      budgetId
    );

    return NextResponse.json<ApiResponse<AIAnalysis>>(
      {
        success: true,
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}