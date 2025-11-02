// Dynamic Detail Page Renderer
// Renders detail pages dynamically based on schema metadata

import { motion } from 'framer-motion';
import React from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { GridBuilder } from '../../layout/grid-builder';
import { FormSchema } from '../../../shared/types/form-schema';
import { DynamicInfoCard } from './DynamicInfoCard';
import { ComponentRenderer } from './ComponentRenderer';
import { DynamicRepeatingTableViewer } from './DynamicRepeatingTableViewer';
import { resolveFieldById } from '../../form-builder/form-elements/utils/field-resolver';
import { getValueByRole, getSingleValueByRole } from '../utils';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { getBadgeConfig } from '../utils';
import { cn } from '../../shared/utils';
import { getDefaultSections } from '../../schema-manager/utils/badge-utils';
import { GoToTop } from '../../layout/go-to-top';
import { Rating, Countdown } from '../../form-builder';

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
  // Custom components registry
  customComponents?: Record<string, React.ComponentType<any>>;
}

/**
 * Get header information from schema and data
 */
const getHeaderInfo = (schema: FormSchema, data: any) => {
  const title = getValueByRole(schema, data, 'title') || data.name || 'Details';
  const subtitle = getSingleValueByRole(schema, data, 'subtitle') || data.email || '';
  const avatar = getSingleValueByRole(schema, data, 'avatar') || data.name || '?';
  const status = getSingleValueByRole(schema, data, 'status') || data.status || '';
  const rating = getSingleValueByRole(schema, data, 'rating') || data.rating || 0;
  const expiration = getSingleValueByRole(schema, data, 'expiration') || data.expirationDate;

  // Find status field options
  const statusField = schema.fields?.find(f => f.role === 'status');
  const statusOptions = statusField?.options;

  return {
    title,
    subtitle,
    avatar,
    status,
    rating,
    expiration,
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
  customComponents = {}
}) => {
  const detailMetadata = schema.detailPageMetadata;

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
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              {schema.plural_name || 'Back'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const headerInfo = getHeaderInfo(schema, data);
  const badgeConfig = getBadgeConfig(headerInfo.status, headerInfo.statusOptions);

  // Separate sections, component renderers, and table renderers
  const metadataSections = detailMetadata?.sections || [];
  const componentRenderers = detailMetadata?.componentRenderers || [];
  const tableRenderers = detailMetadata?.tableRenderers || [];

  // Get default sections (includes badges if schema has badge fields)
  const defaultSections = getDefaultSections(schema);

  // Filter out default sections that already exist in metadata to avoid duplicates
  const defaultSectionIds = new Set(defaultSections.map(s => s.id));
  const filteredDefaultSections = defaultSections.filter(
    defaultSection => !metadataSections.some(metaSection => metaSection.id === defaultSection.id)
  );

  // Combine sections: default sections first, then metadata sections
  const sections = [...filteredDefaultSections, ...metadataSections];

  // Group component renderers by whether they should be in the main area or sidebar
  // For now, all components go in the main area unless specified otherwise
  const mainComponents = componentRenderers.filter((comp, index) => index < mainColumns * 2);
  const sidebarComponents = componentRenderers.slice(mainColumns * 2);

  // Determine if sidebar should be shown - show if layout specifies sidebar columns or if we have sidebar sections
  // Table renderers are always full width and rendered after all components and sections, so they don't affect sidebar
  const hasSidebarSections = sections.some(s => s.columnArea === 'sidebar');
  const hasSidebar = (totalColumns > mainColumns && sidebarColumns > 0) || hasSidebarSections;

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
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="space-y-6 pb-6">
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
                  {schema.plural_name || 'Back'}
                </Button>
              )}

              {showActions && (onEdit || onDelete) && (
                <div className="flex items-center space-x-2">
                  {headerInfo.expiration && (
                    <div className="mr-2">
                      <Countdown
                        expireDate={headerInfo.expiration}
                        includeTime={true}
                        size="sm"
                        showIcon={true}
                      />
                    </div>
                  )}
                  {onEdit && (
                    <Button variant="outline" onClick={onEdit} className="px-4 py-2 gap-2">
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
            <div className="flex items-center space-x-2 justify-between py-4 w-full">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/avatars/${headerInfo.avatar.toLowerCase().replace(/\s+/g, '-')}.jpg`} />
                  <AvatarFallback>{getInitials(headerInfo.avatar)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{headerInfo.title}</h1>
                  {headerInfo.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{headerInfo.subtitle}</p>
                  )}
                </div>
              </div>
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

            {/* Table Renderers - Full Width (Always after components and sections) */}
            {tableRenderers.length > 0 && (
              <div className="space-y-6 mt-6">
                {tableRenderers.map((tableConfig, index) => (
                  <DynamicRepeatingTableViewer
                    key={tableConfig.id}
                    config={tableConfig}
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

        {/* Table Renderers - Full Width (Always after components and sections) */}
        {tableRenderers.length > 0 && (
          <div className="space-y-6 mt-6">
            {tableRenderers.map((tableConfig, index) => (
              <DynamicRepeatingTableViewer
                key={tableConfig.id}
                config={tableConfig}
                schema={schema}
                data={data}
                index={index + mainComponents.length + sections.length + (hasSidebar ? sidebarComponents.length : 0)}
                disableAnimation={disableAnimation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Go to Top Button */}
      <GoToTop threshold={100} />
    </div>
  );
};

DynamicDetailPageRenderer.displayName = 'DynamicDetailPageRenderer';

