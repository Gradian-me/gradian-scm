import { Notification, NotificationFilters, NotificationGroup } from '../types';
import { apiRequest } from '@/shared/utils/api';

// Transform raw notification data to Notification type
function transformNotificationData(notification: any): Notification {
  // Support both readAt (legacy) and interactedAt, prefer interactedAt
  const interactedAt = notification.interactedAt || notification.readAt;
  
  // Transform assignedTo array
  const assignedTo = notification.assignedTo?.map((item: any) => ({
    userId: item.userId,
    interactedAt: item.interactedAt ? new Date(item.interactedAt) : undefined,
    comment: item.comment
  }));
  
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: (notification.type === 'error' ? 'important' : notification.type) as 'success' | 'info' | 'warning' | 'important',
    category: notification.category as 'quotation' | 'purchase_order' | 'shipment' | 'vendor' | 'tender' | 'system',
    priority: notification.priority as 'low' | 'medium' | 'high' | 'urgent',
    isRead: notification.isRead,
    createdAt: new Date(notification.createdAt),
    interactedAt: interactedAt ? new Date(interactedAt) : undefined,
    interactionType: (notification.interactionType ?? 'canRead') as 'canRead' | 'needsAcknowledgement',
    createdBy: notification.createdBy,
    assignedTo: assignedTo,
    actionUrl: notification.actionUrl,
    metadata: notification.metadata
  };
}

// Get current user ID - This should be replaced with actual auth context
// For now, using a default mock user ID
const getCurrentUserId = (): string => {
  // TODO: Replace with actual auth context
  return 'mahyar'; // Default user ID
};

// Get notifications from API
async function getNotificationsFromAPI(filters?: NotificationFilters, currentUserId?: string): Promise<Notification[]> {
  try {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.type) params.type = filters.type;
    if (filters?.category) params.category = filters.category;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.isRead !== undefined) params.isRead = filters.isRead.toString();
    if (filters?.sourceType) params.sourceType = filters.sourceType;
    if (currentUserId) params.currentUserId = currentUserId;

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

    let notifications = response.data.map(transformNotificationData);
    
    // Apply sourceType filter on client side if needed (for better UX)
    const userId = currentUserId || getCurrentUserId();
    if (filters?.sourceType) {
      notifications = notifications.filter(notification => {
        if (filters.sourceType === 'createdByMe') {
          return notification.createdBy === userId;
        } else if (filters.sourceType === 'assignedToMe') {
          return notification.assignedTo?.some(item => item.userId === userId) || false;
        }
        return true;
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications from API:', error);
    return [];
  }
}

export class NotificationService {
  static async getNotifications(filters: NotificationFilters = {}, currentUserId?: string): Promise<Notification[]> {
    // Fetch from API (handles filtering on server side)
    const notifications = await getNotificationsFromAPI(filters, currentUserId);
    
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

  static async getGroupedNotifications(filters: NotificationFilters = {}, groupBy: 'category' | 'type' | 'priority' | 'status' = 'category', currentUserId?: string): Promise<NotificationGroup[]> {
    const notifications = await this.getNotifications(filters, currentUserId);
    
    // Separate notifications that need acknowledgment
    const needsAcknowledgement: Notification[] = [];
    const otherNotifications: Notification[] = [];
    
    notifications.forEach(notification => {
      if (!notification.isRead && notification.interactionType === 'needsAcknowledgement') {
        needsAcknowledgement.push(notification);
      } else {
        otherNotifications.push(notification);
      }
    });

    const groups: Record<string, Notification[]> = {};

    // Group other notifications
    otherNotifications.forEach(notification => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'type':
          groupKey = notification.type;
          break;
        case 'priority':
          groupKey = notification.priority;
          break;
        case 'status':
          groupKey = notification.isRead ? 'read' : 'unread';
          break;
        case 'category':
        default:
          groupKey = notification.category;
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    const result: NotificationGroup[] = [];

    // Add "Need Acknowledgement" group first if there are any
    if (needsAcknowledgement.length > 0) {
      result.push({
        category: 'needs_acknowledgement',
        notifications: needsAcknowledgement,
        unreadCount: needsAcknowledgement.length,
        totalCount: needsAcknowledgement.length
      });
    }

    // Add other groups
    const otherGroups = Object.entries(groups).map(([category, notifications]) => ({
      category,
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
      totalCount: notifications.length
    }));

    result.push(...otherGroups);

    return result;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await apiRequest(
        `/api/notifications/${notificationId}`,
        {
          method: 'PUT',
          body: { isRead: true, interactedAt: new Date().toISOString() }
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to mark notification as read');
    }
  }

  static async acknowledge(notificationId: string): Promise<void> {
    try {
      const response = await apiRequest(
        `/api/notifications/${notificationId}`,
        {
          method: 'PUT',
          body: { isRead: true, interactedAt: new Date().toISOString() }
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to acknowledge notification');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to acknowledge notification');
    }
  }

  static async markAsUnread(notificationId: string): Promise<void> {
    try {
      // Don't allow unacknowledging - only allow marking as unread for canRead type
      const response = await apiRequest(
        `/api/notifications/${notificationId}`,
        {
          method: 'PUT',
          body: { isRead: false, interactedAt: undefined }
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
      
      // Filter out notifications that need acknowledgment - those should not be marked as read
      const notificationsToMark = notifications.filter(
        n => n.interactionType !== 'needsAcknowledgement'
      );
      
      // Update each notification that doesn't need acknowledgment
      await Promise.all(
        notificationsToMark.map(n => 
          apiRequest(`/api/notifications/${n.id}`, {
            method: 'PUT',
            body: { isRead: true, interactedAt: new Date().toISOString() }
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
      important: 'Important',
      error: 'Important' // Legacy support
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
