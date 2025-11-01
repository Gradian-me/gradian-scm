'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/gradian-ui/form-builder/form-elements';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface DepartmentSelectorProps {
  onDepartmentChange?: (department: string) => void;
}

export function DepartmentSelector({ onDepartmentChange }: DepartmentSelectorProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('Supply Chain');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleDepartmentSelect = (department: string) => {
    console.log('Department selected:', department);
    setSelectedDepartment(department);
    if (onDepartmentChange) {
      onDepartmentChange(department);
    }
  };

  const departmentInitials = selectedDepartment
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .substring(0, 2);

  if (!isMounted) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center space-x-2"
        aria-label="Select department"
        disabled
      >
        <Avatar 
          fallback={departmentInitials}
          size="sm"
          variant="primary"
          className="border border-gray-100"
        />
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-2"
            aria-label="Select department"
          >
          <Avatar 
            fallback={departmentInitials}
            size="sm"
            variant="primary"
            className="border border-gray-100"
          />
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
            Departments
          </DropdownMenuPrimitive.Label>
          
          <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-gray-200" />
          
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none",
              "hover:bg-violet-50 focus:bg-violet-50"
            )}
            onSelect={() => handleDepartmentSelect('Supply Chain')}
          >
            Supply Chain
          </DropdownMenuPrimitive.Item>
          
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none",
              "hover:bg-violet-50 focus:bg-violet-50"
            )}
            onSelect={() => handleDepartmentSelect('Finance')}
          >
            Finance
          </DropdownMenuPrimitive.Item>
          
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none",
              "hover:bg-violet-50 focus:bg-violet-50"
            )}
            onSelect={() => handleDepartmentSelect('Operations')}
          >
            Operations
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}