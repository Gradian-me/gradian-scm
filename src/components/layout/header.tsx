'use client';

import { useState } from 'react';
import { Bell, User, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-gray-900"
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
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Departments</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Supply Chain</DropdownMenuItem>
                <DropdownMenuItem>Finance</DropdownMenuItem>
                <DropdownMenuItem>Operations</DropdownMenuItem>
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
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">New Quotation Received</p>
                    <p className="text-xs text-gray-500">Transfarma submitted a quotation for HPLC Columns</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Purchase Order Approved</p>
                    <p className="text-xs text-gray-500">PO-2024-001 has been approved</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Shipment Delayed</p>
                    <p className="text-xs text-gray-500">SH-2024-001 is experiencing delays</p>
                  </div>
                </DropdownMenuItem>
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
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
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
