// Sidebar Configurations

import { SidebarConfig } from '../types';

/**
 * Default sidebar configuration
 */
export const defaultSidebarConfig: SidebarConfig = {
  brand: {
    title: 'Gradian',
    subtitle: 'Supply Chain Management',
  },
  styling: {
    variant: 'default',
    collapsedWidth: 80,
    expandedWidth: 280,
  },
  behavior: {
    collapsible: true,
    collapseOnMobile: true,
    sticky: true,
  },
};

