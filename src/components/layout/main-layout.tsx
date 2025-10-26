'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Plus, Menu, X, Bell } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;
}

export function MainLayout({ 
  children, 
  title, 
  showCreateButton = false, 
  createButtonText,
  onCreateClick 
}: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={toggleMobileMenu}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed left-0 top-0 h-full w-80 bg-gray-900 text-white z-50 md:hidden"
            >
              <Sidebar isCollapsed={false} onToggle={toggleMobileMenu} isMobile={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-xl md:text-2xl font-semibold text-gray-900"
            >
              {title}
            </motion.h1>
            
            {/* Desktop Header Content */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Department Dropdown */}
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <span className="text-xs">SC</span>
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Button>
              
              {/* User Profile */}
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">MA</span>
                </div>
                <span className="text-sm font-medium">Mahyar Abidi</span>
              </Button>
              
              {/* Create Button */}
              {showCreateButton && (
                <Button onClick={onCreateClick} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>{createButtonText}</span>
                </Button>
              )}
            </div>
            
            {/* Mobile Create Button */}
            {showCreateButton && (
              <Button
                onClick={onCreateClick}
                size="sm"
                className="md:hidden bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
