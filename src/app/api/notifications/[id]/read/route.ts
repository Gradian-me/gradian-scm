import { NextRequest, NextResponse } from 'next/server';
import { notificationDataAccess } from '@/lib/data-access';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Mark notification as read using data access
    const notification = await notificationDataAccess.markAsRead(id);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
