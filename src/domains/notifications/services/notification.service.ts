import { Notification, NotificationFilters, NotificationGroup } from '../types';
import { apiRequest } from '@/shared/utils/api';

// Transform raw notification data to Notification type
function transformNotificationData(notification: any): Notification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as 'success' | 'info' | 'warning' | 'error',
    category: notification.category as 'quotation' | 'purchase_order' | 'shipment' | 'vendor' | 'tender' | 'system',
    priority: notification.priority as 'low' | 'medium' | 'high' | 'urgent',
    isRead: notification.isRead,
    createdAt: new Date(notification.createdAt),
    readAt: notification.readAt ? new Date(notification.readAt) : undefined,
    actionUrl: notification.actionUrl,
    metadata: notification.metadata
  };
}

// Get notifications from API
async function getNotificationsFromAPI(filters?: NotificationFilters): Promise<Notification[]> {
  try {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.type) params.type = filters.type;
    if (filters?.category) params.category = filters.category;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.isRead !== undefined) params.isRead = filters.isRead.toString();

    const response = await apiRequest<any[]>(
      '/api/notifications',
      {
        method: 'GET',
        params
      }
    );

    if (!response.success || !response.data) {
      return [];
    }

    return response.data.map(transformNotificationData);
  } catch (error) {
    console.error('Error fetching notifications from API:', error);
    return [];
  }
}

export class NotificationService {
  static async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    // Fetch from API (handles filtering on server side)
    const notifications = await getNotificationsFromAPI(filters);
    
    // Additional client-side filtering if needed
    let filtered = [...notifications];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        n => n.title.toLowerCase().includes(searchLower) || 
             n.message.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getGroupedNotifications(filters: NotificationFilters = {}): Promise<NotificationGroup[]> {
    const notifications = await this.getNotifications(filters);
    const groups: Record<string, Notification[]> = {};

    notifications.forEach(notification => {
      if (!groups[notification.category]) {
        groups[notification.category] = [];
      }
      groups[notification.category].push(notification);
    });

    return Object.entries(groups).map(([category, notifications]) => ({
      category,
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    }));
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await apiRequest(
        `/api/notifications/${notificationId}`,
        {
          method: 'PUT',
          body: { isRead: true, readAt: new Date().toISOString() }
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to mark notification as read');
    }
  }

  static async markAsUnread(notificationId: string): Promise<void> {
    try {
      const response = await apiRequest(
        `/api/notifications/${notificationId}`,
        {
          method: 'PUT',
          body: { isRead: false }
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to mark notification as unread');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to mark notification as unread');
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      // Get all unread notifications first
      const notifications = await getNotificationsFromAPI({ isRead: false });
      
      // Update each notification
      await Promise.all(
        notifications.map(n => 
          apiRequest(`/api/notifications/${n.id}`, {
            method: 'PUT',
            body: { isRead: true, readAt: new Date().toISOString() }
          })
        )
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to mark all notifications as read');
    }
  }

  static async getUnreadCount(): Promise<number> {
    const notifications = await getNotificationsFromAPI({ isRead: false });
    return notifications.length;
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    try {
      const response = await apiRequest<any>(
        '/api/notifications',
        {
          method: 'POST',
          body: notification
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create notification');
      }

      return transformNotificationData(response.data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create notification');
    }
  }

  static async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    try {
      const response = await apiRequest<any>(
        `/api/notifications/${id}`,
        {
          method: 'PUT',
          body: updates
        }
      );

      if (!response.success || !response.data) {
        return null;
      }

      return transformNotificationData(response.data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update notification');
    }
  }

  static async deleteNotification(id: string): Promise<boolean> {
    try {
      const response = await apiRequest(
        `/api/notifications/${id}`,
        {
          method: 'DELETE'
        }
      );

      return response.success;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete notification');
    }
  }

  static getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      quotation: 'Quotations',
      purchase_order: 'Purchase Orders',
      shipment: 'Shipments',
      vendor: 'Vendors',
      tender: 'Tenders',
      system: 'System'
    };
    return labels[category] || category;
  }

  static getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      success: 'Success',
      info: 'Information',
      warning: 'Warning',
      error: 'Error'
    };
    return labels[type] || type;
  }

  static getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    };
    return labels[priority] || priority;
  }
}
