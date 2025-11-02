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

  const tdClasses = (column: TableColumn<T>) =>
    cn(
      'px-4 py-3 whitespace-nowrap text-sm text-gray-900',
      column.align === 'center' && 'text-center',
      column.align === 'right' && 'text-right',
      column.sticky === 'left' && 'sticky left-0 z-10 bg-white',
      column.sticky === 'right' && 'sticky right-0 z-10 bg-white',
      striped && 'bg-transparent',
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
                  className={cn(tdClasses(column), cellClassName)}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
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

