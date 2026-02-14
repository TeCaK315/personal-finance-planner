import { NextRequest, NextResponse } from 'next/server';
import { refreshToken } from '@/lib/jwt';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken: token } = body;

    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const result = await refreshToken(token);

    if (!result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse<{ accessToken: string; expiresIn: number }>>(
      {
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}