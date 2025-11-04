// Table Card View Component
// Shows table rows as cards in responsive mode

import React from 'react';
import { motion } from 'framer-motion';
import { TableColumn } from '../table';
import { getCellValue } from '../table/utils';
import { cn } from '../../shared/utils';

export interface TableCardViewProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  cardColumns?: 1 | 2 | 3;
  index?: number;
  disableAnimation?: boolean;
}

export function TableCardView<T = any>({
  data,
  columns,
  cardColumns = 1,
  index = 0,
  disableAnimation = false,
}: TableCardViewProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No items found
      </div>
    );
  }

  // Separate action columns from data columns
  const actionColumns = columns.filter(col => col.id === 'actions');
  const dataColumns = columns.filter(col => col.id !== 'actions');

  // Grid classes for key-value pairs within each card
  const gridClasses = cn(
    "grid gap-3",
    cardColumns === 1 && "grid-cols-1",
    cardColumns === 2 && "grid-cols-2",
    cardColumns === 3 && "grid-cols-2 md:grid-cols-3"
  );

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      {data.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={disableAnimation ? false : { opacity: 0, y: 10 }}
          animate={disableAnimation ? false : { opacity: 1, y: 0 }}
          transition={disableAnimation ? {} : {
            duration: 0.2,
            delay: rowIndex * 0.05
          }}
          className={cn(
            "bg-white border border-gray-200 rounded-lg shadow-sm p-4",
            "hover:shadow-md transition-shadow"
          )}
        >
          <div className={gridClasses}>
            {dataColumns.map((column) => {
              const value = getCellValue(row, column);
              const cellContent = column.render
                ? column.render(value, row, rowIndex)
                : (value != null ? String(value) : '—');

              return (
                <div
                  key={column.id}
                  className="flex flex-col gap-1 min-w-0"
                >
                  <span className="text-sm font-medium text-gray-400">
                    {column.label}:
                  </span>
                  <div className="text-sm text-gray-900 break-words min-w-0">
                    {cellContent}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Action buttons at the bottom of card */}
          {actionColumns.length > 0 && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              {actionColumns.map((column) => {
                const value = getCellValue(row, column);
                return (
                  <div key={column.id}>
                    {column.render ? column.render(value, row, rowIndex) : null}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

TableCardView.displayName = 'TableCardView';

