import { NextRequest, NextResponse } from 'next/server';

import {
  hashCode,
  markExpired,
  readTwoFAEntries,
  timingSafeMatch,
  writeTwoFAEntries,
} from '../../2fa/utils';
import { hashPassword } from '@/domains/auth/utils/password.util';
import { readSchemaData, writeSchemaData } from '@/gradian-ui/shared/domain/utils/data-storage.util';

type ResetPasswordRequestBody = {
  username?: string;
  code?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordRequestBody;
    const username = body.username?.trim();
    const code = body.code?.trim();
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        { success: false, error: '2FA code is required' },
        { status: 400 },
      );
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password and confirmation are required' },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 },
      );
    }

    const users = readSchemaData<any>('users');

    const user = users.find((entry: any) => {
      const normalizedUsername = username.toLowerCase();
      return (
        entry?.email?.toLowerCase?.() === normalizedUsername ||
        entry?.username?.toLowerCase?.() === normalizedUsername
      );
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unable to locate user with provided username' },
        { status: 404 },
      );
    }

    const now = Date.now();
    const entries = markExpired(await readTwoFAEntries(), now);
    const entryIndex = entries.findIndex((item) => item.userId === user.id);

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'No active 2FA code found for this user' },
        { status: 404 },
      );
    }

    const entry = entries[entryIndex];

    if (entry.isExpired || new Date(entry.expirationDate).getTime() <= now) {
      entries[entryIndex] = { ...entry, isExpired: true };
      await writeTwoFAEntries(entries);
      return NextResponse.json(
        { success: false, error: '2FA code has expired' },
        { status: 410 },
      );
    }

    const hashedInput = hashCode(code);
    if (!timingSafeMatch(entry.twoFACode, hashedInput)) {
      return NextResponse.json(
        { success: false, error: 'Invalid 2FA code' },
        { status: 400 },
      );
    }

    entries[entryIndex] = {
      ...entry,
      isExpired: true,
    };

    await writeTwoFAEntries(entries);

    const hashedPassword = await hashPassword(password, 'argon2');
    const userIndex = users.findIndex((item: any) => item.id === user.id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User record could not be updated' },
        { status: 500 },
      );
    }

    users[userIndex] = {
      ...users[userIndex],
      password: hashedPassword,
      hashType: 'argon2',
      updatedAt: new Date().toISOString(),
    };

    writeSchemaData('users', users);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('[Auth] Password reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      },
      { status: 500 },
    );
  }
}

