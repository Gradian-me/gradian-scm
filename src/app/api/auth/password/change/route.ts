// POST /api/auth/password/change
// Change user password - requires current password verification

import { NextRequest, NextResponse } from 'next/server';
import { validateToken, extractTokenFromHeader, extractTokenFromCookies } from '@/domains/auth';
import { AUTH_CONFIG } from '@/shared/constants/application-variables';
import { verifyPassword, hashPassword, detectHashType } from '@/domains/auth/utils/password.util';
import { readSchemaData, writeSchemaData } from '@/shared/domain/utils/data-storage.util';

/**
 * Extract userId from JWT token in request
 */
function getUserIdFromToken(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  let token = extractTokenFromHeader(authHeader);

  if (!token) {
    // Try cookies
    const cookies = request.headers.get('cookie');
    token = extractTokenFromCookies(cookies, AUTH_CONFIG.ACCESS_TOKEN_COOKIE);
  }

  if (!token) {
    return null;
  }

  try {
    const result = validateToken(token);
    if (result.valid && result.payload?.userId) {
      return result.payload.userId;
    }
  } catch (error) {
    console.error('Error extracting userId from token:', error);
  }

  return null;
}

/**
 * POST - Change user password
 */
export async function POST(request: NextRequest) {
  try {
    // Get userId from JWT token
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please log in.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // Load user data
    const users = readSchemaData<any>('users');
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Verify current password
    const storedPassword = user.password || '';
    const hashType = user.hashType || detectHashType(storedPassword);
    
    const isValidPassword = await verifyPassword(currentPassword, storedPassword, hashType);
    
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword, 'argon2');

    // Update user password
    const userIndex = users.findIndex((u: any) => u.id === userId);
    users[userIndex] = {
      ...users[userIndex],
      password: hashedNewPassword,
      hashType: 'argon2',
      updatedAt: new Date().toISOString(),
    };

    writeSchemaData('users', users);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Password change API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      },
      { status: 500 }
    );
  }
}

