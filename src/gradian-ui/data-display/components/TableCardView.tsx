// Table Card View Component
// Shows table rows as cards in responsive mode

import React from 'react';
import { TableCard } from '../table/components/TableCard';
import { TableColumn } from '../table/types';

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
  cardColumns = 2,
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

  const actionColumns = columns.filter(col => col.id === 'actions');
  const dataColumns = columns.filter(col => col.id !== 'actions');

  return (
    <div className="grid grid-cols-1 gap-2 p-2 lg:p-4">
      {data.map((row, rowIndex) => (
        <TableCard
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          dataColumns={dataColumns}
          actionColumns={actionColumns}
          contentColumns={cardColumns}
          disableAnimation={disableAnimation}
        />
      ))}
    </div>
  );
}

TableCardView.displayName = 'TableCardView';

