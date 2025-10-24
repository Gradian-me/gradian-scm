'use client';

import { NotificationGroup as NotificationGroupType } from '../types';
import { NotificationItem } from './NotificationItem';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationService } from '../services/notification.service';

interface NotificationGroupProps {
  group: NotificationGroupType;
  onMarkAsRead: (id: string) => void;
}

export function NotificationGroup({ group, onMarkAsRead }: NotificationGroupProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {NotificationService.getCategoryLabel(group.category)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {group.notifications.length} total
            </Badge>
            {group.unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {group.unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {group.notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
