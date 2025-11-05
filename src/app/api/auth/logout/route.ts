// POST /api/auth/logout
// Logs out user by clearing tokens

import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/shared/constants/application-variables';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );

    // Clear tokens from cookies
    response.cookies.delete(AUTH_CONFIG.ACCESS_TOKEN_COOKIE);
    response.cookies.delete(AUTH_CONFIG.REFRESH_TOKEN_COOKIE);

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      },
      { status: 500 }
    );
  }
}

