// Header Actions Component

import React, { useState } from 'react';
import { HeaderActionsProps } from '../types';
import { HeaderSearch } from './HeaderSearch';
import { HeaderNotifications } from './HeaderNotifications';
import { HeaderUser } from './HeaderUser';
import { cn } from '../../../shared/utils';

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  actions,
  user,
  onAction,
  className,
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    actions?.search?.onSearch?.(query);
  };

  const handleNotificationClick = () => {
    actions?.notifications?.onClick?.();
  };

  const handleUserAction = (action: string) => {
    onAction?.(action);
  };

  const handleThemeToggle = () => {
    const currentTheme = actions?.theme?.current || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    actions?.theme?.onToggle?.(newTheme);
  };

  const actionsClasses = cn(
    'flex items-center space-x-4',
    className
  );

  return (
    <div className={actionsClasses} {...props}>
      {/* Search */}
      {actions?.search?.enabled && (
        <HeaderSearch
          placeholder={actions.search.placeholder}
          onSearch={handleSearch}
          value={searchQuery}
        />
      )}

      {/* Theme Toggle */}
      {actions?.theme?.enabled && (
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle theme"
        >
          {actions.theme.current === 'dark' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      )}

      {/* Notifications */}
      {actions?.notifications?.enabled && (
        <HeaderNotifications
          count={actions.notifications.count}
          onClick={handleNotificationClick}
        />
      )}

      {/* User Menu */}
      {actions?.user?.enabled && user && (
        <HeaderUser
          user={user}
          onAction={handleUserAction}
          showAvatar={actions.user.showAvatar}
          showName={actions.user.showName}
          showRole={actions.user.showRole}
        />
      )}
    </div>
  );
};

HeaderActions.displayName = 'HeaderActions';
