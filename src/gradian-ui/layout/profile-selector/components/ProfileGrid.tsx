// Profile Grid Component

import React from 'react';
import { cn } from '../../../shared/utils';

interface ProfileGridProps {
  profiles: any[];
  onProfileSelect?: (profile: any) => void;
  selectedProfile?: any;
  className?: string;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  onProfileSelect,
  selectedProfile,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {profiles.map((profile) => (
        <div
          key={profile.id}
          onClick={() => onProfileSelect?.(profile)}
          className={cn(
            'p-2 rounded-md cursor-pointer transition-colors',
            selectedProfile?.id === profile.id
              ? 'bg-blue-100 border border-blue-300'
              : 'hover:bg-gray-100'
          )}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
              {profile.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500 truncate">
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
