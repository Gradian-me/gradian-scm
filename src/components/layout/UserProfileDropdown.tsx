'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/gradian-ui/form-builder/form-elements';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface UserProfileDropdownProps {
  userName?: string;
  userAvatar?: string;
  userInitials?: string;
}

export function UserProfileDropdown({ 
  userName = "Mahyar Abidi", 
  userAvatar = "/avatars/mahyar.jpg", 
  userInitials = "MA" 
}: UserProfileDropdownProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/settings/profile');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
    // Example: Call API to logout
    // Then redirect to login page
    // router.push('/auth/login');
  };

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2"
          aria-label="User profile menu"
        >
          <Avatar
            src={userAvatar}
            alt={userName}
            fallback={userInitials}
            size="md"
            variant="primary"
            className="border border-gray-100"
          />
          <span className="text-sm font-medium">{userName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            "z-50 min-w-32 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 text-gray-900 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-sm font-semibold text-gray-900">
            My Account
          </DropdownMenuPrimitive.Label>
          
          <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-gray-200" />
          
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none",
              "hover:bg-violet-50 focus:bg-violet-50"
            )}
            onSelect={handleProfileClick}
          >
            Profile
          </DropdownMenuPrimitive.Item>
          
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none",
              "hover:bg-violet-50 focus:bg-violet-50"
            )}
            onSelect={handleSettingsClick}
          >
            Settings
          </DropdownMenuPrimitive.Item>
          
          <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-gray-200" />
          
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none text-red-600",
              "hover:bg-red-50 focus:bg-red-50"
            )}
            onSelect={handleLogout}
          >
            Logout
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}