// Dynamic Card Action Buttons Component

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { cn } from '../../shared/utils';

export interface DynamicCardActionButtonsProps {
  /**
   * Whether to show the view button
   */
  showView?: boolean;
  
  /**
   * Whether to show the edit button
   */
  showEdit?: boolean;
  
  /**
   * Whether to show the delete button
   */
  showDelete?: boolean;
  
  /**
   * Callback when view button is clicked
   */
  onView?: () => void;
  
  /**
   * Callback when edit button is clicked
   */
  onEdit?: () => void;
  
  /**
   * Callback when delete button is clicked
   */
  onDelete?: () => void;
  
  /**
   * Display mode
   * @default "grid"
   */
  viewMode?: 'grid' | 'list';
  
  /**
   * CSS class name for the container
   */
  className?: string;
}

/**
 * DynamicCardActionButtons - A component for rendering consistent action buttons
 */
export const DynamicCardActionButtons: React.FC<DynamicCardActionButtonsProps> = ({
  showView = true,
  showEdit = true,
  showDelete = true,
  onView,
  onEdit,
  onDelete,
  viewMode = 'grid',
  className
}) => {
  if (viewMode === 'list') {
    // List view layout
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {showView && onView && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="h-8 w-8 p-0 group-hover:bg-sky-50 group-hover:border-sky-300 group-hover:text-sky-700 transition-all duration-200"
            >
              <IconRenderer iconName="Eye" className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
        {showEdit && onEdit && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0 group-hover:bg-emerald-50 group-hover:border-emerald-300 group-hover:text-emerald-700 transition-all duration-200"
            >
              <IconRenderer iconName="Edit" className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
        {showDelete && onDelete && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 group-hover:bg-red-50 group-hover:border-red-300 group-hover:text-red-700 transition-all duration-200"
            >
              <IconRenderer iconName="Trash2" className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    );
  }
  
  // Grid view layout
  return (
    <div className={cn("flex mt-auto pt-4", className)}>
      <motion.div
        className="flex gap-2 flex-row w-full flex-wrap"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {showView && onView && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="w-full group-hover:bg-sky-50 group-hover:border-sky-300 group-hover:text-sky-700 transition-all duration-200 text-xs"
            >
              <IconRenderer iconName="Eye" className="h-4 w-4 mr-2" />
              View
            </Button>
          </motion.div>
        )}
        {showEdit && onEdit && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="w-full group-hover:bg-emerald-50 group-hover:border-emerald-300 group-hover:text-emerald-700 transition-all duration-200 text-xs"
            >
              <IconRenderer iconName="Edit" className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </motion.div>
        )}
        {showDelete && onDelete && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="w-full group-hover:bg-red-50 group-hover:border-red-300 group-hover:text-red-700 transition-all duration-200 text-xs"
            >
              <IconRenderer iconName="Trash2" className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

DynamicCardActionButtons.displayName = 'DynamicCardActionButtons';
