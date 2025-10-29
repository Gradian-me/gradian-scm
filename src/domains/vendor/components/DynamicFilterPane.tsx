'use client';

import { motion } from 'framer-motion';
import { Filter, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SearchBar, ViewSwitcher } from '../../../gradian-ui';

interface DynamicFilterPaneProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddNew: () => void;
  searchPlaceholder?: string;
  addButtonText?: string;
  className?: string;
}

export const DynamicFilterPane = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddNew,
  searchPlaceholder = "Search...",
  addButtonText = "Add New",
  className = "",
}: DynamicFilterPaneProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col sm:flex-row gap-4 mb-6 ${className}`}
    >
      <div className="flex-1">
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={onSearchChange}
          className="h-10 w-full"
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="outline" size="sm" className="h-10 whitespace-nowrap">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="border border-gray-300 rounded-md h-10 flex items-center">
          <ViewSwitcher
            currentView={viewMode}
            onViewChange={onViewModeChange}
            className="h-full"
          />
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="h-10 whitespace-nowrap ml-auto sm:ml-0 text-xs"
          onClick={onAddNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      </div>
    </motion.div>
  );
};
