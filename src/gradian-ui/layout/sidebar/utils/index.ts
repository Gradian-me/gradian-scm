// Sidebar Utilities

import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  Truck, 
  Calendar, 
  BarChart3, 
  Database, 
  Settings,
  Bell,
  User,
  Folder,
  LucideIcon
} from 'lucide-react';
import { NavigationItem } from '../types';

/**
 * Default navigation items for the sidebar
 */
export const defaultNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Vendors',
    href: '/vendors',
    icon: Users,
  },
  {
    name: 'Tenders/Quotations',
    href: '/tenders',
    icon: FileText,
  },
  {
    name: 'Users',
    href: '/users',
    icon: User,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Folder,
  },
  {
    name: 'Tender Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    name: 'ERP Integration',
    href: '/erp',
    icon: Database,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

/**
 * Get initials from a name
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Check if a navigation item is active based on current pathname
 */
export const isActiveNavigationItem = (
  item: NavigationItem,
  pathname: string
): boolean => {
  if (item.href === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(item.href);
};

