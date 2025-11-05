// Dynamic Detail Page Renderer
// Renders detail pages dynamically based on schema metadata

import { motion } from 'framer-motion';
import React from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { GridBuilder } from '../../layout/grid-builder';
import { FormSchema, DetailPageSection } from '@/gradian-ui/schema-manager/types/form-schema';
import { DynamicInfoCard } from './DynamicInfoCard';
import { ComponentRenderer } from './ComponentRenderer';
import { DynamicRepeatingTableViewer } from './DynamicRepeatingTableViewer';
import { resolveFieldById } from '../../form-builder/form-elements/utils/field-resolver';
import { getValueByRole, getSingleValueByRole } from '../utils';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { getBadgeConfig } from '../utils';
import { cn } from '../../shared/utils';
import { getDefaultSections } from '../../schema-manager/utils/badge-utils';
import { DynamicQuickActions } from './DynamicQuickActions';
import { GoToTop } from '../../layout/go-to-top';
import { Rating, Countdown } from '../../form-builder';
import { CodeBadge } from '../../form-builder/form-elements';
import { FormModal } from '../../form-builder';
import { useState, useCallback } from 'react';
import { Skeleton } from '../../../components/ui/skeleton';

export interface DynamicDetailPageRendererProps {
  schema: FormSchema;
  data: any;
  isLoading?: boolean;
  error?: string | null;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  backUrl?: string;
  disableAnimation?: boolean;
  className?: string;
  showBack?: boolean; // If true, show "Back" instead of schema name
  // Custom components registry
  customComponents?: Record<string, React.ComponentType<any>>;
}

/**
 * Get subtitle with icon for MainLayout
 */
export const getPageSubtitle = (schema: FormSchema, entityName: string): React.ReactNode => {
  if (!schema.icon) {
    return entityName;
  }
  
  return (
    <span className="flex items-center gap-1.5">
      <IconRenderer 
        iconName={schema.icon} 
        className="h-4 w-4 text-violet-600" 
      />
      <span>{entityName}</span>
    </span>
  );
};

/**
 * Get page title for MainLayout based on schema and data
 * Priority: 1) Field with role "title", 2) First text field (excluding code, subtitle, description), 3) id
 */
export const getPageTitle = (schema: FormSchema, data: any, dataId?: string): string => {
  if (!data) return dataId || 'Loading...';
  
  // 1. Check if role "title" exists in schema
  const hasTitleRole = schema?.fields?.some(field => field.role === 'title') || false;
  
  if (hasTitleRole) {
    // Use title role value
    const titleByRole = getValueByRole(schema, data, 'title');
    if (titleByRole && titleByRole.trim() !== '') {
      return titleByRole;
    }
  }
  
  // 2. Try to find first text field that doesn't have excluded roles (sorted by order)
  if (schema?.fields) {
    const excludedRoles = ['code', 'subtitle', 'description'];
    const textFields = schema.fields
      .filter(field => 
        field.type === 'text' && 
        (!field.role || !excludedRoles.includes(field.role)) &&
        data[field.name] !== undefined && 
        data[field.name] !== null && 
        String(data[field.name]).trim() !== ''
      )
      .sort((a, b) => (a.order || 999) - (b.order || 999)); // Sort by order field
    
    if (textFields.length > 0) {
      const firstTextField = textFields[0];
      const value = data[firstTextField.name];
      if (value && String(value).trim() !== '') {
        return String(value);
      }
    }
  }
  
  // 3. Fallback to id
  return dataId || data.id || 'Details';
};

/**
 * Get header information from schema and data
 */
const getHeaderInfo = (schema: FormSchema, data: any) => {
  // Get title - check if role "title" exists, otherwise use first text field
  const hasTitleRole = schema?.fields?.some(field => field.role === 'title') || false;
  let title: string = '';
  
  if (hasTitleRole) {
    // Use title role value
    title = getValueByRole(schema, data, 'title') || data.name || 'Details';
  } else {
    // Find first text field that doesn't have excluded roles (sorted by order)
    const excludedRoles = ['code', 'subtitle', 'description'];
    const textFields = schema?.fields
      ?.filter(field => 
        field.type === 'text' && 
        (!field.role || !excludedRoles.includes(field.role)) &&
        data[field.name] !== undefined && 
        data[field.name] !== null && 
        String(data[field.name]).trim() !== ''
      )
      .sort((a, b) => (a.order || 999) - (b.order || 999)) || [];
    
    const firstTextField = textFields[0];
    
    if (firstTextField) {
      const fieldValue = data[firstTextField.name];
      title = fieldValue ? String(fieldValue).trim() : (data.name || 'Details');
    } else {
      title = data.name || 'Details';
    }
  }
  // Get subtitle value(s) - concatenate multiple fields with same role using |
  const subtitle = getValueByRole(schema, data, 'subtitle') || data.email || '';
  const avatar = getSingleValueByRole(schema, data, 'avatar') || data.name || '?';
  const status = getSingleValueByRole(schema, data, 'status') || data.status || '';
  const rating = getSingleValueByRole(schema, data, 'rating') || data.rating || 0;
  
  // Get duedate value - check if it's a valid date
  const duedateValue = getSingleValueByRole(schema, data, 'duedate', '') || data.duedate || data.expirationDate;
  // Validate that duedate is a valid date value (not empty string, null, or undefined)
  // Check if it's a valid string or Date object, and if string, ensure it's not empty
  let duedate: string | Date | null = null;
  if (duedateValue) {
    if (duedateValue instanceof Date) {
      duedate = duedateValue;
    } else if (typeof duedateValue === 'string' && duedateValue.trim() !== '') {
      // Try to parse the date string to ensure it's valid
      const parsedDate = new Date(duedateValue);
      if (!isNaN(parsedDate.getTime())) {
        duedate = duedateValue;
      }
    }
  }

  // Get code field value - only if field with role "code" exists
  const codeFieldExists = schema?.fields?.some(field => field.role === 'code') || false;
  const codeValue = codeFieldExists ? (getSingleValueByRole(schema, data, 'code') || data.code || '') : '';
  const code = codeValue && String(codeValue).trim() !== '' ? codeValue : '';

  // Find status field options
  const statusField = schema.fields?.find(f => f.role === 'status');
  const statusOptions = statusField?.options;

  return {
    title,
    subtitle,
    avatar,
    status,
    rating,
    duedate,
    code,
    statusOptions
  };
};

/**
 * Get initials from name or avatar field
 */
const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const DynamicDetailPageRenderer: React.FC<DynamicDetailPageRendererProps> = ({
  schema,
  data,
  isLoading = false,
  error = null,
  onBack,
  onEdit,
  onDelete,
  backUrl,
  disableAnimation = false,
  className,
  showBack = false,
  customComponents = {}
}) => {
  const [editEntityId, setEditEntityId] = useState<string | null>(null);
  const detailMetadata = schema.detailPageMetadata;

  // Handle edit - use EditModal component
  const handleEdit = useCallback(() => {
    if (data?.id && schema?.id) {
      setEditEntityId(data.id);
      // Call original onEdit if provided (for external handling)
      onEdit?.();
    }
  }, [data?.id, schema?.id, onEdit]);

  // Default layout values (can be overridden in detailPageMetadata if needed)
  const mainColumns = 2 as 1 | 2 | 3;
  const sidebarColumns = 1 as 1 | 2;
  // Calculate totalColumns from mainColumns + sidebarColumns
  const totalColumns = (mainColumns + sidebarColumns) as 2 | 3 | 4;
  const gap = 6;

  // Default header values (can be overridden if needed)
  const showBackButton = true;
  const showActions = true;

  if (isLoading) {
    const detailMetadata = schema?.detailPageMetadata;
    const hasSidebar = (detailMetadata?.quickActions?.length ?? 0) > 0 || 
                      detailMetadata?.sections?.some(s => s.columnArea === 'sidebar');
    
    return (
      <div className={cn("container mx-auto px-4 py-6", className)}>
        <div className="space-y-6 pb-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center flex-col w-full">
              <div className="flex items-center justify-between w-full">
                {/* Back button skeleton */}
                {showBackButton && (
                  <Skeleton className="h-10 w-24" />
                )}
                {/* Action buttons skeleton */}
                {showActions && (
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                )}
              </div>
              
              {/* Header content skeleton */}
              <div className="flex items-center space-x-2 justify-between py-4 w-full flex-row flex-wrap gap-2">
                <div className="flex items-center space-x-4">
                  {/* Avatar skeleton */}
                  {schema?.fields?.some(field => field.role === 'avatar') && (
                    <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-row flex-wrap">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          {hasSidebar ? (
            <div className={cn(
              "grid gap-6",
              totalColumns === 2 && "grid-cols-1 md:grid-cols-2",
              totalColumns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              totalColumns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            )}>
              {/* Main Content Area */}
              <div className={cn(
                "space-y-6",
                mainColumns === 2 && "md:col-span-2",
                mainColumns === 3 && "md:col-span-2 lg:col-span-3",
                mainColumns === 1 && "md:col-span-1"
              )}>
                {/* Component Renderers Skeleton */}
                {(detailMetadata?.componentRenderers?.length || 0) > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: Math.min(detailMetadata?.componentRenderers?.length || 2, 4) }).map((_, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Skeleton */}
              {hasSidebar && (
                <div className={cn(
                  "space-y-6",
                  sidebarColumns === 1 && "md:col-span-1",
                  sidebarColumns === 2 && "md:col-span-2",
                  !sidebarColumns && "md:col-span-1"
                )}>
                  {/* Quick Actions Skeleton */}
                  {(detailMetadata?.quickActions?.length ?? 0) > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        {Array.from({ length: Math.min(detailMetadata?.quickActions?.length ?? 0, 3) }).map((_, index) => (
                          <Skeleton key={index} className="h-10 w-full" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sidebar Info Card Skeleton */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-32" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Component Renderers Skeleton */}
              {(detailMetadata?.componentRenderers?.length || 0) > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: Math.min(detailMetadata?.componentRenderers?.length || 2, 4) }).map((_, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-32" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Renderers Skeleton */}
              {(detailMetadata?.tableRenderers?.length || 0) > 0 && (
                <div className="space-y-6 mt-6">
                  {Array.from({ length: detailMetadata?.tableRenderers?.length || 1 }).map((_, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="bg-gray-50/50 border-b border-gray-200 p-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-48 mt-2" />
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <div key={rowIndex} className="flex gap-4">
                              {Array.from({ length: 4 }).map((_, colIndex) => (
                                <Skeleton key={colIndex} className="h-4 flex-1" />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Table Renderers Skeleton (if not already shown) */}
          {hasSidebar && (detailMetadata?.tableRenderers?.length || 0) > 0 && (
            <div className="space-y-6 mt-6">
              {Array.from({ length: detailMetadata?.tableRenderers?.length || 1 }).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="bg-gray-50/50 border-b border-gray-200 p-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48 mt-2" />
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-4">
                          {Array.from({ length: 4 }).map((_, colIndex) => (
                            <Skeleton key={colIndex} className="h-4 flex-1" />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error || 'Data not found'}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {showBack ? 'Back' : (schema.plural_name || 'Back')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const headerInfo = getHeaderInfo(schema, data);
  const badgeConfig = getBadgeConfig(headerInfo.status, headerInfo.statusOptions);
  
  // Check if avatar field exists in schema
  const hasAvatarField = schema?.fields?.some(field => field.role === 'avatar') || false;

  // Separate sections, component renderers, and table renderers
  const metadataSections = detailMetadata?.sections || [];
  const componentRenderers = detailMetadata?.componentRenderers || [];
  const tableRenderers = detailMetadata?.tableRenderers || [];
  const quickActions = detailMetadata?.quickActions || [];

  // Get default sections (includes badges if schema has badge fields)
  const defaultSections = getDefaultSections(schema);

  // Filter out default sections that already exist in metadata to avoid duplicates
  const defaultSectionIds = new Set(defaultSections.map(s => s.id));
  const filteredDefaultSections = defaultSections.filter(
    defaultSection => !metadataSections.some(metaSection => metaSection.id === defaultSection.id)
  );

  // If no metadata sections are defined, create default sections from all fields
  let sections: DetailPageSection[] = [];
  if (metadataSections.length === 0 && (!detailMetadata || !detailMetadata.sections)) {
    // Fields to exclude (already shown in header or special fields)
    const excludedRoles = ['title', 'subtitle', 'avatar', 'status', 'rating', 'duedate', 'code', 'description'];
    
    // Get all fields that should be displayed
    const displayableFields = schema?.fields?.filter(field => {
      // Exclude fields with excluded roles
      if (field.role && excludedRoles.includes(field.role)) {
        return false;
      }
      // Exclude repeating section fields (they should be in table renderers)
      if (field.sectionId) {
        const section = schema.sections?.find(s => s.id === field.sectionId);
        if (section?.isRepeatingSection) {
          return false;
        }
      }
      return true;
    }) || [];

    // Group fields by sectionId
    const fieldsBySection = new Map<string, any[]>();
    displayableFields.forEach(field => {
      const sectionId = field.sectionId || 'default';
      if (!fieldsBySection.has(sectionId)) {
        fieldsBySection.set(sectionId, []);
      }
      fieldsBySection.get(sectionId)!.push(field);
    });

    // Create sections from grouped fields
    fieldsBySection.forEach((fields, sectionId) => {
      // Get section title from schema or use default
      const schemaSection = schema.sections?.find(s => s.id === sectionId);
      const sectionTitle = schemaSection?.title || 'Information';
      
      sections.push({
        id: sectionId,
        title: sectionTitle,
        colSpan: 1,
        fieldIds: fields.map(f => f.id).filter(Boolean)
      });
    });

    // Sort sections to maintain order from schema
    if (schema.sections) {
      const sectionOrder = new Map(schema.sections.map((s, idx) => [s.id, idx]));
      sections.sort((a, b) => {
        const orderA = sectionOrder.get(a.id) ?? 999;
        const orderB = sectionOrder.get(b.id) ?? 999;
        return orderA - orderB;
      });
    }
  } else {
    // Use existing sections (default + metadata)
    sections = [...filteredDefaultSections, ...metadataSections];
  }

  // Group component renderers by whether they should be in the main area or sidebar
  // For now, all components go in the main area unless specified otherwise
  const mainComponents = componentRenderers.filter((comp, index) => index < mainColumns * 2);
  const sidebarComponents = componentRenderers.slice(mainColumns * 2);

  // Determine if sidebar should be shown - show if layout specifies sidebar columns or if we have sidebar sections or quick actions
  // Table renderers are always full width and rendered after all components and sections, so they don't affect sidebar
  const hasSidebarSections = sections.some(s => s.columnArea === 'sidebar');
  const hasSidebar = (totalColumns > mainColumns && sidebarColumns > 0) || hasSidebarSections || quickActions.length > 0;

  // If there's no sidebar, set all sections to colSpan: 1 for full width
  if (!hasSidebarSections) {
    sections = sections.map(s => ({
      ...s,
      colSpan: 1
    }));
  }

  // Split sections between main and sidebar if needed
  // Use columnArea property if specified, otherwise use fallback logic
  const sectionsForMain = hasSidebar
    ? sections.filter((s, index) => s.columnArea === 'main' || (!s.columnArea && (index < Math.ceil(sections.length / 2) || s.colSpan === 2)))
    : sections;
  const sectionsForSidebar = hasSidebar
    ? sections.filter((s, index) => s.columnArea === 'sidebar' || (!s.columnArea && (index >= Math.ceil(sections.length / 2) && s.colSpan !== 2)))
    : [];

  // Table renderers are always full width and rendered after all components and sections
  // No need to split them by columnArea

  return (
    <div className={cn("container mx-auto px-4 py-6 w-full max-w-full overflow-x-hidden", className)}>
      <div className="space-y-6 pb-6 w-full min-w-0">
        {/* Header */}
        <motion.div
          initial={disableAnimation ? false : { opacity: 0, y: 20 }}
          animate={disableAnimation ? false : { opacity: 1, y: 0 }}
          transition={disableAnimation ? {} : { duration: 0.3 }}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center  flex-col w-full">
            <div className='flex items-center justify-between w-full'>
              {showBackButton && (onBack || backUrl) && (
                <Button
                  variant="outline"
                  onClick={onBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {showBack ? 'Back' : (schema.plural_name || 'Back')}
                </Button>
              )}

              {showActions && (onEdit || onDelete) && (
                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <Button variant="outline" onClick={handleEdit} className="px-4 py-2 gap-2">
                      <Edit className="h-4 w-4  " />
                      <span className='hidden md:block'>Edit</span>
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700 px-4 py-2 gap-2">
                      <Trash2 className="h-4 w-4 " />
                      <span className='hidden md:block'>Delete</span>
                    </Button>
                  )}
                </div>
              )}

            </div>
            <div className="flex items-center space-x-2 justify-between py-4 w-full flex-row flex-wrap gap-2">
              <div className="flex items-center space-x-4">
                {hasAvatarField && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/avatars/${headerInfo.avatar.toLowerCase().replace(/\s+/g, '-')}.jpg`} />
                  <AvatarFallback>{getInitials(headerInfo.avatar)}</AvatarFallback>
                </Avatar>
                )}
                <div>
                  <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{headerInfo.title}</h1>
                    {headerInfo.code && (
                      <CodeBadge code={headerInfo.code} />
                    )}
                  </div>
                  {headerInfo.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{headerInfo.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-row flex-wrap">
                {headerInfo.duedate && (
                  <div className="mr-2">
                    <Countdown
                      expireDate={headerInfo.duedate}
                      includeTime={true}
                      size="sm"
                      showIcon={true}
                    />
                  </div>
                )}
                <div className="flex items-end flex-col justify-end gap-2">
                  {headerInfo.rating > 0 && (
                    <Rating
                      value={headerInfo.rating}
                      maxValue={5}
                      size="md"
                      showValue={true}
                    />
                  )}
                  {headerInfo.status && (
                    <motion.div
                      initial={disableAnimation ? false : { opacity: 0, scale: 0.8, y: 5 }}
                      animate={disableAnimation ? false : { opacity: 1, scale: 1, y: 0 }}
                      transition={disableAnimation ? {} : {
                        duration: 0.3,
                        delay: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      whileHover={disableAnimation ? undefined : { scale: 1.05 }}
                    >
                      <Badge variant={badgeConfig.color}>
                        {badgeConfig.icon && (
                          <IconRenderer iconName={badgeConfig.icon} className="h-3 w-3 mr-1" />
                        )}
                        {badgeConfig.label}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>


        </motion.div>

        {/* Main Content Grid */}
        {hasSidebar ? (
          <div className={cn(
            "grid gap-6",
            totalColumns === 2 && "grid-cols-1 md:grid-cols-2",
            totalColumns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            totalColumns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {/* Main Content Area */}
            <div className={cn(
              "space-y-6",
              mainColumns === 2 && "md:col-span-2",
              mainColumns === 3 && "md:col-span-2 lg:col-span-3",
              mainColumns === 1 && "md:col-span-1"
            )}>
              {/* Component Renderers (e.g., KPIIndicators) */}
              {mainComponents.length > 0 && (
                <motion.div
                  initial={disableAnimation ? false : { opacity: 0, y: 20 }}
                  animate={disableAnimation ? false : { opacity: 1, y: 0 }}
                  transition={disableAnimation ? {} : { duration: 0.3, delay: 0.1 }}
                >
                  <GridBuilder
                    config={{
                      id: 'detail-components-grid',
                      name: 'Detail Components Grid',
                      columns: 2,
                      gap: gap,
                      responsive: true
                    }}
                  >
                    {mainComponents.map((compConfig, index) => (
                      <ComponentRenderer
                        key={compConfig.id}
                        config={compConfig}
                        schema={schema}
                        data={data}
                        index={index}
                        disableAnimation={disableAnimation}
                        customComponents={customComponents}
                      />
                    ))}
                  </GridBuilder>
                </motion.div>
              )}

              {/* Info Cards - Two Column Grid */}
              {sectionsForMain.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sectionsForMain.map((section, index) => (
                    <DynamicInfoCard
                      key={section.id}
                      section={section}
                      schema={schema}
                      data={data}
                      index={index + mainComponents.length}
                      disableAnimation={disableAnimation}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            {hasSidebar && (
              <div className={cn(
                "space-y-6",
                sidebarColumns === 1 && "md:col-span-1",
                sidebarColumns === 2 && "md:col-span-2",
                !sidebarColumns && "md:col-span-1"
              )}>
                {/* Quick Actions - shown first in sidebar before badges */}
                {quickActions.length > 0 && (
                  <DynamicQuickActions
                    actions={quickActions}
                    schema={schema}
                    data={data}
                    disableAnimation={disableAnimation}
                  />
                )}

                {/* Sidebar Component Renderers */}
                {sidebarComponents.map((compConfig, index) => (
                  <ComponentRenderer
                    key={compConfig.id}
                    config={compConfig}
                    schema={schema}
                    data={data}
                    index={index + sections.length}
                    disableAnimation={disableAnimation}
                    customComponents={customComponents}
                  />
                ))}

                {/* Sidebar Info Cards */}
                {sectionsForSidebar.length > 0 && (
                  <div className="space-y-6">
                    {sectionsForSidebar.map((section, index) => (
                      <DynamicInfoCard
                        key={section.id}
                        section={section}
                        schema={schema}
                        data={data}
                        index={index + mainComponents.length + sectionsForMain.length}
                        disableAnimation={disableAnimation}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Component Renderers (e.g., KPIIndicators) */}
            {mainComponents.length > 0 && (
              <motion.div
                initial={disableAnimation ? false : { opacity: 0, y: 20 }}
                animate={disableAnimation ? false : { opacity: 1, y: 0 }}
                transition={disableAnimation ? {} : { duration: 0.3, delay: 0.1 }}
              >
                <GridBuilder
                  config={{
                    id: 'detail-components-grid',
                    name: 'Detail Components Grid',
                    columns: 2,
                    gap: gap,
                    responsive: true
                  }}
                >
                  {mainComponents.map((compConfig, index) => (
                    <ComponentRenderer
                      key={compConfig.id}
                      config={compConfig}
                      schema={schema}
                      data={data}
                      index={index}
                      disableAnimation={disableAnimation}
                      customComponents={customComponents}
                    />
                  ))}
                </GridBuilder>
              </motion.div>
            )}

            {/* Info Cards - Full Width when no sidebar, Two Column Grid when sidebar exists */}
            {sectionsForMain.length > 0 && (
              <div className={hasSidebarSections ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
                {sectionsForMain.map((section, index) => (
                  <DynamicInfoCard
                    key={section.id}
                    section={section}
                    schema={schema}
                    data={data}
                    index={index + mainComponents.length}
                    disableAnimation={disableAnimation}
                  />
                ))}
              </div>
            )}

            {/* Table Renderers - Full Width (Always after components and sections) */}
            {tableRenderers.length > 0 && (
              <div className="space-y-6 mt-6 w-full min-w-0">
                {tableRenderers.map((tableConfig, index) => (
                  <DynamicRepeatingTableViewer
                    key={tableConfig.id}
                    config={tableConfig}
                    schema={schema}
                    data={data}
                    index={index + mainComponents.length + sectionsForMain.length}
                    disableAnimation={disableAnimation}
                    sourceSchemaId={schema.id}
                    sourceId={data?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Table Renderers - Full Width (Always after components and sections) */}
        {tableRenderers.length > 0 && (
          <div className="space-y-6 mt-6 w-full min-w-0">
            {tableRenderers.map((tableConfig, index) => (
              <DynamicRepeatingTableViewer
                key={tableConfig.id}
                config={tableConfig}
                schema={schema}
                data={data}
                index={index + mainComponents.length + sections.length + (hasSidebar ? sidebarComponents.length : 0)}
                disableAnimation={disableAnimation}
                sourceSchemaId={schema.id}
                sourceId={data?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Go to Top Button */}
      <GoToTop threshold={100} />

      {/* Edit Modal - using unified FormModal */}
      {editEntityId && schema?.id && data?.id && (
        <FormModal
          key={`edit-${editEntityId}-${schema.id}`}
          schemaId={schema.id}
          entityId={editEntityId}
          mode="edit"
          onSuccess={() => {
            // Reset edit state and refresh the page to get updated data
            setEditEntityId(null);
            // Refresh the page to get updated data
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          onClose={() => {
            setEditEntityId(null);
          }}
        />
      )}
    </div>
  );
};

DynamicDetailPageRenderer.displayName = 'DynamicDetailPageRenderer';

