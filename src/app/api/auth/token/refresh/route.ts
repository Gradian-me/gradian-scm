// POST /api/auth/token/refresh
// Refreshes an access token using a refresh token

import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken, extractTokenFromHeader, extractTokenFromCookies } from '@/domains/auth';
import { AUTH_CONFIG } from '@/shared/constants/application-variables';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    // Try to get refresh token from body, header, or cookies
    let tokenToUse = refreshToken;

    if (!tokenToUse) {
      // Try Authorization header
      const authHeader = request.headers.get('authorization');
      tokenToUse = extractTokenFromHeader(authHeader);
    }

    if (!tokenToUse) {
      // Try cookies
      const cookies = request.headers.get('cookie');
      tokenToUse = extractTokenFromCookies(cookies, AUTH_CONFIG.REFRESH_TOKEN_COOKIE);
    }

    if (!tokenToUse) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_CONFIG.ERROR_MESSAGES.MISSING_TOKEN,
        },
        { status: 400 }
      );
    }

    // Refresh access token
    const result = refreshAccessToken(tokenToUse);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || AUTH_CONFIG.ERROR_MESSAGES.INVALID_TOKEN,
        },
        { status: 401 }
      );
    }

    // Create response with new access token
    const response = NextResponse.json(
      {
        success: true,
        accessToken: result.accessToken,
        expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
        message: 'Token refreshed successfully',
      },
      { status: 200 }
    );

    // Update access token cookie
    if (result.accessToken) {
      response.cookies.set(
        AUTH_CONFIG.ACCESS_TOKEN_COOKIE,
        result.accessToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
          path: '/',
        }
      );
    }

    return response;
  } catch (error) {
    console.error('Token refresh API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      },
      { status: 500 }
    );
  }
}

