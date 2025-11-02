// Table Header Component

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { TableColumn } from '../types';
import { cn } from '../../../shared/utils';

export interface TableHeaderProps<T = any> {
  columns: TableColumn<T>[];
  sortBy?: string | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  stickyHeader?: boolean;
  selectionEnabled?: boolean;
  allSelected?: boolean;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  striped?: boolean;
  bordered?: boolean;
}

export function TableHeader<T = any>({
  columns,
  sortBy,
  sortDirection,
  onSort,
  stickyHeader,
  selectionEnabled,
  allSelected,
  onSelectAll,
  onClearSelection,
  striped,
  bordered,
}: TableHeaderProps<T>) {
  const headerClasses = cn(
    'bg-gray-50',
    striped && 'bg-gray-50',
    bordered && 'border-b border-gray-200'
  );

  const thClasses = (column: TableColumn<T>) =>
    cn(
      'px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider',
      column.align === 'center' && 'text-center',
      column.align === 'right' && 'text-right',
      column.sortable && onSort && 'cursor-pointer select-none hover:bg-gray-100',
      column.sticky === 'left' && 'sticky left-0 z-10 bg-gray-50',
      column.sticky === 'right' && 'sticky right-0 z-10 bg-gray-50',
      stickyHeader && 'sticky top-0 z-20',
      bordered && 'border-r border-gray-200 last:border-r-0'
    );

  const handleHeaderClick = (column: TableColumn<T>) => {
    if (column.sortable && onSort) {
      onSort(column.id);
    }
  };

  const handleSelectAllClick = () => {
    if (allSelected) {
      onClearSelection?.();
    } else {
      onSelectAll?.();
    }
  };

  return (
    <thead className={headerClasses}>
      <tr>
        {selectionEnabled && (
          <th className={cn('w-12 px-2', stickyHeader && 'sticky top-0 z-20 bg-gray-50')}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAllClick}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.id}
            className={thClasses(column)}
            style={{
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
            }}
            onClick={() => handleHeaderClick(column)}
          >
            <div className="flex items-center justify-between gap-2">
              {column.headerRender ? (
                column.headerRender()
              ) : (
                <span>{column.label}</span>
              )}
              {column.sortable && onSort && (
                <span className="shrink-0">
                  {sortBy === column.id ? (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    )
                  ) : (
                    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

TableHeader.displayName = 'TableHeader';

