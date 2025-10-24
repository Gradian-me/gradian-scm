'use client';

import { useState } from 'react';
import { Bell, User, ChevronDown, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { HydratedDropdown } from '@/shared/components/hydrated-dropdown';

interface HeaderProps {
  title: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;
}

export function Header({ 
  title, 
  showCreateButton = false, 
  createButtonText = "Create",
  onCreateClick 
}: HeaderProps) {
  const [notificationCount] = useState(3);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-2xl font-semibold text-gray-900"
        >
          {title}
        </motion.h1>

        <div className="flex items-center space-x-4">
          {/* Department Dropdown */}
          <HydratedDropdown
            fallback={
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">SC</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">SC</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border border-gray-200 shadow-lg">
                <DropdownMenuLabel className="text-sm font-semibold text-gray-900">Departments</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50">Supply Chain</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50">Finance</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50">Operations</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </HydratedDropdown>

          {/* Notifications */}
          <HydratedDropdown
            fallback={
              <Button variant="ghost" size="icon" className="relative">
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
            }
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl border border-gray-200 shadow-lg p-0">
                <div className="p-4 border-b border-gray-100">
                  <DropdownMenuLabel className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                    Notifications
                    <Badge variant="default" className="text-xs">3</Badge>
                  </DropdownMenuLabel>
                </div>
                <ScrollArea className="h-80">
                  <div className="p-2 space-y-1">
                    <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50 p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
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
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50 p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
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
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50 p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
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
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50 p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
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
                    </DropdownMenuItem>
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => window.location.href = '/notifications'}
                  >
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </HydratedDropdown>

          {/* User Profile */}
          <HydratedDropdown
            fallback={
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/mahyar.jpg" alt="Mahyar Abidi" />
                  <AvatarFallback>MA</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Mahyar Abidi</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/mahyar.jpg" alt="Mahyar Abidi" />
                    <AvatarFallback>MA</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Mahyar Abidi</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border border-gray-200 shadow-lg">
                <DropdownMenuLabel className="text-sm font-semibold text-gray-900">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50">Profile</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg hover:bg-violet-50 focus:bg-violet-50">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg hover:bg-red-50 focus:bg-red-50 text-red-600">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </HydratedDropdown>

          {/* Create Button */}
          {showCreateButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button onClick={onCreateClick} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>{createButtonText}</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
