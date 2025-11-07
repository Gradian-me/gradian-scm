import React from 'react';
import { TableColumn } from '../types';
import { formatFieldValue } from './field-formatters';
import { ColumnWidthMap } from '../types';
import { resolveColumnWidth, shouldAllowWrap } from './column-config';

export const buildTableColumns = (
  fields: any[],
  schema: any,
  columnWidths?: ColumnWidthMap
): TableColumn[] => {
  return fields.map((field) => {
    const widthSettings = resolveColumnWidth(field, columnWidths);
    const align =
      field?.type === 'number' || field?.type === 'currency' || field?.type === 'percentage'
        ? 'right'
        : 'left';

    return {
      id: field.id,
      label: field.label || field.name,
      accessor: field.name,
      sortable: true,
      align,
      maxWidth: widthSettings.maxWidth,
      width: widthSettings.width,
      allowWrap: shouldAllowWrap(field, widthSettings),
      render: (value: any, row: any) => formatFieldValue(field, value, row),
    } as TableColumn;
  });
};


