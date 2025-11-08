// Table Body Component

import React from 'react';
import { TableColumn } from '../types';
import { getCellValue } from '../utils';
import { cn } from '../../../shared/utils';
import { extractLabels } from '../../../form-builder/form-elements/utils/option-normalizer';

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
      striped && index % 2 === 1 && 'bg-gray-50',
      hoverable && 'hover:bg-gray-100 cursor-pointer',
      isSelected && 'bg-blue-50',
      bordered && 'border-b border-gray-200'
    );

  const tdClasses = (column: TableColumn<T>, rowIndex: number, isSelected: boolean) =>
    cn(
      'px-4 py-3 text-xs text-gray-900',
      // Use better word breaking for columns with maxWidth - break on words, not characters
      column.maxWidth && 'wrap-break-word',
      column.align === 'center' && 'text-center',
      column.align === 'right' && 'text-right',
      // For sticky columns, match the row background for zebra striping and selection
      column.sticky === 'left' && 'sticky left-0 z-10',
      column.sticky === 'right' && 'sticky right-0 z-10',
      // Set background for sticky columns based on row state (selected > striped > default)
      column.sticky === 'left' && (isSelected ? 'bg-blue-50' : (striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white')),
      column.sticky === 'right' && (isSelected ? 'bg-blue-50' : (striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white')),
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

              // Allow wrapping when explicitly enabled or when maxWidth is provided (backward compatible)
              const shouldAllowWrapping = column.allowWrap ?? !!column.maxWidth;

              return (
                <td
                  key={column.id}
                  className={cn(tdClasses(column, rowIndex, isSelected), cellClassName)}
                  style={{
                    // Only set width if explicitly provided, otherwise let content determine width
                    width: column.width ? (typeof column.width === 'number' ? `${column.width}px` : column.width) : undefined,
                    // Only set maxWidth to prevent columns from being too wide
                    maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
                    // Actions column should always be middle-aligned, others with maxWidth should be top-aligned for wrapping
                    verticalAlign: column.id === 'actions' ? 'middle' : (shouldAllowWrapping ? 'top' : 'middle'),
                    // Ensure width constraints are strictly applied
                    boxSizing: 'border-box',
                    // Better word breaking for wrapped text
                    wordBreak: shouldAllowWrapping ? 'break-word' : 'normal',
                    overflowWrap: shouldAllowWrapping ? 'break-word' : 'normal',
                    // Allow wrapping for badge columns or columns with maxWidth
                    whiteSpace: shouldAllowWrapping ? 'normal' : 'nowrap',
                    // Prevent horizontal overflow, allow vertical growth for wrapped content
                    overflowX: 'hidden',
                    overflowY: shouldAllowWrapping ? 'visible' : 'hidden',
                  }}
                  onClick={() => handleCellClick(value, row, column, rowIndex)}
                >
                  <div 
                    className={shouldAllowWrapping ? "min-w-0 w-full" : ""} // Allow shrinking and full width if wrapping is allowed
                    style={{
                      // Limit to 3 lines max for wrapped text columns with ellipsis
                      // For badge columns, we rely on BadgeViewer's flex-wrap to handle wrapping
                      ...(column.maxWidth ? {
                        // Don't apply line clamp - let content wrap naturally
                        overflow: 'visible',
                      } : {})
                    }}
                >
                  {column.render ? (
                    column.render(value, row, rowIndex)
                  ) : (
                    <span className="block">
                      {(() => {
                        if (value === null || value === undefined) {
                          return '—';
                        }
                        const isStructured = Array.isArray(value) || (typeof value === 'object' && value !== null);
                        if (isStructured) {
                          const labels = extractLabels(value);
                          if (labels.length > 0) {
                            return labels.join(', ');
                          }
                          if (Array.isArray(value)) {
                            return value.map(entry => {
                              if (entry && typeof entry === 'object') {
                                return entry.label || entry.name || entry.id || JSON.stringify(entry);
                              }
                              return String(entry);
                            }).join(', ');
                          }
                          return JSON.stringify(value);
                        }
                        return String(value);
                      })()}
                    </span>
                  )}
                  </div>
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

