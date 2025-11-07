// Dynamic Repeating Table Viewer Component
// Displays repeating section data in a table format

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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
import { useSchemaStore } from '@/stores/schema.store';

/**
 * Column width configuration for different field types
 * Maps field types to min and max width constraints
 */
export interface ColumnWidthConfig {
  minWidth?: number;
  maxWidth?: number;
  width?: number;
}

/**
 * Default column width configuration for different field types
 * These values are used when no custom configuration is provided
 */
export const DEFAULT_COLUMN_WIDTHS: Record<string, ColumnWidthConfig> = {
  // Text fields - can be long, allow wrapping with better min widths
  text: { minWidth: 150, maxWidth: 400 },
  textarea: { minWidth: 180, maxWidth: 500 },
  
  // Email and URL - medium length
  email: { minWidth: 200, maxWidth: 300 },
  url: { minWidth: 220, maxWidth: 350 },
  
  // Phone numbers - consistent width
  phone: { minWidth: 150, maxWidth: 200 },
  tel: { minWidth: 150, maxWidth: 200 },
  
  // Numbers - compact
  number: { minWidth: 100, maxWidth: 150 },
  currency: { minWidth: 120, maxWidth: 180 },
  percentage: { minWidth: 100, maxWidth: 130 },
  
  // Dates - consistent width
  date: { minWidth: 120, maxWidth: 150 },
  'datetime-local': { minWidth: 180, maxWidth: 220 },
  datetime: { minWidth: 180, maxWidth: 220 },
  
  // Selection fields - medium width
  select: { minWidth: 150, maxWidth: 250 },
  picker: { minWidth: 150, maxWidth: 280 },
  radio: { minWidth: 120, maxWidth: 200 },
  
  // Checkbox fields - compact
  checkbox: { minWidth: 100, maxWidth: 150 },
  'checkbox-list': { minWidth: 150, maxWidth: 300 },
  
  // File and media - medium width
  file: { minWidth: 150, maxWidth: 250 },
  avatar: { minWidth: 80, maxWidth: 120 },
  'image-text': { minWidth: 200, maxWidth: 350 },
  
  // Special fields
  icon: { minWidth: 80, maxWidth: 120 },
  'icon-input': { minWidth: 100, maxWidth: 150 },
  'color-picker': { minWidth: 100, maxWidth: 150 },
  rating: { minWidth: 100, maxWidth: 150 },
  badge: { minWidth: 100, maxWidth: 200 },
  countdown: { minWidth: 120, maxWidth: 180 },
  button: { minWidth: 100, maxWidth: 200 },
  input: { minWidth: 120, maxWidth: 300 },
  password: { minWidth: 120, maxWidth: 200 },
  
  // Default fallback
  default: { minWidth: 100, maxWidth: 300 },
};

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

const formatRelationType = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const cleaned = value.replace(/_/g, ' ').toLowerCase();
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
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
        <Badge variant={mapBadgeColorToVariant(badgeConfig.color)} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] leading-tight w-auto">
          {badgeConfig.icon && <IconRenderer iconName={badgeConfig.icon} className="h-2.5 w-2.5" />}
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
 * Uses column width configuration based on field types
 */
const buildTableColumns = (
  fields: any[],
  schema: FormSchema,
  columnWidths?: Record<string, ColumnWidthConfig>
): TableColumn[] => {
  // Use provided column widths or default configuration
  const widthConfig = columnWidths || DEFAULT_COLUMN_WIDTHS;
  
  return fields.map((field) => {
    // Get width configuration for this field type
    const fieldType = field.type || 'default';
    let widthSettings = widthConfig[fieldType] || widthConfig.default || {};
    
    // Special handling for address and location fields - set maxWidth to allow wrapping
    if (field.name?.toLowerCase().includes('address') || field.role === 'location') {
      widthSettings = { maxWidth: 400, ...widthSettings };
    }
    // Special handling for city, state, zip - set maxWidth to allow wrapping if needed
    else if (['city', 'state', 'zipcode', 'zip'].includes(field.name?.toLowerCase() || '')) {
      widthSettings = { maxWidth: 200, ...widthSettings };
    }
    // Special handling for badge fields - set maxWidth to allow wrapping
    else if (field.role === 'badge') {
      widthSettings = { maxWidth: 300, ...widthSettings };
    }
    
    // Determine alignment based on field type
    const align = field.type === 'number' || field.type === 'currency' || field.type === 'percentage' 
      ? 'right' 
      : 'left';

    return {
      id: field.id,
      label: field.label || field.name,
      accessor: field.name,
      sortable: true,
      align,
      // Only set maxWidth to prevent columns from being too wide, let content determine width otherwise
      maxWidth: widthSettings.maxWidth,
      // Only set explicit width if provided
      width: widthSettings.width,
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
  const { getSchema, fetchSchema } = useSchemaStore();
  
  // Check if this is a relation-based table
  // Can be relation-based with just targetSchema (all relations to that schema) or with both targetSchema and relationTypeId
  const isRelationBased = !!config.targetSchema;
  const targetSchema = config.targetSchema;
  const relationTypeId = config.relationTypeId; // Optional - if not provided, fetch all relations to targetSchema
  
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
  const [relationDirections, setRelationDirections] = useState<Set<'source' | 'target'>>(new Set());
  const isFetchingRelationsRef = useRef(false);
  const lastFetchParamsRef = useRef<string>('');

  // Fetch target schema for relation-based tables (using schema store with deduplication)
  useEffect(() => {
    if (isRelationBased && targetSchema && !targetSchemaData) {
      setIsLoadingTargetSchema(true);
      const loadSchema = async () => {
        try {
          // Use fetchSchema which handles deduplication and caching
          const schema = await fetchSchema(targetSchema);
          if (schema) {
            setTargetSchemaData(schema);
          }
        } catch (error) {
          console.error('Error loading target schema:', error);
        } finally {
          setIsLoadingTargetSchema(false);
        }
      };
      loadSchema();
    } else if (isRelationBased && targetSchema && targetSchemaData) {
      // Already have schema, no need to load
      setIsLoadingTargetSchema(false);
    }
  }, [isRelationBased, targetSchema, targetSchemaData, fetchSchema]);

  // Fetch relations and related entities for relation-based tables
  const fetchRelations = useCallback(async () => {
    if (!isRelationBased || !effectiveSourceId || !targetSchema || isFetchingRelationsRef.current) {
      return;
    }
    
    isFetchingRelationsRef.current = true;
    setIsLoadingRelations(true);
    try {
      // Ensure target schema is loaded (use fetchSchema for deduplication)
      let schemaToUse = targetSchemaData;
      if (!schemaToUse && targetSchema) {
        // Use fetchSchema which handles deduplication and caching
        const schema = await fetchSchema(targetSchema);
        if (schema) {
          schemaToUse = schema;
          setTargetSchemaData(schema);
        }
      }
      
      // Use the new all-relations endpoint to get all related entities in one call
      let allRelationsUrl = `/api/data/all-relations?schema=${effectiveSourceSchemaId}&id=${effectiveSourceId}&direction=both&otherSchema=${targetSchema}`;
      
      const allRelationsResponse = await apiRequest<Array<{
        schema: string;
        direction: 'source' | 'target';
        relation_type: string;
        data: any[];
      }>>(allRelationsUrl);
      
      if (allRelationsResponse.success && allRelationsResponse.data) {
        const groupedData = Array.isArray(allRelationsResponse.data) 
          ? allRelationsResponse.data 
          : [];
        
        // Filter by relationTypeId if provided, otherwise combine all groups for the target schema
        let entities: any[] = [];
        const directionsSet = new Set<'source' | 'target'>();
        
        for (const group of groupedData) {
          // Only process groups that match our target schema
          if (group.schema === targetSchema) {
            // If relationTypeId is specified, only include matching relation types
            if (relationTypeId && group.relation_type !== relationTypeId) {
              continue;
            }
            
            directionsSet.add(group.direction);
            const annotatedData = group.data.map((item) => ({
              ...item,
              __relationType: group.relation_type,
            }));
            entities.push(...annotatedData);
          }
        }
          
        // Resolve picker fields for all entities if target schema is available
        if (schemaToUse && schemaToUse.fields && entities.length > 0) {
            const pickerFields = schemaToUse.fields.filter(
            (field: any) => field.type === 'picker' && field.targetSchema
            );
            
          // Resolve each picker field for each entity
          const resolvedPromises = entities.map(async (entity) => {
            const entityResolvedPromises = pickerFields
              .filter((field: any) => entity[field.name])
              .map(async (field: any) => {
              const fieldValue = entity[field.name];
              if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
                try {
                  // Fetch the referenced entity
                  const resolvedResponse = await apiRequest<any>(`/api/data/${field.targetSchema}/${fieldValue}`);
                  if (resolvedResponse.success && resolvedResponse.data) {
                    const resolvedEntity = resolvedResponse.data;
                    
                     // Fetch the target schema to get the title role (using deduplicated fetch)
                     let targetSchemaForPicker: FormSchema | null = null;
                     try {
                       targetSchemaForPicker = await fetchSchema(field.targetSchema);
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
            
            await Promise.all(entityResolvedPromises);
            return entity;
          });
          
          entities = await Promise.all(resolvedPromises);
        }
        
        setRelatedEntities(entities);
        setRelationDirections(directionsSet);
      } else {
        setRelatedEntities([]);
        setRelationDirections(new Set());
      }
    } catch (error) {
      console.error('Error fetching relations:', error);
      setRelatedEntities([]);
      setRelationDirections(new Set());
    } finally {
      setIsLoadingRelations(false);
      isFetchingRelationsRef.current = false;
    }
  }, [isRelationBased, effectiveSourceId, targetSchema, relationTypeId, effectiveSourceSchemaId, targetSchemaData, fetchSchema]);

  // Fetch relations when component mounts or dependencies change
  // Use a ref to track fetch params to prevent duplicate fetches
  useEffect(() => {
    if (!isRelationBased || !effectiveSourceId || !targetSchema) {
      return;
    }
    
    // Create a unique key for this fetch
    const fetchKey = `${effectiveSourceSchemaId}-${effectiveSourceId}-${targetSchema}-${relationTypeId || 'all'}`;
    
    // Only fetch if parameters have changed
    if (lastFetchParamsRef.current === fetchKey) {
      return;
    }
    
    lastFetchParamsRef.current = fetchKey;
    fetchRelations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRelationBased, effectiveSourceId, targetSchema, relationTypeId, effectiveSourceSchemaId]);

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
    
    // If columns are provided, use them
    if (config.columns && config.columns.length > 0) {
      return config.columns
        .map((fieldId) => resolveFieldById(schemaToUse, fieldId))
        .filter(Boolean);
    }

    // For relation-based tables with no specified columns, use all target schema fields
    if (isRelationBased && targetSchemaData) {
      return targetSchemaData.fields || [];
    }

    // Otherwise, use fields from the repeating section
    return fieldsToUse;
  }, [config.columns, isRelationBased, targetSchemaData, schema, fieldsToUse]);

  // Build table columns
  const columns = useMemo(
    () => {
      const schemaToUse = isRelationBased && targetSchemaData ? targetSchemaData : schema;
      // Get column width config from table properties if provided, otherwise use defaults
      const columnWidths = config.tableProperties?.columnWidths;
      const baseColumns = buildTableColumns(fieldsToDisplay, schemaToUse, columnWidths);
      
      // Add view button column as the first column
      // This column gets all standard table styles (padding, borders, etc.) like other columns
      const viewColumn: TableColumn = {
        id: 'actions',
        label: 'Actions',
        accessor: 'id',
        sortable: false,
        align: 'center',
        width: 80, // Fixed width for the actions column
        render: (value: any, row: any) => {
          const itemId = row.id || value;
          if (!itemId) return null;
          
          // Use a wrapper div to center the button while preserving table cell styles
          return (
            <div className="flex items-center justify-center">
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
            </div>
          );
        },
      };
      
      return [viewColumn, ...baseColumns];
    },
    [fieldsToDisplay, isRelationBased, targetSchemaData, schema, navigationSchemaId, router, relationDirections]
  );

  // Get table properties with defaults
  const tableProps = config.tableProperties || {};
  const sortingEnabled = tableProps.sortingEnabled ?? true;
  const paginationEnabled = tableProps.paginationEnabled ?? (sectionData.length > 10);
  const paginationPageSize = tableProps.paginationPageSize || 10;
  const alwaysShowPagination = tableProps.alwaysShowPagination ?? false;
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
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640); // sm breakpoint (640px)
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Determine if we should show cards: only on small screens for consistent behavior
  const shouldShowCards = isSmallScreen;

  const relationTypeTexts = useMemo(() => {
    if (!isRelationBased) return [];

    const primary = relationTypeId ? (formatRelationType(relationTypeId) || relationTypeId) : null;
    if (primary) {
      return [primary];
    }

    const typesFromData = (sectionData as any[] | undefined)?.map((item) => item?.__relationType).filter(Boolean) as string[];
    if (!typesFromData || typesFromData.length === 0) {
      return [];
    }

    const unique = Array.from(new Set(typesFromData));
    return unique
      .map((type) => formatRelationType(type) || type)
      .filter(Boolean) as string[];
  }, [isRelationBased, relationTypeId, sectionData]);

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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
                {sectionData.length}
              </span>
            </div>

            {/* Show direction badge(s) and relation type for relation-based tables */}
              {isRelationBased && relationDirections.size > 0 && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  {relationDirections.has('source') && (
                    <Badge variant="primary" size="sm">
                      <IconRenderer iconName="ArrowDown" className="h-3 w-3 mr-1" />
                      Source
                    </Badge>
                  )}
                  {relationDirections.has('target') && (
                    <Badge variant="secondary" size="sm">
                      <IconRenderer iconName="ArrowUp" className="h-3 w-3 mr-1" />
                      Target
                    </Badge>
                  )}
                </div>
                {relationTypeTexts.length > 0 && (
                  <div className="text-xs font-medium text-gray-500 text-right">
                    {relationTypeTexts.map((text, index) => (
                      <div key={`${text}-${index}`}>{text}</div>
                    ))}
                  </div>
                )}
            </div>
            )}
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
              <div className="mx-0 min-w-0">
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

