// Dynamic Repeating Table Viewer Component
// Displays repeating section data in a table format

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FormSchema, RepeatingTableRendererConfig } from '@/gradian-ui/schema-manager/types/form-schema';
import { resolveFieldById } from '../../form-builder/form-elements/utils/field-resolver';
import { Table, TableColumn, TableConfig, TableAggregations } from '../table';
import { formatNumber, formatCurrency, formatDate } from '../../shared/utils';
import { BadgeViewer } from '../../form-builder/form-elements/utils/badge-viewer';
import { CardWrapper, CardHeader, CardTitle, CardContent } from '../card/components/CardWrapper';
import { TableCardView } from './TableCardView';
import { cn } from '../../shared/utils';

export interface DynamicRepeatingTableViewerProps {
  config: RepeatingTableRendererConfig;
  schema: FormSchema;
  data: any; // The main entity data that contains the repeating section array
  index?: number;
  disableAnimation?: boolean;
  className?: string;
}

/**
 * Get field value from data row
 */
const getFieldValue = (field: any, row: any): any => {
  if (!field || !row) return null;

  // Handle source path if specified
  if (field.source) {
    const path = field.source.split('.');
    let value = row;
    for (const key of path) {
      value = value?.[key];
      if (value === undefined) return null;
    }
    return value;
  }

  // Handle compute function if specified
  if (field.compute && typeof field.compute === 'function') {
    return field.compute(row);
  }

  // Default: use field name
  return row[field.name];
};

/**
 * Format field value for table cell display
 */
const formatFieldValue = (field: any, value: any): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }

  // Use field type
  const displayType = field?.type || 'text';

  // Handle badge fields (checkbox or array types with badge role)
  if (field?.role === 'badge' && Array.isArray(value)) {
    return (
      <BadgeViewer
        field={field}
        value={value}
        badgeVariant="outline"
        animate={true}
      />
    );
  }

  switch (displayType) {
    case 'currency':
      return <span>{formatCurrency(typeof value === 'number' ? value : parseFloat(value) || 0)}</span>;
    case 'percentage':
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return <span>{numValue.toFixed(2)}%</span>;
    case 'number':
      return <span>{formatNumber(typeof value === 'number' ? value : parseFloat(value) || 0)}</span>;
    case 'date':
    case 'datetime-local':
      try {
        const dateValue = typeof value === 'string' ? new Date(value) : value;
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          return <span>{formatDate(dateValue, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>;
        }
        return <span>{String(value)}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'array':
    case 'checkbox':
      if (Array.isArray(value)) {
        return <span>{value.join(', ')}</span>;
      }
      return <span>{String(value)}</span>;
    default:
      return <span>{String(value)}</span>;
  }
};

/**
 * Build table columns from schema fields
 */
const buildTableColumns = (
  fields: any[],
  schema: FormSchema
): TableColumn[] => {
  return fields.map((field) => {
    return {
      id: field.id,
      label: field.label || field.name,
      accessor: field.name,
      sortable: true,
      align: field.type === 'number' || field.type === 'currency' ? 'right' : 'left',
      render: (value, row) => formatFieldValue(field, value),
    };
  });
};

export const DynamicRepeatingTableViewer: React.FC<DynamicRepeatingTableViewerProps> = ({
  config,
  schema,
  data,
  index = 0,
  disableAnimation = false,
  className,
}) => {
  // Find the repeating section in the schema
  const section = schema.sections?.find((s) => s.id === config.sectionId);

  if (!section || !section.isRepeatingSection) {
    return null;
  }

  // Get the repeating section data from the main data object
  // The section ID matches the property name in the data (e.g., "contacts")
  const sectionData: any[] = data[config.sectionId] || [];

  if (!Array.isArray(sectionData)) {
    return null;
  }

  // Get fields for this repeating section
  const sectionFields = schema.fields?.filter(
    (f) => f.sectionId === config.sectionId
  ) || [];

  if (sectionFields.length === 0) {
    return null;
  }

  // Determine which fields to display as columns
  const fieldsToDisplay = useMemo(() => {
    if (config.columns && config.columns.length > 0) {
      // Use specified columns
      return config.columns
        .map((fieldId) => resolveFieldById(schema, fieldId))
        .filter(Boolean);
    }
    // Use all fields from the section
    return sectionFields;
  }, [config.columns, schema, sectionFields]);

  // Build table columns
  const columns = useMemo(
    () => buildTableColumns(fieldsToDisplay, schema),
    [fieldsToDisplay, schema]
  );

  // Get table properties with defaults
  const tableProps = config.tableProperties || {};
  const sortingEnabled = tableProps.sortingEnabled ?? true;
  const paginationEnabled = tableProps.paginationEnabled ?? (sectionData.length > 10);
  const paginationPageSize = tableProps.paginationPageSize || 10;
  const alwaysShowPagination = tableProps.alwaysShowPagination ?? false;
  const showAsCards = tableProps.showAsCards ?? false;
  const cardColumns = tableProps.cardColumns ?? 1;
  const aggregations = tableProps.aggregations || [];
  const aggregationAlignment = tableProps.aggregationAlignment ?? 'end';
  const aggregationColumns = tableProps.aggregationColumns ?? 3;

  // Build table config
  const tableConfig: TableConfig = useMemo(
    () => ({
      id: `table-${config.sectionId}`,
      columns,
      data: sectionData,
      pagination: {
        enabled: paginationEnabled,
        pageSize: paginationPageSize,
        showPageSizeSelector: true,
        pageSizeOptions: [5, 10, 25, 50],
        alwaysShow: alwaysShowPagination,
      },
      sorting: {
        enabled: sortingEnabled,
      },
      filtering: {
        enabled: false,
      },
      selection: {
        enabled: false,
      },
      emptyState: {
        message: section.repeatingConfig?.emptyMessage || 'No items found',
      },
      loading: false,
      striped: true,
      hoverable: true,
      bordered: true,
    }),
    [columns, sectionData, sortingEnabled, paginationEnabled, paginationPageSize, alwaysShowPagination, section]
  );

  const colSpan = config.colSpan || 1;
  const title = config.title || section.title;
  const description = config.description || section.description;

  // Track window size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine if we should show cards
  const shouldShowCards = showAsCards && isMobile;

  // For cards view, we'll show all data (pagination can be added later if needed)
  // The table component handles pagination, but for simplicity in cards view,
  // we'll show all items. If pagination is needed in cards, we can add it later.
  const dataForCards = useMemo(() => {
    return shouldShowCards ? sectionData : [];
  }, [shouldShowCards, sectionData]);

  return (
    <motion.div
      initial={disableAnimation ? false : { opacity: 0, y: 20 }}
      animate={disableAnimation ? false : { opacity: 1, y: 0 }}
      transition={disableAnimation ? {} : {
        duration: 0.3,
        delay: index * 0.1
      }}
      className={cn(
        colSpan === 2 && "lg:col-span-2",
        className
      )}
    >
      <CardWrapper
        config={{
          id: `table-card-${config.sectionId}`,
          name: title,
          styling: {
            variant: 'default',
            size: 'md'
          }
        }}
        className="h-auto bg-white border border-gray-200 shadow-sm"
      >
        <CardHeader className="bg-gray-50/50 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              {sectionData.length}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1.5">{description}</p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {shouldShowCards ? (
            <>
              <TableCardView
                data={dataForCards}
                columns={columns}
                cardColumns={cardColumns}
                index={index}
                disableAnimation={disableAnimation}
              />
              {aggregations.length > 0 && (
                <TableAggregations
                  data={sectionData}
                  columns={columns}
                  aggregations={aggregations}
                  alignment={aggregationAlignment}
                  gridColumns={aggregationColumns}
                />
              )}
            </>
          ) : (
            <>
              <Table config={tableConfig} />
              {aggregations.length > 0 && (
                <TableAggregations
                  data={sectionData}
                  columns={columns}
                  aggregations={aggregations}
                  alignment={aggregationAlignment}
                  gridColumns={aggregationColumns}
                />
              )}
            </>
          )}
        </CardContent>
      </CardWrapper>
    </motion.div>
  );
};

DynamicRepeatingTableViewer.displayName = 'DynamicRepeatingTableViewer';

