'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarNavigationProps } from '../types';
import { isActiveNavigationItem } from '../utils';
import { cn } from '../../../shared/utils';
import { SidebarNavigationDynamic } from './SidebarNavigationDynamic';
import { UI_PARAMS } from '@/gradian-ui/shared/constants/application-variables';

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  items,
  isCollapsed,
  isMobile,
  activePath,
  onItemClick,
  className,
}) => {
  const pathname = usePathname();
  const currentPath = activePath || pathname;

  return (
    <ScrollArea className={cn("flex-1 px-4", className)}>
      <nav className="space-y-3">
        {items.map((item, index) => {
          const isActive = isActiveNavigationItem(item, currentPath);
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href} onClick={() => onItemClick?.(item)}>
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(index * UI_PARAMS.CARD_INDEX_DELAY.STEP, UI_PARAMS.CARD_INDEX_DELAY.MAX),
                  ease: 'easeOut',
                }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-xs font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && (!isCollapsed || isMobile) && (
                  <span className="ml-auto bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
      
      {/* Dynamic Schema Navigation */}
      <SidebarNavigationDynamic
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />
    </ScrollArea>
  );
};

SidebarNavigation.displayName = 'SidebarNavigation';

