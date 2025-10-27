import { NextRequest, NextResponse } from 'next/server';
import { notificationDataAccess } from '@/lib/data-access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '2'; // Default to current user
    const isRead = searchParams.get('isRead');

    // Get all notifications for user
    let filteredNotifications = await notificationDataAccess.getAll(userId);

    if (isRead !== null) {
      const readStatus = isRead === 'true';
      filteredNotifications = filteredNotifications.filter((n: any) => n.isRead === readStatus);
    }

    // Sort by created date (newest first)
    filteredNotifications.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: filteredNotifications,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, actionUrl } = body;

    const newNotification = await notificationDataAccess.create({
      userId,
      title,
      message,
      type: type || 'info',
      isRead: false,
      actionUrl,
    });

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'Notification created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
