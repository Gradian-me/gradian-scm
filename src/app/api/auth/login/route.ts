// POST /api/auth/login
// Authenticates user and returns JWT tokens

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/domains/auth';
import { AUTH_CONFIG } from '@/gradian-ui/shared/constants/application-variables';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await authenticateUser({ email, password });

    if (!result.success) {
      console.error('Authentication failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || AUTH_CONFIG.ERROR_MESSAGES.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    // Create response with user data and tokens
    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        tokens: result.tokens,
        message: result.message || 'Login successful',
      },
      { status: 200 }
    );

    // Set HTTP-only cookies for tokens (optional, for better security)
    if (result.tokens) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: result.tokens.expiresIn,
        path: '/',
      };

      response.cookies.set(AUTH_CONFIG.ACCESS_TOKEN_COOKIE, result.tokens.accessToken, cookieOptions);
      
      response.cookies.set(
        AUTH_CONFIG.REFRESH_TOKEN_COOKIE,
        result.tokens.refreshToken,
        {
          ...cookieOptions,
          maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY,
        }
      );
    }

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 500 }
    );
  }
}

