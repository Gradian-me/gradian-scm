'use client';

import { ConfirmationMessage } from '@/gradian-ui/form-builder';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'field' | 'section';
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, onOpenChange, type, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <ConfirmationMessage
      isOpen={open}
      onOpenChange={onOpenChange}
      title={`Delete ${type === 'field' ? 'Field' : 'Section'}`}
      message={
        type === 'field'
          ? 'Are you sure you want to delete this field?'
          : 'Are you sure you want to delete this section? All fields in this section will be removed.'
      }
      variant="destructive"
      buttons={[
        {
          label: 'Cancel',
          variant: 'outline',
          action: () => onOpenChange(false),
        },
        {
          label: 'Delete',
          variant: 'destructive',
          icon: 'Trash2',
          action: onConfirm,
        },
      ]}
    />
  );
}

