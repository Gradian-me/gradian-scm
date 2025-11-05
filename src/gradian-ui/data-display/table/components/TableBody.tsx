// Table Body Component

import React from 'react';
import { TableColumn } from '../types';
import { getCellValue } from '../utils';
import { cn } from '../../../shared/utils';

export interface TableBodyProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  selectedRows: Set<number>;
  onRowClick?: (row: T, index: number) => void;
  onCellClick?: (value: any, row: T, column: TableColumn<T>, index: number) => void;
  onRowSelect?: (index: number) => void;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  selectionEnabled?: boolean;
}

export function TableBody<T = any>({
  data,
  columns,
  selectedRows,
  onRowClick,
  onCellClick,
  onRowSelect,
  striped,
  hoverable,
  bordered,
  selectionEnabled,
}: TableBodyProps<T>) {
  const trClasses = (index: number, isSelected: boolean) =>
    cn(
      'transition-colors',
      striped && index % 2 === 0 && 'bg-gray-50',
      hoverable && 'hover:bg-gray-100 cursor-pointer',
      isSelected && 'bg-blue-50',
      bordered && 'border-b border-gray-200'
    );

  const tdClasses = (column: TableColumn<T>, rowIndex: number, isSelected: boolean) =>
    cn(
      'px-4 py-3 text-xs text-gray-900',
      // Only apply whitespace-nowrap if maxWidth is not set (to allow wrapping when maxWidth is set)
      !column.maxWidth && 'whitespace-nowrap',
      column.maxWidth && 'break-words', // Allow word wrapping when maxWidth is set
      column.align === 'center' && 'text-center',
      column.align === 'right' && 'text-right',
      // For sticky columns, match the row background for zebra striping and selection
      column.sticky === 'left' && 'sticky left-0 z-10',
      column.sticky === 'right' && 'sticky right-0 z-10',
      // Set background for sticky columns based on row state (selected > striped > default)
      column.sticky === 'left' && (isSelected ? 'bg-blue-50' : (striped && rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white')),
      column.sticky === 'right' && (isSelected ? 'bg-blue-50' : (striped && rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white')),
      // For non-sticky columns, use transparent to show row background
      !column.sticky && striped && 'bg-transparent',
      bordered && 'border-r border-gray-200 last:border-r-0'
    );

  const handleRowClick = (row: T, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const handleCellClick = (
    value: any,
    row: T,
    column: TableColumn<T>,
    index: number
  ) => {
    if (onCellClick) {
      onCellClick(value, row, column, index);
    }
  };

  const handleRowSelect = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRowSelect) {
      onRowSelect(index);
    }
  };

  return (
    <tbody>
      {data.map((row, rowIndex) => {
        const isSelected = selectedRows.has(rowIndex);
        return (
          <tr
            key={rowIndex}
            className={trClasses(rowIndex, isSelected)}
            onClick={() => handleRowClick(row, rowIndex)}
          >
            {selectionEnabled && (
              <td className="w-12 px-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => handleRowSelect(rowIndex, e)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
            )}
            {columns.map((column) => {
              const value = getCellValue(row, column);
              const cellClassName =
                typeof column.cellClassName === 'function'
                  ? column.cellClassName(row, rowIndex)
                  : column.cellClassName;

              return (
                <td
                  key={column.id}
                  className={cn(tdClasses(column, rowIndex, isSelected), cellClassName)}
                  style={{
                    minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
                    maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
                    width: column.width ? (typeof column.width === 'number' ? `${column.width}px` : column.width) : undefined,
                    // Actions column should always be middle-aligned, others with maxWidth should be top-aligned for wrapping
                    verticalAlign: column.id === 'actions' ? 'middle' : (column.maxWidth ? 'top' : 'middle'),
                    // Ensure width constraints are strictly applied
                    boxSizing: 'border-box',
                  }}
                  onClick={() => handleCellClick(value, row, column, rowIndex)}
                >
                  {column.render ? (
                    column.render(value, row, rowIndex)
                  ) : (
                    <span>{value != null ? String(value) : '—'}</span>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

TableBody.displayName = 'TableBody';

