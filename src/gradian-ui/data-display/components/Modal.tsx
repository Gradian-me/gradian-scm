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
  closeOnOutsideClick = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'md:max-w-4xl',
    lg: 'lg:max-w-7xl',
    xl: 'xl:max-w-[88rem]',
    full: 'max-w-full mx-4',
  };

  const modalClasses = cn(
    'bg-white shadow-xl overflow-hidden',
    'rounded-none sm:rounded-2xl', // No rounded corners on mobile, rounded on desktop
    'h-screen w-screen sm:h-auto sm:w-auto', // Full screen on mobile, auto on desktop
    'mx-0 md:mx-2', // No margin on mobile, margin on desktop
    'max-h-screen sm:max-h-[95vh]', // Full height on mobile, constrained on desktop
    'flex flex-col', // Add flex column layout
    sizeClasses[size],
    className
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={modalClasses} 
        onInteractOutside={(e) => {
          if (!closeOnOutsideClick) {
            e.preventDefault();
          }
        }}
        {...props}
      >
        {(title || description) && (
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="flex-1 sm:px-2 px-4 pb-6 overflow-y-auto">
          {children}
        </div>
        {showCloseButton && (
          <div className="flex justify-end px-6 pb-6 pt-4 border-t shrink-0">
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
