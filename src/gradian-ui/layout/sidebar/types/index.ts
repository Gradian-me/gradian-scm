// Sidebar Types

import { BaseComponentProps } from '../../../shared/types';
import { LucideIcon } from 'lucide-react';

export interface SidebarProps extends BaseComponentProps {
  /**
   * Whether the sidebar is collapsed
   */
  isCollapsed: boolean;
  
  /**
   * Callback when sidebar toggle is clicked
   */
  onToggle: () => void;
  
  /**
   * Whether this is a mobile sidebar
   */
  isMobile?: boolean;
  
  /**
   * Sidebar configuration
   */
  config?: SidebarConfig;
  
  /**
   * Navigation items
   */
  navigationItems?: NavigationItem[];
  
  /**
   * User profile information
   */
  user?: SidebarUser;
  
  /**
   * Department badge information
   */
  department?: DepartmentBadge;
}

export interface SidebarConfig {
  /**
   * Brand/Logo configuration
   */
  brand?: {
    logo?: string;
    title: string;
    subtitle?: string;
    href?: string;
  };
  
  /**
   * Styling configuration
   */
  styling?: {
    variant?: 'default' | 'minimal' | 'compact';
    backgroundColor?: string;
    textColor?: string;
    collapsedWidth?: number;
    expandedWidth?: number;
  };
  
  /**
   * Behavior configuration
   */
  behavior?: {
    collapsible?: boolean;
    collapseOnMobile?: boolean;
    sticky?: boolean;
  };
}

export interface NavigationItem {
  /**
   * Unique identifier
   */
  id?: string;
  
  /**
   * Display name
   */
  name: string;
  
  /**
   * Navigation href
   */
  href: string;
  
  /**
   * Icon component
   */
  icon: LucideIcon;
  
  /**
   * Whether the item is active
   */
  isActive?: boolean;
  
  /**
   * Badge/count to display
   */
  badge?: number | string;
  
  /**
   * Sub-items (for nested navigation)
   */
  children?: NavigationItem[];
}

export interface SidebarUser {
  /**
   * User name
   */
  name: string;
  
  /**
   * User role/title
   */
  role?: string;
  
  /**
   * Avatar image URL
   */
  avatar?: string;
  
  /**
   * Avatar fallback initials
   */
  initials?: string;
  
  /**
   * User email
   */
  email?: string;
}

export interface DepartmentBadge {
  /**
   * Department name
   */
  name: string;
  
  /**
   * Department abbreviation (for collapsed state)
   */
  abbreviation?: string;
  
  /**
   * Department ID
   */
  id?: string;
}

export interface SidebarHeaderProps extends BaseComponentProps {
  brand?: SidebarConfig['brand'];
  isCollapsed: boolean;
  isMobile: boolean;
  onToggle: () => void;
}

export interface SidebarNavigationProps extends BaseComponentProps {
  items: NavigationItem[];
  isCollapsed: boolean;
  isMobile: boolean;
  activePath?: string;
  onItemClick?: (item: NavigationItem) => void;
}

export interface SidebarUserProfileProps extends BaseComponentProps {
  user?: SidebarUser;
  isCollapsed: boolean;
  isMobile: boolean;
}

export interface SidebarDepartmentBadgeProps extends BaseComponentProps {
  department?: DepartmentBadge;
  isCollapsed: boolean;
  isMobile: boolean;
}

