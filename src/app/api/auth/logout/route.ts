import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}