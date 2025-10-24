'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <Header title={title} />
        
        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            {/* Create Button */}
            {showCreateButton && (
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={onCreateClick}
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm px-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {createButtonText}
                </Button>
              </div>
            )}
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
