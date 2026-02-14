import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { generateSpendingReport } from '@/lib/report-generator';
import type { SpendingReport, ApiResponse } from '@/types';

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
    const { startDate, endDate, categoryIds, budgetId } = body;

    if (!startDate || !endDate) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const report = await generateSpendingReport(
      db,
      payload.userId,
      new Date(startDate),
      new Date(endDate),
      categoryIds,
      budgetId
    );

    return NextResponse.json<ApiResponse<SpendingReport>>(
      {
        success: true,
        data: report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate spending report error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}