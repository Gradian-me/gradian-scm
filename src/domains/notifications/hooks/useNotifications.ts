import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationFilters, NotificationGroup } from '../types';
import { NotificationService } from '../services/notification.service';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (newFilters?: NotificationFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentFilters = newFilters || filters;
      const [notificationsData, groupedData, unreadCountData] = await Promise.all([
        NotificationService.getNotifications(currentFilters),
        NotificationService.getGroupedNotifications(currentFilters),
        NotificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setGroupedNotifications(groupedData);
      setUnreadCount(unreadCountData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchNotifications(updatedFilters);
  }, [filters, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update the notification
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      
      // Update grouped notifications
      setGroupedNotifications(prev => 
        prev.map(group => {
          const updatedNotifications = group.notifications.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          );
          return {
            ...group,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.isRead).length
          };
        })
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Call the API
      await NotificationService.markAsRead(notificationId);
    } catch (err) {
      // On error, revert by refetching
      await fetchNotifications();
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [fetchNotifications]);

  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update the notification
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: false, readAt: undefined }
            : n
        )
      );
      
      // Update grouped notifications
      setGroupedNotifications(prev => 
        prev.map(group => {
          const updatedNotifications = group.notifications.map(n =>
            n.id === notificationId
              ? { ...n, isRead: false, readAt: undefined }
              : n
          );
          return {
            ...group,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.isRead).length
          };
        })
      );
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Call the API
      await NotificationService.markAsUnread(notificationId);
    } catch (err) {
      // On error, revert by refetching
      await fetchNotifications();
      setError(err instanceof Error ? err.message : 'Failed to mark notification as unread');
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const now = new Date();
      
      // Optimistically update all notifications
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: now }))
      );
      
      // Update grouped notifications
      setGroupedNotifications(prev => 
        prev.map(group => ({
          ...group,
          notifications: group.notifications.map(n => ({ ...n, isRead: true, readAt: now })),
          unreadCount: 0
        }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      // Call the API
      await NotificationService.markAllAsRead();
    } catch (err) {
      // On error, revert by refetching
      await fetchNotifications();
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [fetchNotifications]);

  const clearFilters = useCallback(() => {
    setFilters({});
    fetchNotifications({});
  }, [fetchNotifications]);

  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      await NotificationService.createNotification(notification);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
    }
  }, [fetchNotifications]);

  const updateNotification = useCallback(async (id: string, updates: Partial<Notification>) => {
    try {
      await NotificationService.updateNotification(id, updates);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification');
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    groupedNotifications,
    isLoading,
    error,
    filters,
    unreadCount,
    fetchNotifications,
    updateFilters,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearFilters,
    createNotification,
    updateNotification,
    deleteNotification
  };
}
