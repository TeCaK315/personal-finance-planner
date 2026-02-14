import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await destroySession();

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      } as ApiResponse<never>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}