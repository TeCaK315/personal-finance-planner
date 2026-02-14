import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    if (sessionId) {
      await destroySession(sessionId);
    }

    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during logout'
    }, { status: 500 });
  }
}