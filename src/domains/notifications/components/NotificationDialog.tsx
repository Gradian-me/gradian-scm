'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '../types';
import { 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Clock,
  ExternalLink,
  User,
  Calendar,
  Tag,
  AlertCircle,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface NotificationDialogProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
}

export function NotificationDialog({ notification, isOpen, onClose, onMarkAsRead, onMarkAsUnread }: NotificationDialogProps) {
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isMarkingAsUnread, setIsMarkingAsUnread] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Info className="h-6 w-6 text-gray-500" />;
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

  const handleMarkAsRead = async () => {
    if (!notification || notification.isRead) return;
    
    setIsMarkingAsRead(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const handleMarkAsUnread = async () => {
    if (!notification || !notification.isRead || !onMarkAsUnread) return;
    
    setIsMarkingAsUnread(true);
    try {
      await onMarkAsUnread(notification.id);
    } finally {
      setIsMarkingAsUnread(false);
    }
  };

  const handleViewAction = () => {
    if (notification?.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getTypeIcon(notification.type)}
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                  {notification.title}
                </DialogTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                    {notification.type}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(notification.priority)} className="text-xs">
                    {notification.priority}
                  </Badge>
                  {!notification.isRead && (
                    <Badge variant="default" className="text-xs bg-violet-600">
                      Unread
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Message Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span>Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
              </CardContent>
            </Card>

            {/* Metadata */}
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-gray-600" />
                    <span>Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(notification.metadata).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="text-sm text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Created</span>
                    <div className="text-sm text-gray-900">
                      {format(notification.createdAt, 'PPP p')}
                      <span className="text-gray-500 ml-2">
                        ({formatDistanceToNow(notification.createdAt, { addSuffix: true })})
                      </span>
                    </div>
                  </div>
                  {notification.readAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Read</span>
                      <div className="text-sm text-gray-900">
                        {format(notification.readAt, 'PPP p')}
                        <span className="text-gray-500 ml-2">
                          ({formatDistanceToNow(notification.readAt, { addSuffix: true })})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!notification.isRead ? (
                <Button
                  variant="outline"
                  onClick={handleMarkAsRead}
                  disabled={isMarkingAsRead}
                  className="text-sm"
                >
                  {isMarkingAsRead ? 'Marking...' : 'Mark as Read'}
                </Button>
              ) : (
                onMarkAsUnread && (
                  <Button
                    variant="outline"
                    onClick={handleMarkAsUnread}
                    disabled={isMarkingAsUnread}
                    className="text-sm"
                  >
                    {isMarkingAsUnread ? 'Marking...' : 'Mark as Unread'}
                  </Button>
                )
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {notification.actionUrl && (
                <Button
                  variant="default"
                  onClick={handleViewAction}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
