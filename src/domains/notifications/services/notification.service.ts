import { Notification, NotificationFilters, NotificationGroup } from '../types';
import notificationsData from '../../../../data/notifications.json';

// Convert JSON data to proper format
const notifications: Notification[] = notificationsData.map((notification: any) => ({
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
}));

export class NotificationService {
  static async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    let filtered = [...notifications];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        n => n.title.toLowerCase().includes(searchLower) || 
             n.message.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === filters.isRead);
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
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
  }

  static async markAllAsRead(): Promise<void> {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
      }
    });
  }

  static async getUnreadCount(): Promise<number> {
    return notifications.filter(n => !n.isRead).length;
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      isRead: false
    };
    
    notifications.unshift(newNotification);
    return newNotification;
  }

  static async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return null;
    
    notifications[index] = { ...notifications[index], ...updates };
    return notifications[index];
  }

  static async deleteNotification(id: string): Promise<boolean> {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    notifications.splice(index, 1);
    return true;
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
