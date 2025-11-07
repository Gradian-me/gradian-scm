import React, { useMemo } from 'react';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { TableColumn, ColumnWidthMap } from '../types';
import { buildTableColumns } from '../utils';

export interface UseRepeatingTableColumnsOptions {
  fields: any[];
  schemaForColumns: FormSchema | null;
  columnWidths?: ColumnWidthMap;
  renderActionCell?: (row: any, itemId: string | number | undefined, index: number) => React.ReactNode;
  getRowId?: (row: any) => string | number | undefined;
}

export function useRepeatingTableColumns({
  fields,
  schemaForColumns,
  columnWidths,
  renderActionCell,
  getRowId,
}: UseRepeatingTableColumnsOptions): TableColumn[] {
  const baseColumns = useMemo(() => {
    if (!schemaForColumns) {
      return [];
    }

    return buildTableColumns(fields, schemaForColumns, columnWidths);
  }, [columnWidths, fields, schemaForColumns]);

  const columnsWithActions = useMemo(() => {
    if (!renderActionCell) {
      return baseColumns;
    }

    const viewColumn: TableColumn = {
      id: 'actions',
      label: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'center',
      width: 80,
      render: (value: any, row: any, index: number) => {
        const itemId = getRowId?.(row) ?? row?.id ?? value;
        if (!itemId) return null;
        return renderActionCell(row, itemId, index);
      },
    };

    const existingActionIndex = baseColumns.findIndex((column) => column.id === 'actions');
    if (existingActionIndex !== -1) {
      const cloned = [...baseColumns];
      cloned[existingActionIndex] = viewColumn;
      return cloned;
    }

    return [viewColumn, ...baseColumns];
  }, [baseColumns, getRowId, renderActionCell]);

  return columnsWithActions;
}


