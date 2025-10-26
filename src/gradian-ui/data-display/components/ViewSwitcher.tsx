// View Switcher Component

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { cn } from '../../shared/utils';
import { Grid3X3, List } from 'lucide-react';

export interface ViewSwitcherProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  className
}) => {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          'h-full w-10 p-0',
          currentView === 'grid' 
            ? 'bg-slate-600 hover:bg-slate-700 text-white' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        )}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'h-full w-10 p-0',
          currentView === 'list' 
            ? 'bg-slate-600 hover:bg-slate-700 text-white' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

ViewSwitcher.displayName = 'ViewSwitcher';
