import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import type { ApiResponse, SessionUser } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No session found'
      }, { status: 401 });
    }

    const user = await getSession(sessionId);

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid or expired session'
      }, { status: 401 });
    }

    return NextResponse.json<ApiResponse<{ user: SessionUser }>>({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}