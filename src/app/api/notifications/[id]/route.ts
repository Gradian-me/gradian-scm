// Notifications API Route - Individual notification operations
// Handles GET, PUT, DELETE for a specific notification

import { NextRequest, NextResponse } from 'next/server';
import { readSchemaData, writeAllData, readAllData } from '@/shared/domain/utils/data-storage.util';

/**
 * GET - Get a specific notification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notifications = readSchemaData('notifications');
    const notification = notifications.find((n: any) => n.id === id);
    
    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: `Notification with ID ${id} not found`,
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notification',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a notification
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const notifications = readSchemaData('notifications');
    const index = notifications.findIndex((n: any) => n.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: `Notification with ID ${id} not found`,
        },
        { status: 404 }
      );
    }
    
    // Update the notification
    const updated = {
      ...notifications[index],
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    // If marking as unread, remove readAt
    if (body.isRead === false && 'readAt' in updated) {
      delete updated.readAt;
    }
    
    notifications[index] = updated;
    
    // Read all data and update notifications
    const allData = readAllData();
    
    // Save back to file with updated notifications
    writeAllData({ ...allData, notifications });
    
    return NextResponse.json({
      success: true,
      data: notifications[index],
      message: 'Notification updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notifications = readSchemaData('notifications');
    const filtered = notifications.filter((n: any) => n.id !== id);
    
    if (filtered.length === notifications.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Notification with ID ${id} not found`,
        },
        { status: 404 }
      );
    }
    
    // Read all data and update notifications
    const allData = readAllData();
    
    // Save updated notifications
    writeAllData({ ...allData, notifications: filtered });
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete notification',
      },
      { status: 500 }
    );
  }
}

