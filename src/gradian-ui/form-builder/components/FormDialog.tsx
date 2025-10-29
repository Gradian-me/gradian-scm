// Form Dialog Component

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';
import { SchemaFormWrapper } from './FormLifecycleManager';
import { cn } from '../../shared/utils';
import { loggingCustom } from '../../../shared/utils';
import { LogType } from '../../../shared/constants/application-variables';
import type { FormSchema } from '../types/form-schema';

export interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  schema: FormSchema;
  onSubmit?: (data: Record<string, any>) => void;
  onReset?: () => void;
  onFieldChange?: (fieldName: string, value: any) => void;
  initialValues?: Record<string, any>;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  className?: string;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  schema,
  onSubmit,
  onReset,
  onFieldChange,
  initialValues = {},
  validationMode = 'onSubmit',
  disabled = false,
  size = 'lg',
  showCloseButton = false,
  closeOnOutsideClick = true,
  className,
  ...props
}) => {
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null);

  const handleSubmit = async (data: Record<string, any>) => {
    // Log form submission
    loggingCustom(LogType.FORM_DATA, 'info', '=== FORM DIALOG SUBMISSION STARTED ===');
    loggingCustom(LogType.FORM_DATA, 'info', `Dialog Title: ${title || 'Untitled'}`);
    loggingCustom(LogType.FORM_DATA, 'info', `Form Data Being Submitted: ${JSON.stringify(data, null, 2)}`);
    
    try {
      await onSubmit?.(data);
      loggingCustom(LogType.FORM_DATA, 'info', 'Form dialog submitted successfully');
      onClose();
    } catch (error) {
      loggingCustom(LogType.FORM_DATA, 'error', `Form submission error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    loggingCustom(LogType.FORM_DATA, 'info', '=== FORM DIALOG SUBMISSION ENDED ===');
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    loggingCustom(LogType.FORM_DATA, 'info', 'Cancel button clicked');
    onReset?.();
    onClose();
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    loggingCustom(LogType.FORM_DATA, 'info', 'Reset button clicked');
    onReset?.();
  };

  const handleFormSubmitClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    loggingCustom(LogType.FORM_DATA, 'info', `Submit button clicked, submitForm available: ${!!submitForm}`);
    if (submitForm) {
      await submitForm();
    } else {
      loggingCustom(LogType.FORM_DATA, 'warn', 'submitForm not available');
    }
  };

  const sizeClasses = {
    sm: 'sm:max-w-2xl',
    md: 'md:max-w-6xl',
    lg: 'lg:max-w-[88rem]',
    xl: 'xl:max-w-[100rem]',
    '2xl': '2xl:max-w-[112rem]',
  };

  const dialogClasses = cn(
    sizeClasses[size],
    'max-h-[95vh] w-[98vw] md:w-full flex flex-col',
    className
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={dialogClasses}
        {...(closeOnOutsideClick ? {} : { onInteractOutside: (e) => e.preventDefault() })}
      >
        <DialogHeader className="px-2 md:px-4 pt-6 pb-2 shrink-0">
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription className="mt-0.5">{description}</DialogDescription>}
        </DialogHeader>

        {/* Form Actions */}
        {(schema.actions?.cancel || schema.actions?.reset || schema.actions?.submit) && (
          <div className="px-6 pb-2 shrink-0 bg-white border-b border-gray-200 relative z-20">
            <div className="flex justify-end space-x-3">
              {schema.actions?.cancel && (
                <Button
                  type="button"
                  variant={schema.actions.cancel.variant || 'outline'}
                  onClick={handleCancel}
                  disabled={disabled}
                >
                  {schema.actions.cancel.label}
                </Button>
              )}
              {schema.actions?.reset && (
                <Button
                  type="button"
                  variant={schema.actions.reset.variant || 'outline'}
                  onClick={handleResetClick}
                  disabled={disabled}
                >
                  {schema.actions.reset.label}
                </Button>
              )}
              {schema.actions?.submit && (
                <Button
                  type="button"
                  variant={schema.actions.submit.variant || 'default'}
                  disabled={disabled}
                  onClick={handleFormSubmitClick}
                >
                  {schema.actions.submit.label}
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Form Content */}
        <ScrollArea className="flex-1 px-6 py-1" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          <form 
            id="form-dialog-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (submitForm) {
                submitForm();
              }
            }}
          >
            <SchemaFormWrapper
              schema={schema}
              onSubmit={handleSubmit}
              onReset={onReset}
              onFieldChange={onFieldChange}
              initialValues={initialValues}
              validationMode={validationMode}
              disabled={disabled}
              onMount={(submitFn) => setSubmitForm(submitFn)}
              hideActions={true}
            />
          </form>
        </ScrollArea>

        {showCloseButton && (
          <DialogFooter className="px-6 pb-6 pt-3 border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={disabled}
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

FormDialog.displayName = 'FormDialog';

