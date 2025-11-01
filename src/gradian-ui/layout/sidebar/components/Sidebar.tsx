'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/utils';
import { SidebarProps } from '../types';
import { defaultNavigationItems } from '../utils';
import { defaultSidebarConfig } from '../configs';
import { SidebarHeader } from './SidebarHeader';
import { SidebarDepartmentBadge } from './SidebarDepartmentBadge';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarUserProfile } from './SidebarUserProfile';

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobile = false,
  config = defaultSidebarConfig,
  navigationItems = defaultNavigationItems,
  user,
  department,
  className,
}) => {
  const width = isMobile ? 320 : (isCollapsed ? config.styling?.collapsedWidth || 80 : config.styling?.expandedWidth || 280);

  return (
    <motion.div
      initial={false}
      animate={{ width }}
      className={cn(
        "relative h-full bg-gray-900 text-white flex flex-col",
        !isMobile && "border-r border-gray-800",
        className
      )}
    >
      {/* Header */}
      <SidebarHeader
        brand={config.brand}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onToggle={onToggle}
      />

      {/* Department Badge */}
      <SidebarDepartmentBadge
        department={department}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />

      {/* Navigation */}
      <SidebarNavigation
        items={navigationItems}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />

      {/* User Profile */}
      <SidebarUserProfile
        user={user}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />
    </motion.div>
  );
};

Sidebar.displayName = 'Sidebar';

