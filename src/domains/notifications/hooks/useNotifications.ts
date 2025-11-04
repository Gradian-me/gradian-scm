import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationFilters, NotificationGroup, GroupByOption } from '../types';
import { NotificationService } from '../services/notification.service';

// Get current user ID - This should be replaced with actual auth context
const getCurrentUserId = (): string => {
  // TODO: Replace with actual auth context
  return 'mahyar'; // Default user ID
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [groupBy, setGroupBy] = useState<GroupByOption>('category');
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = getCurrentUserId();

  const fetchNotifications = useCallback(async (newFilters?: NotificationFilters, newGroupBy?: GroupByOption) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentFilters = newFilters || filters;
      const currentGroupBy = newGroupBy || groupBy;
      const [notificationsData, groupedData, unreadCountData] = await Promise.all([
        NotificationService.getNotifications(currentFilters, currentUserId),
        NotificationService.getGroupedNotifications(currentFilters, currentGroupBy, currentUserId),
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
  }, [filters, groupBy, currentUserId]);

  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchNotifications(updatedFilters, groupBy);
  }, [filters, groupBy, fetchNotifications]);

  const updateGroupBy = useCallback((newGroupBy: GroupByOption) => {
    setGroupBy(newGroupBy);
    fetchNotifications(filters, newGroupBy);
  }, [filters, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const now = new Date();
      // Optimistically update the notification
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, interactedAt: now }
            : n
        )
      );
      
      // Update grouped notifications
      setGroupedNotifications(prev => 
        prev.map(group => {
          const updatedNotifications = group.notifications.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true, interactedAt: now }
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

  const acknowledge = useCallback(async (notificationId: string) => {
    try {
      const now = new Date();
      // Optimistically update the notification
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, interactedAt: now }
            : n
        )
      );
      
      // Update grouped notifications
      setGroupedNotifications(prev => 
        prev.map(group => {
          const updatedNotifications = group.notifications.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true, interactedAt: now }
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
      await NotificationService.acknowledge(notificationId);
    } catch (err) {
      // On error, revert by refetching
      await fetchNotifications();
      setError(err instanceof Error ? err.message : 'Failed to acknowledge notification');
    }
  }, [fetchNotifications]);

  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update the notification
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: false, interactedAt: undefined }
            : n
        )
      );
      
      // Update grouped notifications
      setGroupedNotifications(prev => 
        prev.map(group => {
          const updatedNotifications = group.notifications.map(n =>
            n.id === notificationId
              ? { ...n, isRead: false, interactedAt: undefined }
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
      
      // Optimistically update all notifications except those that need acknowledgment
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.interactionType === 'needsAcknowledgement' 
            ? n 
            : { ...n, isRead: true, interactedAt: now }
        );
        
        // Calculate unread count from updated notifications (excluding those that need acknowledgment)
        const unreadCount = updated.filter(
          n => !n.isRead && n.interactionType !== 'needsAcknowledgement'
        ).length;
        setUnreadCount(unreadCount);
        
        return updated;
      });
      
      // Update grouped notifications
      setGroupedNotifications(prev => 
        prev.map(group => {
          const updatedNotifications = group.notifications.map(n =>
            n.interactionType === 'needsAcknowledgement'
              ? n
              : { ...n, isRead: true, interactedAt: now }
          );
          return {
            ...group,
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.isRead).length
          };
        })
      );
      
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
    groupBy,
    unreadCount,
    fetchNotifications,
    updateFilters,
    updateGroupBy,
    markAsRead,
    acknowledge,
    markAsUnread,
    markAllAsRead,
    clearFilters,
    createNotification,
    updateNotification,
    deleteNotification
  };
}
