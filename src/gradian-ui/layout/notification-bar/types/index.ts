// Notification Bar Types

import { BaseComponentProps, NotificationConfig } from '../../../shared/types';

export interface NotificationBarProps extends BaseComponentProps {
  config: NotificationBarConfig;
  notifications: NotificationConfig[];
  onNotificationDismiss?: (id: string) => void;
  onNotificationAction?: (id: string, action: string) => void;
}

export interface NotificationBarConfig {
  id: string;
  name: string;
  position?: 'top' | 'bottom';
  maxNotifications?: number;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  stacking?: boolean;
  styling?: {
    variant?: 'default' | 'minimal' | 'floating';
    theme?: 'light' | 'dark';
    size?: 'sm' | 'md' | 'lg';
  };
  behavior?: {
    pauseOnHover?: boolean;
    clickToDismiss?: boolean;
    swipeToDismiss?: boolean;
  };
}

export interface NotificationItemProps extends BaseComponentProps {
  notification: NotificationConfig;
  onDismiss?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  pauseOnHover?: boolean;
  clickToDismiss?: boolean;
}

export interface NotificationContainerProps extends BaseComponentProps {
  notifications: NotificationConfig[];
  onNotificationDismiss?: (id: string) => void;
  onNotificationAction?: (id: string, action: string) => void;
  config: NotificationBarConfig;
}
