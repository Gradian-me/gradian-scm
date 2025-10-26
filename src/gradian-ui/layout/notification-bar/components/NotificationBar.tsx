// Notification Bar Component

import React from 'react';
import { NotificationBarProps } from '../types';
import { NotificationContainer } from './NotificationContainer';
import { cn } from '../../../shared/utils';

export const NotificationBar: React.FC<NotificationBarProps> = ({
  config,
  notifications,
  onNotificationDismiss,
  onNotificationAction,
  className,
  ...props
}) => {
  const {
    position = 'top',
    styling = { variant: 'default' },
  } = config;

  const barClasses = cn(
    'fixed z-50 w-full',
    position === 'top' && 'top-0 left-0 right-0',
    position === 'bottom' && 'bottom-0 left-0 right-0',
    styling.variant === 'floating' && 'p-4',
    className
  );

  return (
    <div className={barClasses} {...props}>
      <NotificationContainer
        notifications={notifications}
        onNotificationDismiss={onNotificationDismiss}
        onNotificationAction={onNotificationAction}
        config={config}
      />
    </div>
  );
};

NotificationBar.displayName = 'NotificationBar';
