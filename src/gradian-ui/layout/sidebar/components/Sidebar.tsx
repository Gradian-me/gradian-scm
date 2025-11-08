'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/utils';
import { SidebarProps } from '../types';
import { defaultNavigationItems } from '../utils';
import { defaultSidebarConfig } from '../configs';
import { SidebarHeader } from './SidebarHeader';
import { CompanySelector } from '@/components/layout/CompanySelector';
import { SidebarNavigation } from './SidebarNavigation';
import { UserProfileSelector } from '@/components/layout/UserProfileSelector';

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobile = false,
  config = defaultSidebarConfig,
  navigationItems = defaultNavigationItems,
  user: _user,
  company,
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

      {/* Company Selector */}
      <div className="px-4 py-3 border-b border-gray-800 sm:block md:hidden">
        <CompanySelector variant="dark" fullWidth showLogo="sidebar-avatar" />
      </div>

      {/* Navigation */}
      <SidebarNavigation
        items={navigationItems}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />

      {/* User Profile */}
      <div className="mt-auto border-t border-gray-800 p-4 sm:block md:hidden">
        <UserProfileSelector
          className={cn(
            "w-full",
            isCollapsed && !isMobile ? "justify-center" : ""
          )}
          config={{
            layout: {
              variant: 'dropdown',
              size: isCollapsed && !isMobile ? 'sm' : 'md',
              showAvatar: true,
              showName: !isCollapsed || isMobile,
              showEmail: false,
              showRole: false,
              showStatus: false,
              fullWidth: true,
              popoverPlacement: 'auto',
            },
            styling: {
              variant: 'minimal',
              theme: 'dark',
              rounded: true,
            },
          }}
        />
      </div>
    </motion.div>
  );
};

Sidebar.displayName = 'Sidebar';

