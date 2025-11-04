// Dynamic Repeating Table Viewer Component
// Displays repeating section data in a table format

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FormSchema, RepeatingTableRendererConfig, DataRelation } from '@/gradian-ui/schema-manager/types/form-schema';
import { resolveFieldById, getValueByRole } from '../../form-builder/form-elements/utils/field-resolver';
import { Table, TableColumn, TableConfig, TableAggregations } from '../table';
import { formatNumber, formatCurrency, formatDate } from '../../shared/utils';
import { BadgeViewer } from '../../form-builder/form-elements/utils/badge-viewer';
import { CardWrapper, CardHeader, CardTitle, CardContent } from '../card/components/CardWrapper';
import { TableCardView } from './TableCardView';
import { cn } from '../../shared/utils';
import { apiRequest } from '@/shared/utils/api';
import { Button } from '../../../components/ui/button';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { Badge } from '../../form-builder/form-elements/components/Badge';
import { getBadgeConfig, mapBadgeColorToVariant } from '../utils';

export interface DynamicRepeatingTableViewerProps {
  config: RepeatingTableRendererConfig;
  schema: FormSchema;
  data: any; // The main entity data that contains the repeating section array
  index?: number;
  disableAnimation?: boolean;
  className?: string;
  sourceSchemaId?: string; // Source schema ID for relation-based tables
  sourceId?: string; // Source entity ID for relation-based tables
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
const formatFieldValue = (field: any, value: any, row?: any): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }

  // Handle picker fields - check for resolved data
  if (field?.type === 'picker' && field.targetSchema && row) {
    // If the value is {id, label} format, use the label
    if (typeof value === 'object' && value !== null && value.id && value.label) {
      return <span>{String(value.label)}</span>;
    }
    
    // Check if resolved data exists
    const resolvedKey = `_${field.name}_resolved`;
    const resolvedData = row[resolvedKey];
    if (resolvedData) {
      // Use resolved label if available (from target schema's title role), otherwise fallback to name/title
      const displayValue = resolvedData._resolvedLabel || resolvedData.name || resolvedData.title || value;
      return <span>{String(displayValue)}</span>;
    }
    // If no resolved data, just show the value (might be an ID)
    return <span>{String(value)}</span>;
  }

  // Use field type
  const displayType = field?.type || 'text';

  // Handle status role fields - display as Badge component
  if (field?.role === 'status') {
    const statusOptions = field.options || [];
    const badgeConfig = getBadgeConfig(String(value), statusOptions);
    return (
      <div className="inline-flex">
        <Badge variant={mapBadgeColorToVariant(badgeConfig.color)} className="inline-flex items-center gap-1 px-2 py-1 text-xs w-auto">
          {badgeConfig.icon && <IconRenderer iconName={badgeConfig.icon} className="h-3 w-3" />}
          <span>{badgeConfig.label}</span>
        </Badge>
      </div>
    );
  }

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
      render: (value, row) => formatFieldValue(field, value, row),
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
  sourceSchemaId,
  sourceId,
}) => {
  const router = useRouter();
  
  // Check if this is a relation-based table
  const isRelationBased = !!(config.targetSchema && config.relationTypeId);
  const targetSchema = config.targetSchema;
  const relationTypeId = config.relationTypeId;
  
  // Determine which schema ID to use for navigation (target schema for relation-based, or current schema for non-relation-based)
  const navigationSchemaId = isRelationBased && targetSchema ? targetSchema : schema.id;
  
  // Get source schema ID and source ID from props or from data
  const effectiveSourceSchemaId = sourceSchemaId || schema.id;
  const effectiveSourceId = sourceId || data?.id;

  // State for relation-based tables
  const [relatedEntities, setRelatedEntities] = useState<any[]>([]);
  const [isLoadingRelations, setIsLoadingRelations] = useState(false);
  const [targetSchemaData, setTargetSchemaData] = useState<FormSchema | null>(null);
  const [isLoadingTargetSchema, setIsLoadingTargetSchema] = useState(false);

  // Fetch target schema for relation-based tables
  useEffect(() => {
    if (isRelationBased && targetSchema) {
      setIsLoadingTargetSchema(true);
      const fetchTargetSchema = async () => {
        try {
          const response = await apiRequest<FormSchema>(`/api/schemas/${targetSchema}`);
          if (response.success && response.data) {
            setTargetSchemaData(response.data);
          }
        } catch (error) {
          console.error('Error fetching target schema:', error);
        } finally {
          setIsLoadingTargetSchema(false);
        }
      };
      fetchTargetSchema();
    }
  }, [isRelationBased, targetSchema]);

  // Fetch relations and related entities for relation-based tables
  const fetchRelations = useCallback(async () => {
    if (!isRelationBased || !effectiveSourceId || !targetSchema || !relationTypeId) {
      return;
    }
    
    setIsLoadingRelations(true);
    try {
      // Ensure target schema is loaded (fetch if not available)
      let schemaToUse = targetSchemaData;
      if (!schemaToUse && targetSchema) {
        try {
          const schemaResponse = await apiRequest<FormSchema>(`/api/schemas/${targetSchema}`);
          if (schemaResponse.success && schemaResponse.data) {
            schemaToUse = schemaResponse.data;
          }
        } catch (error) {
          console.error('Error fetching target schema in fetchRelations:', error);
        }
      }
      
      // Fetch relations
      const relationsResponse = await apiRequest<DataRelation[]>(
        `/api/relations?sourceSchema=${effectiveSourceSchemaId}&sourceId=${effectiveSourceId}&relationTypeId=${relationTypeId}&targetSchema=${targetSchema}`
      );
      
      if (relationsResponse.success && relationsResponse.data) {
        const relationsList = Array.isArray(relationsResponse.data) 
          ? relationsResponse.data 
          : [];
        
        // Fetch related entities
        const entitiesPromises = relationsList.map(async (relation: DataRelation) => {
          const entityResponse = await apiRequest<any>(`/api/data/${targetSchema}/${relation.targetId}`);
          if (!entityResponse.success || !entityResponse.data) {
            return null;
          }
          
          let entity = entityResponse.data;
          
          // Resolve picker fields if target schema is available
          if (schemaToUse && schemaToUse.fields) {
            const pickerFields = schemaToUse.fields.filter(
              (field: any) => field.type === 'picker' && field.targetSchema && entity[field.name]
            );
            
            // Resolve each picker field
            const resolvedPromises = pickerFields.map(async (field: any) => {
              const fieldValue = entity[field.name];
              if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
                try {
                  // Fetch the referenced entity
                  const resolvedResponse = await apiRequest<any>(`/api/data/${field.targetSchema}/${fieldValue}`);
                  if (resolvedResponse.success && resolvedResponse.data) {
                    const resolvedEntity = resolvedResponse.data;
                    
                    // Fetch the target schema to get the title role
                    let targetSchemaForPicker: FormSchema | null = null;
                    try {
                      const targetSchemaResponse = await apiRequest<FormSchema>(`/api/schemas/${field.targetSchema}`);
                      if (targetSchemaResponse.success && targetSchemaResponse.data) {
                        targetSchemaForPicker = targetSchemaResponse.data;
                      }
                    } catch (schemaError) {
                      console.error(`Error fetching target schema for picker field ${field.name}:`, schemaError);
                    }
                    
                    // Get the label using the target schema's title role
                    let resolvedLabel = resolvedEntity.name || resolvedEntity.title || fieldValue;
                    if (targetSchemaForPicker) {
                      const titleByRole = getValueByRole(targetSchemaForPicker, resolvedEntity, 'title');
                      if (titleByRole && titleByRole.trim() !== '') {
                        resolvedLabel = titleByRole;
                      }
                    }
                    
                    // Store resolved data with the pattern _fieldName_resolved
                    entity[`_${field.name}_resolved`] = {
                      ...resolvedEntity,
                      _resolvedLabel: resolvedLabel
                    };
                  }
                } catch (error) {
                  console.error(`Error resolving picker field ${field.name}:`, error);
                }
              }
            });
            
            await Promise.all(resolvedPromises);
          }
          
          return entity;
        });
        
        const entities = await Promise.all(entitiesPromises);
        setRelatedEntities(entities.filter(e => e !== null));
      }
    } catch (error) {
      console.error('Error fetching relations:', error);
    } finally {
      setIsLoadingRelations(false);
    }
  }, [isRelationBased, effectiveSourceId, targetSchema, relationTypeId, effectiveSourceSchemaId, targetSchemaData]);

  // Fetch relations when component mounts or dependencies change
  useEffect(() => {
    if (isRelationBased) {
      fetchRelations();
    }
  }, [fetchRelations, isRelationBased]);

  // Find the repeating section in the schema (for non-relation-based tables)
  const section = schema.sections?.find((s) => s.id === config.sectionId);

  // For relation-based tables, we don't need the section validation
  // For non-relation-based tables, check section
  if (!isRelationBased && (!section || !section.isRepeatingSection)) {
    return null;
  }

  // Get the data - either from relations or from the main data object
  let sectionData: any[] = [];
  if (isRelationBased) {
    sectionData = relatedEntities;
  } else {
    // Get the repeating section data from the main data object
    sectionData = data[config.sectionId] || [];
  }

  if (!Array.isArray(sectionData)) {
    return null;
  }

  // Get fields - either from target schema (relation-based) or from source schema
  let fieldsToUse: any[] = [];
  if (isRelationBased && targetSchemaData) {
    // Get fields from target schema
    fieldsToUse = targetSchemaData.fields || [];
  } else if (!isRelationBased && section) {
    // Get fields for this repeating section from source schema
    fieldsToUse = schema.fields?.filter(
      (f) => f.sectionId === config.sectionId
    ) || [];
  }

  if (fieldsToUse.length === 0 && !isRelationBased) {
    return null;
  }

  // Determine which fields to display as columns
  const fieldsToDisplay = useMemo(() => {
    const schemaToUse = isRelationBased && targetSchemaData ? targetSchemaData : schema;
    
    if (config.columns && config.columns.length > 0) {
      // Use specified columns
      return config.columns
        .map((fieldId) => resolveFieldById(schemaToUse, fieldId))
        .filter(Boolean);
    }
    // Use all fields (from target schema for relation-based, or from section for non-relation-based)
    return fieldsToUse;
  }, [config.columns, isRelationBased, targetSchemaData, schema, fieldsToUse]);

  // Build table columns
  const columns = useMemo(
    () => {
      const schemaToUse = isRelationBased && targetSchemaData ? targetSchemaData : schema;
      const baseColumns = buildTableColumns(fieldsToDisplay, schemaToUse);
      
      // Add view button column at the end
      const viewColumn: TableColumn = {
        id: 'actions',
        label: 'Actions',
        accessor: 'id',
        sortable: false,
        align: 'right',
        width: '80px',
        sticky: 'right',
        render: (value: any, row: any) => {
          const itemId = row.id || value;
          if (!itemId) return null;
          
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/page/${navigationSchemaId}/${itemId}?showBack=true`);
              }}
              className="h-8 w-8 p-0 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all duration-200"
            >
              <IconRenderer iconName="Eye" className="h-4 w-4" />
            </Button>
          );
        },
      };
      
      return [...baseColumns, viewColumn];
    },
    [fieldsToDisplay, isRelationBased, targetSchemaData, schema, navigationSchemaId, router]
  );

  // Get table properties with defaults
  const tableProps = config.tableProperties || {};
  const sortingEnabled = tableProps.sortingEnabled ?? true;
  const paginationEnabled = tableProps.paginationEnabled ?? (sectionData.length > 10);
  const paginationPageSize = tableProps.paginationPageSize || 10;
  const alwaysShowPagination = tableProps.alwaysShowPagination ?? false;
  // showAsCards: if undefined, default to true (auto-responsive on mobile)
  // if explicitly set to false, disable cards even on mobile
  const showAsCards = tableProps.showAsCards !== false; // Default to true (responsive)
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
        message: isRelationBased 
          ? (config.title ? `No ${config.title.toLowerCase()} found` : 'No items found')
          : (section?.repeatingConfig?.emptyMessage || 'No items found'),
      },
      loading: isLoadingRelations || (isRelationBased && isLoadingTargetSchema),
      striped: true,
      hoverable: true,
      bordered: true,
    }),
    [columns, sectionData, sortingEnabled, paginationEnabled, paginationPageSize, alwaysShowPagination, section, isRelationBased, config, isLoadingRelations, isLoadingTargetSchema]
  );

  const colSpan = config.colSpan || 1;
  const title = config.title || (isRelationBased ? targetSchemaData?.plural_name || 'Related Items' : section?.title);
  const description = config.description || (isRelationBased ? undefined : section?.description);

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
        "w-full min-w-0", // Prevent overflow and allow shrinking
        className
      )}
    >
      <CardWrapper
        config={{
          id: `table-card-${config.sectionId}`,
          name: title || 'Table',
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
              <div className="overflow-x-auto mx-0">
                <Table config={tableConfig} />
              </div>
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

