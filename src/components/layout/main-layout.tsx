'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, PanelLeftOpen, PencilRuler, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GoToTop } from '../../gradian-ui/layout';
import { Sidebar } from '../../gradian-ui/layout/sidebar';
import { IconRenderer } from '../../shared/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CompanySelector } from './CompanySelector';
import { useCompanyStore } from '@/stores/company.store';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserProfileSelector } from './UserProfileSelector';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string | React.ReactNode;
  icon?: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;
  editSchemaPath?: string;
  isAdmin?: boolean;
}

export function MainLayout({ 
  children, 
  title,
  subtitle,
  icon,
  showCreateButton = false, 
  createButtonText = "Create",
  onCreateClick,
  editSchemaPath,
  isAdmin = false
}: MainLayoutProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);
  const { selectedCompany } = useCompanyStore();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNotificationClick = () => {
    window.location.href = '/notifications';
  };

  const handleUserProfileClick = () => {
    window.location.href = '/settings/profile';
  };

  const handleEditSchemaClick = () => {
    if (editSchemaPath) {
      router.push(editSchemaPath);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={toggleSidebar}
          company={selectedCompany ? {
            name: selectedCompany.name,
            abbreviation: selectedCompany.abbreviation,
            id: selectedCompany.id
          } : undefined}
        />
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
              <Sidebar 
                isCollapsed={false} 
                onToggle={toggleMobileMenu} 
                isMobile={true}
                company={selectedCompany ? {
                  name: selectedCompany.name,
                  abbreviation: selectedCompany.abbreviation,
                  id: selectedCompany.id
                } : undefined}
              />
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
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
            
            {/* Title */}
            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-2"
              >
                {icon && (
                  <IconRenderer 
                    iconName={icon} 
                    className="h-5 w-5 md:h-6 md:w-6 text-violet-600" 
                  />
                )}
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
                {isAdmin && editSchemaPath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditSchemaClick}
                    className="h-8 w-8 p-0 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                    aria-label="Edit schema"
                    title="Edit schema"
                  >
                    <PencilRuler className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  className="text-sm text-gray-500 mt-0.5"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
            
            {/* Desktop Header Content */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Company Dropdown */}
              <CompanySelector />
              
              {/* Notifications */}
              <NotificationsDropdown initialCount={3} />
              
              {/* User Profile */}
              <UserProfileSelector />
              
              {/* Create Button */}
              {showCreateButton && (
                <Button 
                  onClick={onCreateClick} 
                  className="flex items-center space-x-2"
                  aria-label={createButtonText}
                >
                  <Plus className="h-4 w-4" />
                  <span>{createButtonText}</span>
                </Button>
              )}
            </div>
            
            {/* Mobile Header Actions */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Mobile Notifications */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={handleNotificationClick}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
              
              {/* Mobile Create Button */}
              {showCreateButton && (
                <Button
                  onClick={onCreateClick}
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-6 bg-gray-50"
          data-scroll-container="main-content"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </motion.main>
        
        {/* Go to Top Button */}
        <GoToTop scrollContainerSelector="[data-scroll-container='main-content']" threshold={100} />
      </div>
    </div>
  );
}