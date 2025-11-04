// Notifications API Route
// Handles GET requests for notifications (without schema validation)

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
 * GET - Get all notifications with optional filters
 * Example: GET /api/notifications?search=test&type=info&category=quotation&isRead=false
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Read all notifications from data storage
    const notifications = loadNotifications();
    
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
      // Handle both 'important' and legacy 'error' type
      if (type === 'important') {
        filtered = filtered.filter((n: any) => n.type === 'important' || n.type === 'error');
      } else {
        filtered = filtered.filter((n: any) => n.type === type);
      }
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
    
    // Filter by sourceType (createdByMe or assignedToMe)
    const sourceType = searchParams.get('sourceType');
    const currentUserId = searchParams.get('currentUserId');
    if (sourceType && currentUserId) {
      if (sourceType === 'createdByMe') {
        filtered = filtered.filter((n: any) => n.createdBy === currentUserId);
      } else if (sourceType === 'assignedToMe') {
        filtered = filtered.filter((n: any) => 
          n.assignedTo && Array.isArray(n.assignedTo) && 
          n.assignedTo.some((item: any) => item.userId === currentUserId)
        );
      }
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
    const notifications = loadNotifications();
    
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
    
    // Save notifications (will save to both all-data.json and notifications.json)
    try {
      // Save to all-data.json
      const allData = readAllData();
      writeAllData({ ...allData, notifications: updatedNotifications });
      
      // Also save to notifications.json for backup/consistency
      const notificationsPath = path.join(process.cwd(), 'data', 'notifications.json');
      fs.writeFileSync(notificationsPath, JSON.stringify(updatedNotifications, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving notifications:', error);
      throw error;
    }
    
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

