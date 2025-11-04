'use client';

import React, { useState, useEffect } from 'react';
import { NotificationGroup as NotificationGroupType, GroupByOption } from '../types';
import { NotificationItem } from './NotificationItem';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationService } from '../services/notification.service';
import { CTAButton } from '@/gradian-ui/form-builder/form-elements/components/CTAButton';

interface NotificationGroupProps {
  group: NotificationGroupType;
  groupBy?: GroupByOption;
  onMarkAsRead: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
}

export function NotificationGroup({ group, groupBy = 'category', onMarkAsRead, onAcknowledge, onMarkAsUnread }: NotificationGroupProps) {
  const [displayCount, setDisplayCount] = useState(10); // Start with 10 items
  const INITIAL_COUNT = 10;
  const LOAD_MORE_COUNT = 20;

  // Reset display count when group changes
  useEffect(() => {
    setDisplayCount(INITIAL_COUNT);
  }, [group.category, group.notifications.length]);

  const totalNotifications = group.totalCount || group.notifications.length;
  const displayedNotifications = group.notifications.slice(0, displayCount);
  const hasMore = displayCount < totalNotifications;

  const handleShowMore = () => {
    setDisplayCount(prev => prev + LOAD_MORE_COUNT);
  };
  const getGroupLabel = (category: string, groupBy: GroupByOption): string => {
    // Special case for "Need Acknowledgement" group
    if (category === 'needs_acknowledgement') {
      return 'Need Acknowledgement';
    }
    
    switch (groupBy) {
      case 'type':
        return NotificationService.getTypeLabel(category);
      case 'priority':
        return NotificationService.getPriorityLabel(category);
      case 'status':
        return category === 'read' ? 'Read' : 'Unread';
      case 'category':
      default:
        return NotificationService.getCategoryLabel(category);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {getGroupLabel(group.category, groupBy)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {group.totalCount || group.notifications.length} total
            </Badge>
            {group.unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {group.unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onAcknowledge={onAcknowledge}
              onMarkAsUnread={onMarkAsUnread}
            />
          ))}
        </div>
        {hasMore && (
          <div className="mt-4">
            <CTAButton
              label={`Show More (${totalNotifications - displayCount} remaining)`}
              onClick={handleShowMore}
              color="#7c3aed"
              showArrow={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
