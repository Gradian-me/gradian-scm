'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { ScrollArea } from './scroll-area';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'lg' }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm w-full h-full max-h-screen',
    md: 'max-w-md w-full h-full max-h-screen',
    lg: 'max-w-4xl w-full h-full max-h-screen',
    xl: 'max-w-6xl w-full h-full max-h-screen',
    '2xl': 'max-w-7xl w-full h-full max-h-screen',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} max-h-[95vh] p-0 w-[95vw] sm:w-full`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-8">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
