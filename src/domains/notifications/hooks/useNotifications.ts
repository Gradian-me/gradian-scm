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
      await NotificationService.markAsRead(notificationId);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      await fetchNotifications();
    } catch (err) {
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
    markAllAsRead,
    clearFilters,
    createNotification,
    updateNotification,
    deleteNotification
  };
}
