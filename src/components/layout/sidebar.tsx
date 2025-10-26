'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const navigationItems = [
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
    name: 'Purchase Orders',
    href: '/purchase-orders',
    icon: ShoppingCart,
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: Receipt,
  },
  {
    name: 'Shipments',
    href: '/shipments',
    icon: Truck,
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

export function Sidebar({ isCollapsed, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.div
      initial={false}
      animate={{ width: isMobile ? 320 : (isCollapsed ? 80 : 280) }}
      className={cn(
        "relative h-full bg-gray-900 text-white flex flex-col",
        !isMobile && "border-r border-gray-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <AnimatePresence mode="wait">
          {(!isCollapsed || isMobile) && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">Gradian</h1>
                <p className="text-xs text-gray-400">Supply Chain Management</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
        >
          {isMobile ? <X className="h-5 w-5" /> : (isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />)}
        </Button>
      </div>

      {/* Department Badge */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {(!isCollapsed || isMobile) ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                Supply Chain Dept.
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex justify-center"
            >
              <Button size="icon" className="bg-gray-800 hover:bg-gray-700 text-white">
                <span className="text-sm font-bold">SC</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-3">
          {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
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
              </motion.div>
            </Link>
          );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <AnimatePresence mode="wait">
          {(!isCollapsed || isMobile) ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center space-x-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/mahyar.jpg" alt="Mahyar Abidi" />
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Mahyar Abidi
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Supply Chain Manager
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex justify-center"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/mahyar.jpg" alt="Mahyar Abidi" />
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
