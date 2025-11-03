'use client';

import { ConfirmationMessage } from '@/gradian-ui/form-builder';

interface ResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ResetDialog({ open, onOpenChange, onConfirm }: ResetDialogProps) {
  return (
    <ConfirmationMessage
      isOpen={open}
      onOpenChange={onOpenChange}
      title="Reset Changes"
      message="Are you sure you want to reset all changes? This will discard all unsaved modifications and restore the schema to its last saved state."
      variant="warning"
      buttons={[
        {
          label: 'Cancel',
          variant: 'outline',
          action: () => onOpenChange(false),
        },
        {
          label: 'Reset Changes',
          variant: 'destructive',
          action: onConfirm,
        },
      ]}
    />
  );
}

