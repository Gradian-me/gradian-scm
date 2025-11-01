// Notifications API Route
// Handles GET requests for notifications (without schema validation)

import { NextRequest, NextResponse } from 'next/server';
import { readSchemaData, writeAllData, readAllData } from '@/shared/domain/utils/data-storage.util';

/**
 * GET - Get all notifications with optional filters
 * Example: GET /api/notifications?search=test&type=info&category=quotation&isRead=false
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Read all notifications from data storage
    const notifications = readSchemaData('notifications');
    
    // Apply filters
    let filtered = [...notifications];
    
    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (n: any) =>
          n.title?.toLowerCase().includes(searchLower) ||
          n.message?.toLowerCase().includes(searchLower)
      );
    }
    
    const type = searchParams.get('type');
    if (type) {
      filtered = filtered.filter((n: any) => n.type === type);
    }
    
    const category = searchParams.get('category');
    if (category) {
      filtered = filtered.filter((n: any) => n.category === category);
    }
    
    const priority = searchParams.get('priority');
    if (priority) {
      filtered = filtered.filter((n: any) => n.priority === priority);
    }
    
    const isReadParam = searchParams.get('isRead');
    if (isReadParam !== null) {
      const isRead = isReadParam === 'true';
      filtered = filtered.filter((n: any) => n.isRead === isRead);
    }
    
    // Sort by createdAt (newest first)
    filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return NextResponse.json({
      success: true,
      data: filtered,
      message: `Retrieved ${filtered.length} notification(s)`,
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        data: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Read notifications data
    const notifications = readSchemaData('notifications');
    
    // Generate ID if not provided
    const id = body.id || String(Date.now()) + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create new notification
    const newNotification = {
      ...body,
      id,
      isRead: body.isRead ?? false,
      createdAt: body.createdAt || new Date().toISOString(),
    };
    
    // Add to array
    const updatedNotifications = [...notifications, newNotification];
    
    // Read all data
    const allData = readAllData();
    
    // Save back to file with updated notifications
    writeAllData({ ...allData, notifications: updatedNotifications });
    
    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'Notification created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification',
      },
      { status: 500 }
    );
  }
}

