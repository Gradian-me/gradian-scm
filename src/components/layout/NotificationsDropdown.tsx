'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface NotificationsDropdownProps {
  initialCount?: number;
}

export function NotificationsDropdown({ initialCount = 3 }: NotificationsDropdownProps) {
  const [notificationCount, setNotificationCount] = useState(initialCount);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleViewAllClick = () => {
    router.push('/notifications');
  };

  const handleNotificationClick = (id: string) => {
    // Handle individual notification click
    console.log(`Notification clicked: ${id}`);
    // You could navigate to a specific notification detail page
    // router.push(`/notifications/${id}`);
  };

  if (!isMounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        aria-label="Notifications"
        disabled
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {notificationCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            aria-label="Notifications"
          >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuPrimitive.Trigger>
      
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            "z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white p-0 text-gray-900 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          align="end"
          sideOffset={4}
        >
          <div className="p-4 border-b border-gray-100">
            <DropdownMenuPrimitive.Label className="text-sm font-semibold text-gray-900 flex items-center justify-between">
              Notifications
              <Badge variant="default" className="text-xs">{notificationCount}</Badge>
            </DropdownMenuPrimitive.Label>
          </div>
          
          <ScrollArea className="h-80">
            <div className="p-2 space-y-1">
              <DropdownMenuPrimitive.Item
                className={cn(
                  "relative flex cursor-pointer select-none items-start rounded-lg p-3 text-sm outline-none",
                  "hover:bg-violet-50 focus:bg-violet-50"
                )}
                onSelect={() => handleNotificationClick('notification-1')}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium">New Quotation Received</p>
                      <Badge variant="success" className="text-xs">New</Badge>
                    </div>
                    <p className="text-xs text-gray-500">Transfarma submitted a quotation for HPLC Columns</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">2 minutes ago</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuPrimitive.Item>
              
              <DropdownMenuPrimitive.Item
                className={cn(
                  "relative flex cursor-pointer select-none items-start rounded-lg p-3 text-sm outline-none",
                  "hover:bg-violet-50 focus:bg-violet-50"
                )}
                onSelect={() => handleNotificationClick('notification-2')}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium">Purchase Order Approved</p>
                      <Badge variant="info" className="text-xs">Approved</Badge>
                    </div>
                    <p className="text-xs text-gray-500">PO-2024-001 has been approved</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuPrimitive.Item>
              
              <DropdownMenuPrimitive.Item
                className={cn(
                  "relative flex cursor-pointer select-none items-start rounded-lg p-3 text-sm outline-none",
                  "hover:bg-violet-50 focus:bg-violet-50"
                )}
                onSelect={() => handleNotificationClick('notification-3')}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium">Shipment Delayed</p>
                      <Badge variant="warning" className="text-xs">Urgent</Badge>
                    </div>
                    <p className="text-xs text-gray-500">SH-2024-001 is experiencing delays</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">3 hours ago</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuPrimitive.Item>
              
              <DropdownMenuPrimitive.Item
                className={cn(
                  "relative flex cursor-pointer select-none items-start rounded-lg p-3 text-sm outline-none",
                  "hover:bg-violet-50 focus:bg-violet-50"
                )}
                onSelect={() => handleNotificationClick('notification-4')}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium">Vendor Registration Complete</p>
                      <Badge variant="success" className="text-xs">Complete</Badge>
                    </div>
                    <p className="text-xs text-gray-500">New vendor Merck has been registered</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">1 day ago</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuPrimitive.Item>
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t border-gray-100">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={handleViewAllClick}
              aria-label="View all notifications"
            >
              View All Notifications
            </Button>
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}