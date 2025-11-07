import React from 'react';
import { Table } from './Table';
import { TableAggregations, AggregationConfig } from './TableAggregations';
import { TableCardView } from '../../components/TableCardView';
import { TableColumn, TableConfig } from '../types';

export interface TableWrapperProps<T = any> {
  tableConfig: TableConfig<T>;
  columns: TableColumn<T>[];
  data: T[];
  showCards: boolean;
  cardColumns?: 1 | 2 | 3;
  disableAnimation?: boolean;
  index?: number;
  aggregations?: AggregationConfig[];
  aggregationAlignment?: 'start' | 'center' | 'end';
  aggregationColumns?: 1 | 2 | 3;
}

export function TableWrapper<T = any>({
  tableConfig,
  columns,
  data,
  showCards,
  cardColumns = 2,
  disableAnimation = false,
  index = 0,
  aggregations = [],
  aggregationAlignment = 'end',
  aggregationColumns = 3,
}: TableWrapperProps<T>) {
  return (
    <>
      {showCards ? (
        <>
          <TableCardView
            data={data}
            columns={columns}
            cardColumns={cardColumns}
            disableAnimation={disableAnimation}
            index={index}
          />
          {aggregations.length > 0 && (
            <TableAggregations
              data={data}
              columns={columns}
              aggregations={aggregations}
              alignment={aggregationAlignment}
              gridColumns={aggregationColumns}
            />
          )}
        </>
      ) : (
        <>
          <div className="mx-0 min-w-0">
            <Table config={tableConfig} />
          </div>
          {aggregations.length > 0 && (
            <TableAggregations
              data={data}
              columns={columns}
              aggregations={aggregations}
              alignment={aggregationAlignment}
              gridColumns={aggregationColumns}
            />
          )}
        </>
      )}
    </>
  );
}

TableWrapper.displayName = 'TableWrapper';


