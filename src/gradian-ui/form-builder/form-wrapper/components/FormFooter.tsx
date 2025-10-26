// Form Footer Component

import React from 'react';
import { FormFooterProps } from '../types';
import { FormActions } from './FormActions';
import { cn } from '../../../shared/utils';

export const FormFooter: React.FC<FormFooterProps> = ({
  actions,
  showReset = true,
  showCancel = false,
  onSubmit,
  onReset,
  onCancel,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}) => {
  const defaultActions = [];

  if (onSubmit) {
    defaultActions.push({
      type: 'submit' as const,
      label: 'Submit',
      variant: 'primary' as const,
      disabled: disabled || loading,
      loading,
      onClick: onSubmit,
    });
  }

  if (showReset && onReset) {
    defaultActions.push({
      type: 'reset' as const,
      label: 'Reset',
      variant: 'secondary' as const,
      disabled: disabled || loading,
      onClick: onReset,
    });
  }

  if (showCancel && onCancel) {
    defaultActions.push({
      type: 'cancel' as const,
      label: 'Cancel',
      variant: 'ghost' as const,
      disabled: disabled || loading,
      onClick: onCancel,
    });
  }

  // Convert actions object to array format if it's an object
  const convertActionsToArray = (actionsConfig: any) => {
    if (!actionsConfig) return defaultActions;
    
    // If it's already an array, return it
    if (Array.isArray(actionsConfig)) return actionsConfig;
    
    // If it's an object, convert it to array format
    const actionsArray = [];
    
    if (actionsConfig.submit) {
      actionsArray.push({
        type: 'submit' as const,
        label: actionsConfig.submit.label || 'Submit',
        variant: actionsConfig.submit.variant || 'primary',
        disabled: actionsConfig.submit.disabled || disabled || loading,
        loading,
        onClick: onSubmit,
      });
    }
    
    if (actionsConfig.reset && showReset) {
      actionsArray.push({
        type: 'reset' as const,
        label: actionsConfig.reset.label || 'Reset',
        variant: actionsConfig.reset.variant || 'secondary',
        disabled: actionsConfig.reset.disabled || disabled || loading,
        onClick: onReset,
      });
    }
    
    if (actionsConfig.cancel && showCancel) {
      actionsArray.push({
        type: 'cancel' as const,
        label: actionsConfig.cancel.label || 'Cancel',
        variant: actionsConfig.cancel.variant || 'ghost',
        disabled: actionsConfig.cancel.disabled || disabled || loading,
        onClick: onCancel || actionsConfig.cancel.onClick,
      });
    }
    
    return actionsArray.length > 0 ? actionsArray : defaultActions;
  };

  const finalActions = convertActionsToArray(actions);

  const footerClasses = cn(
    'flex items-center justify-end space-x-4 pt-8 pb-4 border-t border-gray-200',
    className
  );

  return (
    <div className={footerClasses} {...props}>
      {children || <FormActions actions={finalActions} />}
    </div>
  );
};

FormFooter.displayName = 'FormFooter';
