'use client';

import { motion } from 'framer-motion';
import { Filter, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/gradian-ui/data-display/components/SearchBar';
import { ViewSwitcher } from '@/gradian-ui/data-display/components/ViewSwitcher';

interface DynamicFilterPaneProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddNew: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
  onRefresh,
  isRefreshing = false,
  searchPlaceholder = "Search...",
  addButtonText = "Add New",
  className = "",
}: DynamicFilterPaneProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 ${className}`}
    >
      <div className="flex-1 w-full">
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={onSearchChange}
          className="h-10 w-full"
        />
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center w-full lg:w-auto">
        <Button variant="outline" size="sm" className="h-10 w-full sm:w-auto whitespace-nowrap">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-full sm:w-10 p-0 justify-center"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
        <div className="border border-gray-300 rounded-md h-10 flex items-center w-full sm:w-auto justify-center">
          <ViewSwitcher
            currentView={viewMode}
            onViewChange={onViewModeChange}
            className="h-full w-full sm:w-auto"
          />
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="h-10 w-full sm:w-auto whitespace-nowrap text-xs"
          onClick={onAddNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      </div>
    </motion.div>
  );
};

