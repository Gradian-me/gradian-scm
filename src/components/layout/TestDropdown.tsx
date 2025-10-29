'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TestDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => console.log('Item 1 clicked')}>
          Item 1
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Item 2 clicked')}>
          Item 2
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Item 3 clicked')}>
          Item 3
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
