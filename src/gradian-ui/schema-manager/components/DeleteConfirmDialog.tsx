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
      title={`Set ${type === 'field' ? 'Field' : 'Section'} Inactive`}
      message={
        type === 'field'
          ? 'Are you sure you want to set this field as inactive? It will be hidden from the form but can be reactivated later.'
          : 'Are you sure you want to set this section as inactive? All fields in this section will also be set as inactive, but can be reactivated later.'
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

