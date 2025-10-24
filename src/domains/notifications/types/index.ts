export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'quotation' | 'purchase_order' | 'shipment' | 'vendor' | 'tender' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  search?: string;
  type?: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
}

export interface NotificationGroup {
  category: string;
  notifications: Notification[];
  unreadCount: number;
}
