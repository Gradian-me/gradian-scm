// Profile Grid Component

import React from 'react';
import { ProfileGridProps } from '../types';
import { cn } from '../../../shared/utils';

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  currentProfile,
  onProfileSelect,
  onProfileCreate,
  onProfileEdit,
  onProfileDelete,
  config,
  className,
  ...props
}) => {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)} {...props}>
      {profiles.map((profile) => (
        <div
          key={profile.id}
          onClick={() => onProfileSelect?.(profile)}
          className={cn(
            'p-2 rounded-md cursor-pointer transition-colors',
            currentProfile?.id === profile.id
              ? 'bg-blue-100 border border-blue-300'
              : 'hover:bg-gray-100'
          )}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
              {profile.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                {profile.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

ProfileGrid.displayName = 'ProfileGrid';
