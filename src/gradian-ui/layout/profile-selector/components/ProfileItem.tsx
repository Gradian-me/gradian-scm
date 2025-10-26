// Profile Item Component

import React from 'react';
import { ProfileItemProps } from '../types';
import { ProfileStatus } from './ProfileStatus';
import { cn } from '../../../shared/utils';

export const ProfileItem: React.FC<ProfileItemProps> = ({
  profile,
  isSelected = false,
  isActive = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = false,
  showStatus = false,
  className,
  ...props
}) => {
  const handleSelect = () => {
    onSelect?.(profile);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(profile);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(profile);
  };

  const itemClasses = cn(
    'flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors',
    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
    isSelected && 'bg-blue-50 border border-blue-200',
    isActive && 'bg-gray-100',
    className
  );

  const avatarClasses = cn(
    'h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700',
    profile.avatar && 'bg-cover bg-center'
  );

  return (
    <div
      className={itemClasses}
      onClick={handleSelect}
      {...props}
    >
      {/* Avatar */}
      <div
        className={avatarClasses}
        style={profile.avatar ? { backgroundImage: `url(${profile.avatar})` } : {}}
      >
        {!profile.avatar && profile.name.charAt(0).toUpperCase()}
      </div>

      {/* Profile Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {profile.name}
          </p>
          {showStatus && (
            <ProfileStatus status="active" size="sm" />
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {profile.email}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {profile.role}
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Edit profile"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              aria-label="Delete profile"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

ProfileItem.displayName = 'ProfileItem';
