// Modal Component

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { ModalProps } from '../types';
import { cn } from '../../shared/utils';
import { Button } from '../../form-builder/form-elements/components/Button';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  const modalClasses = cn(
    'bg-white shadow-xl overflow-y-auto',
    'rounded-none sm:rounded-2xl', // No rounded corners on mobile, rounded on desktop
    'h-screen w-screen sm:h-auto sm:w-auto', // Full screen on mobile, auto on desktop
    'mx-0 sm:mx-4', // No margin on mobile, margin on desktop
    'max-h-screen sm:max-h-[90vh]', // Full height on mobile, constrained on desktop
    sizeClasses[size],
    className
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={modalClasses} {...props}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="mt-4">
          {children}
        </div>
        {showCloseButton && (
          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

Modal.displayName = 'Modal';
