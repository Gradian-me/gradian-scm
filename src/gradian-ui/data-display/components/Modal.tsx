// Modal Component

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
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
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  const modalClasses = cn(
    'bg-white shadow-xl overflow-hidden',
    'rounded-none sm:rounded-2xl',
    'h-screen w-screen sm:h-[90vh] sm:w-auto',
    'mx-0 sm:mx-4',
    'max-h-screen sm:max-h-[90vh]',
    'flex flex-col min-h-0',
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
        <ScrollArea className="flex-1 px-6 pb-6 h-full">
          {children}
        </ScrollArea>
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
