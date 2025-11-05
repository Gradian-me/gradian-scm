// Profile Dropdown Component

import React, { useState, useRef, useEffect } from 'react';
import { ProfileDropdownProps } from '../types';
import { cn } from '../../../shared/utils';
import { Settings, User, LogOut, ChevronDown } from 'lucide-react';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    layout = { variant: 'dropdown' },
  } = config;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const dropdownClasses = cn(
    'relative',
    className
  );

  const buttonClasses = cn(
    'flex items-center gap-2 px-2 py-1.5 rounded-lg',
    'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200',
    'transition-all duration-200 text-sm'
  );

  const panelClasses = cn(
    'absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100',
    'opacity-0 invisible transform scale-95 transition-all duration-200 z-50',
    isOpen && 'opacity-100 visible transform scale-100'
  );

  const avatarClasses = cn(
    'h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-medium text-white',
    'ring-2 ring-white shadow-sm'
  );

  const menuItemClasses = cn(
    'flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700',
    'hover:bg-gray-50 cursor-pointer transition-colors duration-150',
    'first:rounded-t-xl last:rounded-b-xl'
  );

  return (
    <div className={dropdownClasses} ref={dropdownRef} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label="User menu"
      >
        {layout.showAvatar !== false && (
          <div className={avatarClasses}>
            {currentProfile?.avatar ? (
              <img
                src={currentProfile.avatar}
                alt={currentProfile?.name || 'User'}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{currentProfile?.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
        )}
        
        {layout.showName !== false && (
          <span className="text-sm font-medium text-gray-900 hidden sm:block">
            {currentProfile?.name || 'User'}
            {currentProfile?.lastname ? ` ${currentProfile.lastname}` : ''}
          </span>
        )}
        
        <ChevronDown className={cn(
          'h-4 w-4 text-gray-400 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={panelClasses}>
          {/* User Info Header */}
          {currentProfile && (
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={avatarClasses}>
                  {currentProfile.avatar ? (
                    <img
                      src={currentProfile.avatar}
                      alt={currentProfile.name || 'User'}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{currentProfile.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentProfile.name || 'User'}
                    {currentProfile.lastname ? ` ${currentProfile.lastname}` : ''}
                  </p>
                  {layout.showEmail && currentProfile.email && (
                    <p className="text-xs text-gray-500 truncate">
                      {currentProfile.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-1.5">
            {/* Profile */}
            <div
              onClick={() => {
                if (currentProfile) {
                  onProfileSelect?.(currentProfile);
                }
                setIsOpen(false);
              }}
              className={menuItemClasses}
            >
              <User className="h-4 w-4 text-gray-400" />
              <span>Profile</span>
            </div>

            {/* Settings */}
            <div
              onClick={() => {
                if (currentProfile) {
                  onProfileEdit?.(currentProfile);
                }
                setIsOpen(false);
              }}
              className={menuItemClasses}
            >
              <Settings className="h-4 w-4 text-gray-400" />
              <span>Settings</span>
            </div>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100" />

            {/* Logout */}
            <div
              onClick={() => {
                onProfileDelete?.(currentProfile!);
                setIsOpen(false);
              }}
              className={cn(menuItemClasses, 'text-red-600 hover:bg-red-50')}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProfileDropdown.displayName = 'ProfileDropdown';
