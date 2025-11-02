// Table Empty State Component

import React from 'react';
import { FileX } from 'lucide-react';

export interface TableEmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export function TableEmptyState({ message, icon }: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon || <FileX className="h-12 w-12 text-gray-400 mb-4" />}
      <p className="text-gray-500 text-sm">{message || 'No data available'}</p>
    </div>
  );
}

TableEmptyState.displayName = 'TableEmptyState';

