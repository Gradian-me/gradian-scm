// Dynamic Card Dialog Component

import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
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
   * Callback when view button is clicked
   */
  onView?: (data: any) => void;
  
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
      <DialogContent className={cn("max-w-3xl max-h-[90vh] h-[90vh] flex flex-col min-h-0", className)} data-test-id="dynamic-card-dialog-content">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 mt-4">
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
              maxBadges={0}
              maxMetrics={0}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              className="shadow-none border-none"
              disableAnimation={true}
            />
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

DynamicCardDialog.displayName = 'DynamicCardDialog';
