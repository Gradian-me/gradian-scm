// Notifications API Route - Individual notification operations
// Handles GET, PUT, DELETE for a specific notification

import { NextRequest, NextResponse } from 'next/server';
import { readSchemaData, writeAllData, readAllData } from '@/shared/domain/utils/data-storage.util';
import fs from 'fs';
import path from 'path';

/**
 * Load notifications from file - checks both all-data.json and notifications.json
 */
function loadNotifications(): any[] {
  // First try to read from all-data.json
  try {
    const notifications = readSchemaData('notifications');
    if (notifications && notifications.length > 0) {
      return notifications;
    }
  } catch (error) {
    // Ignore error and try alternative file
  }
  
  // Fallback: read from notifications.json file
  try {
    const notificationsPath = path.join(process.cwd(), 'data', 'notifications.json');
    if (fs.existsSync(notificationsPath)) {
      const fileContents = fs.readFileSync(notificationsPath, 'utf-8');
      const notifications = JSON.parse(fileContents);
      return Array.isArray(notifications) ? notifications : [];
    }
  } catch (error) {
    console.error('Error reading notifications.json:', error);
  }
  
  return [];
}

/**
 * Save notifications - writes to both all-data.json and notifications.json
 */
function saveNotifications(notifications: any[]): void {
  try {
    // Save to all-data.json
    const allData = readAllData();
    writeAllData({ ...allData, notifications });
    
    // Also save to notifications.json for backup/consistency
    const notificationsPath = path.join(process.cwd(), 'data', 'notifications.json');
    fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving notifications:', error);
    throw error;
  }
}

/**
 * GET - Get a specific notification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notifications = loadNotifications();
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
    
    const notifications = loadNotifications();
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
    
    // If marking as unread, remove interactedAt (only for canRead type)
    if (body.isRead === false && updated.interactionType !== 'needsAcknowledgement') {
      delete updated.interactedAt;
      // Also remove legacy readAt if present
      if ('readAt' in updated) {
        delete updated.readAt;
      }
    }
    
    // Migrate readAt to interactedAt if needed (backward compatibility)
    if ('readAt' in updated && !updated.interactedAt) {
      updated.interactedAt = updated.readAt;
      delete updated.readAt;
    }
    
    // Ensure interactionType defaults to canRead
    if (!updated.interactionType) {
      updated.interactionType = 'canRead';
    }
    
    notifications[index] = updated;
    
    // Save updated notifications
    saveNotifications(notifications);
    
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
    const notifications = loadNotifications();
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
    
    // Save updated notifications
    saveNotifications(filtered);
    
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

