'use client';

import { useState } from 'react';
import { Notification } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationDialog } from './NotificationDialog';
import { 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-all duration-200 ${
        !notification.isRead ? 'bg-violet-50/30 border-violet-200' : 'bg-white'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                  }`}>
                    {notification.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                    {notification.type}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(notification.priority)} className="text-xs">
                    {notification.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Dialog */}
      <NotificationDialog
        notification={notification}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onMarkAsRead={onMarkAsRead}
      />
    </>
  );
}
