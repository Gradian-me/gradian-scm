// Header Types

import type { ReactNode } from 'react';
import { BaseComponentProps, UserProfile, MenuItem } from '../../../shared/types';

// Re-export types for use in components
export type { MenuItem, UserProfile };

export interface HeaderProps extends BaseComponentProps {
  config: HeaderConfig;
  user?: UserProfile;
  onUserAction?: (action: string) => void;
  onMenuClick?: (item: MenuItem) => void;
  /**
   * Optional custom content to render in place of the default brand section.
   */
  brandContent?: ReactNode;
  /**
   * Optional custom content to render instead of the default navigation items.
   */
  navigationContent?: ReactNode;
  /**
   * Optional custom content to render instead of the default actions component.
   */
  actionsContent?: ReactNode;
}

export interface HeaderConfig {
  id: string;
  name: string;
  title?: string;
  logo?: {
    src: string;
    alt: string;
    href?: string;
  };
  navigation?: {
    items: MenuItem[];
    position?: 'left' | 'center' | 'right';
    variant?: 'horizontal' | 'vertical' | 'dropdown';
  };
  actions?: {
    search?: {
      enabled: boolean;
      placeholder?: string;
      onSearch?: (query: string) => void;
    };
    notifications?: {
      enabled: boolean;
      count?: number;
      onClick?: () => void;
    };
    user?: {
      enabled: boolean;
      showAvatar?: boolean;
      showName?: boolean;
      showRole?: boolean;
    };
    theme?: {
      enabled: boolean;
      current?: 'light' | 'dark' | 'auto';
      onToggle?: (theme: 'light' | 'dark' | 'auto') => void;
    };
  };
  styling?: {
    variant?: 'default' | 'minimal' | 'elevated' | 'transparent';
    size?: 'sm' | 'md' | 'lg';
    sticky?: boolean;
    fixed?: boolean;
    zIndex?: number;
  };
  responsive?: {
    mobileMenu?: boolean;
    breakpoint?: 'sm' | 'md' | 'lg';
    collapseOnScroll?: boolean;
  };
}

export interface HeaderBrandProps extends BaseComponentProps {
  logo?: HeaderConfig['logo'];
  title?: string;
  href?: string;
}

export interface HeaderNavigationProps extends BaseComponentProps {
  items: MenuItem[];
  variant?: 'horizontal' | 'vertical' | 'dropdown';
  onItemClick?: (item: MenuItem) => void;
}

export interface HeaderActionsProps extends BaseComponentProps {
  actions: HeaderConfig['actions'];
  user?: UserProfile;
  onAction?: (action: string, data?: any) => void;
}

export interface HeaderSearchProps extends BaseComponentProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  value?: string;
}

export interface HeaderNotificationsProps extends BaseComponentProps {
  count?: number;
  onClick?: () => void;
  items?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>;
}

export interface HeaderUserProps extends BaseComponentProps {
  user: UserProfile;
  onAction?: (action: string) => void;
  showAvatar?: boolean;
  showName?: boolean;
  showRole?: boolean;
}

export interface HeaderMobileMenuProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: MenuItem[];
  user?: UserProfile;
  onItemClick?: (item: MenuItem) => void;
  onUserAction?: (action: string) => void;
}
