// Form Dialog Component

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';
import { SchemaFormWrapper } from './FormLifecycleManager';
import { cn } from '../../shared/utils';
import { loggingCustom } from '../../../shared/utils';
import { LogType } from '../../../shared/constants/application-variables';
import type { FormSchema } from '../types/form-schema';
import { getActionConfig, getSingularName, isEditMode } from '../utils/action-config';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get action configurations dynamically
  const editMode = isEditMode(initialValues);
  const singularName = getSingularName(schema);
  const actionConfigs = useMemo(() => {
    const defaultActions: Array<'submit' | 'cancel' | 'reset'> = ['cancel', 'reset', 'submit'];
    const actions = schema.actions || defaultActions;
    // Ensure actions is always an array
    const actionsArray = Array.isArray(actions) ? actions : defaultActions;
    return actionsArray.map(actionType => getActionConfig(actionType, singularName, editMode));
  }, [schema.actions, singularName, editMode]);

  const handleSubmit = async (data: Record<string, any>) => {
    // Log form submission
    loggingCustom(LogType.FORM_DATA, 'info', '=== FORM DIALOG SUBMISSION STARTED ===');
    loggingCustom(LogType.FORM_DATA, 'info', `Dialog Title: ${title || 'Untitled'}`);
    loggingCustom(LogType.FORM_DATA, 'info', `Form Data Being Submitted: ${JSON.stringify(data, null, 2)}`);
    
    setIsSubmitting(true);
    try {
      await onSubmit?.(data);
      loggingCustom(LogType.FORM_DATA, 'info', 'Form dialog submitted successfully');
      onClose();
    } catch (error) {
      loggingCustom(LogType.FORM_DATA, 'error', `Form submission error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
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
        {actionConfigs.length > 0 && (
          <div className="px-6 pb-2 shrink-0 bg-white border-b border-gray-200 relative z-20">
            <div className="flex justify-end space-x-3">
              {actionConfigs.map((config) => {
                if (config.type === 'submit') {
                  return (
                    <Button
                      key={config.type}
                      type="button"
                      variant={config.variant}
                      onClick={handleFormSubmitClick}
                      disabled={disabled || isSubmitting}
                    >
                      {isSubmitting ? config.loading : config.label}
                    </Button>
                  );
                } else if (config.type === 'cancel') {
                  return (
                    <Button
                      key={config.type}
                      type="button"
                      variant={config.variant}
                      onClick={handleCancel}
                      disabled={disabled}
                    >
                      {config.label}
                    </Button>
                  );
                } else if (config.type === 'reset') {
                  return (
                    <Button
                      key={config.type}
                      type="button"
                      variant={config.variant}
                      onClick={handleResetClick}
                      disabled={disabled}
                    >
                      {config.label}
                    </Button>
                  );
                }
                return null;
              })}
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

