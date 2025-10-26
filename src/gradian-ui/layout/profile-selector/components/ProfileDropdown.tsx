// Profile Dropdown Component

import React, { useState } from 'react';
import { ProfileDropdownProps } from '../types';
import { ProfileItem } from './ProfileItem';
import { ProfileSearch } from './ProfileSearch';
import { cn } from '../../../shared/utils';

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    layout = { variant: 'dropdown' },
    allowCreate = true,
    allowEdit = true,
    allowDelete = true,
  } = config;

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProfileSelect = (profile: any) => {
    onProfileSelect?.(profile);
    setIsOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const dropdownClasses = cn(
    'relative',
    className
  );

  const buttonClasses = cn(
    'flex items-center space-x-3 p-3 w-full text-left bg-white border border-gray-300 rounded-md',
    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'transition-colors duration-200'
  );

  const panelClasses = cn(
    'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg',
    'opacity-0 invisible transform scale-95 transition-all duration-200 z-50',
    isOpen && 'opacity-100 visible transform scale-100'
  );

  const avatarClasses = cn(
    'h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700',
    currentProfile?.avatar && 'bg-cover bg-center'
  );

  return (
    <div className={dropdownClasses} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label="Select profile"
      >
        {layout.showAvatar !== false && (
          <div
            className={avatarClasses}
            style={currentProfile?.avatar ? { backgroundImage: `url(${currentProfile.avatar})` } : {}}
          >
            {!currentProfile?.avatar && currentProfile?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {layout.showName !== false && (
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentProfile?.name || 'Select Profile'}
            </p>
          )}
          {layout.showEmail && (
            <p className="text-xs text-gray-500 truncate">
              {currentProfile?.email}
            </p>
          )}
          {layout.showRole && (
            <p className="text-xs text-gray-500 truncate">
              {currentProfile?.role}
            </p>
          )}
        </div>
        
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div className={panelClasses}>
        <div className="p-4">
          {/* Search */}
          {config.behavior?.searchable && (
            <ProfileSearch
              onSearch={handleSearch}
              placeholder="Search profiles..."
              value={searchQuery}
            />
          )}

          {/* Profiles List */}
          <div className="mt-4 max-h-64 overflow-y-auto">
            {filteredProfiles.length > 0 ? (
              <div className="space-y-1">
                {filteredProfiles.map((profile) => (
                  <ProfileItem
                    key={profile.id}
                    profile={profile}
                    isSelected={currentProfile?.id === profile.id}
                    onSelect={handleProfileSelect}
                    onEdit={allowEdit ? onProfileEdit : undefined}
                    onDelete={allowDelete ? onProfileDelete : undefined}
                    showActions={allowEdit || allowDelete}
                    showStatus={layout.showStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No profiles found</p>
              </div>
            )}
          </div>

          {/* Create Profile Button */}
          {allowCreate && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onProfileCreate?.();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create New Profile</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileDropdown.displayName = 'ProfileDropdown';
