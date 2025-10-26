// Notification Container Component

import React from 'react';
import { NotificationContainerProps } from '../types';
import { NotificationItem } from './NotificationItem';
import { cn } from '../../../shared/utils';

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onNotificationDismiss,
  onNotificationAction,
  config,
  className,
  ...props
}) => {
  const {
    maxNotifications = 5,
    stacking = true,
    styling = { variant: 'default' },
  } = config;

  const displayNotifications = notifications.slice(0, maxNotifications);

  const containerClasses = cn(
    'space-y-2',
    styling.variant === 'floating' && 'max-w-sm mx-auto',
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {displayNotifications.map((notification) => (
        <NotificationItem
          key={notification.id || Math.random().toString()}
          notification={notification}
          onDismiss={onNotificationDismiss}
          onAction={onNotificationAction}
          autoDismiss={config.autoDismiss}
          autoDismissDelay={config.autoDismissDelay}
          pauseOnHover={config.behavior?.pauseOnHover}
          clickToDismiss={config.behavior?.clickToDismiss}
        />
      ))}
    </div>
  );
};

NotificationContainer.displayName = 'NotificationContainer';
