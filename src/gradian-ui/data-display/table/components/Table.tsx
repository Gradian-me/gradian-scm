// Table Component

import React from 'react';
import { motion } from 'framer-motion';
import { TableProps, TableColumn } from '../types';
import { useTable } from '../hooks/useTable';
import { getCellValue } from '../utils';
import { cn } from '../../../shared/utils';
import { TableLoadingState } from './TableLoadingState';
import { TableEmptyState } from './TableEmptyState';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TablePagination } from './TablePagination';

export function Table<T = any>({
  config,
  className,
  onRowClick,
  onCellClick,
}: TableProps<T>) {
  const {
    state,
    processedData,
    totalPages,
    totalItems,
    handleSort,
    goToPage,
    setPageSize,
    toggleRowSelection,
    selectAll,
    clearSelection,
  } = useTable({ config });

  const tableClasses = cn(
    'w-full border-collapse',
    config.compact && 'text-sm',
    className
  );

  const containerClasses = cn(
    'overflow-x-auto',
    config.bordered && 'border border-gray-200 rounded-lg m-2',
    className
  );

  if (config.loading) {
    return <TableLoadingState />;
  }

  if (processedData.length === 0) {
    return (
      <TableEmptyState
        message={config.emptyState?.message || 'No data available'}
        icon={config.emptyState?.icon}
      />
    );
  }

  return (
    <div className={containerClasses}>
      <table className={tableClasses}>
        <TableHeader
          columns={config.columns}
          sortBy={state.sortBy}
          sortDirection={state.sortDirection}
          onSort={config.sorting?.enabled ? handleSort : undefined}
          stickyHeader={config.stickyHeader}
          selectionEnabled={config.selection?.enabled}
          allSelected={state.selectedRows.size === processedData.length && processedData.length > 0}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          striped={config.striped}
          bordered={config.bordered}
        />
        <TableBody
          data={processedData}
          columns={config.columns}
          selectedRows={state.selectedRows}
          onRowClick={onRowClick}
          onCellClick={onCellClick}
          onRowSelect={config.selection?.enabled ? toggleRowSelection : undefined}
          striped={config.striped}
          hoverable={config.hoverable}
          bordered={config.bordered}
        />
      </table>

      {config.pagination?.enabled && (config.pagination.alwaysShow || totalPages > 1) && (
        <TablePagination
          currentPage={state.page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={state.pageSize}
          pageSizeOptions={config.pagination.pageSizeOptions || [10, 25, 50, 100]}
          showPageSizeSelector={config.pagination.showPageSizeSelector}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}

Table.displayName = 'Table';

