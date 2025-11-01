// Dynamic Card Dialog Component

import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { DynamicCardRenderer } from './DynamicCardRenderer';
import { DynamicCardActionButtons } from './DynamicCardActionButtons';
import { FormSchema } from '../../form-builder/types/form-schema';
import { cn } from '../../shared/utils';

export interface DynamicCardDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  
  /**
   * Callback to close the dialog
   */
  onClose: () => void;
  
  /**
   * Schema for the card
   */
  schema: FormSchema;
  
  /**
   * Data for the card
   */
  data: any;
  
  /**
   * Title for the dialog
   * @default "Details"
   */
  title?: string;
  
  /**
   * CSS class name for the dialog content
   */
  className?: string;
  
  /**
   * Callback when view button is clicked (navigates to detail page)
   */
  onView?: (data: any) => void;
  
  /**
   * Callback when view detail button is clicked (navigates to detail page)
   */
  onViewDetail?: (data: any) => void;
  
  /**
   * Callback when edit button is clicked
   */
  onEdit?: (data: any) => void;
  
  /**
   * Callback when delete button is clicked
   */
  onDelete?: (data: any) => void;
}

/**
 * DynamicCardDialog - A dialog that shows a card with all badges and metrics
 */
export const DynamicCardDialog: React.FC<DynamicCardDialogProps> = ({
  isOpen,
  onClose,
  schema,
  data,
  title = 'Details',
  className,
  onView,
  onViewDetail,
  onEdit,
  onDelete
}) => {
  console.log('DynamicCardDialog render:', { isOpen, data });
  if (!isOpen || !data) {
    console.log('DynamicCardDialog not rendering due to:', { isOpen, hasData: !!data });
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} data-test-id="dynamic-card-dialog">
      <DialogContent className={cn("max-w-3xl max-h-[90vh] overflow-y-auto", className)} data-test-id="dynamic-card-dialog-content">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DynamicCardRenderer
              schema={schema}
              data={data}
              index={0}
              viewMode="grid"
              maxBadges={0} // Show all badges
              maxMetrics={0} // Show all metrics
              onView={onView}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              className="shadow-none border-none"
              disableAnimation={true} // Disable card animation in dialog
            />
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

DynamicCardDialog.displayName = 'DynamicCardDialog';
