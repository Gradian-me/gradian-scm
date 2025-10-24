import { NextRequest, NextResponse } from 'next/server';
import { notificationDataAccess } from '@/lib/data-access';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificationIndex = mockNotifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark as read
    mockNotifications[notificationIndex].isRead = true;

    return NextResponse.json({
      success: true,
      data: mockNotifications[notificationIndex],
      message: 'Notification marked as read',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
