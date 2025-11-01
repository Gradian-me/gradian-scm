// Dynamic Card Renderer Component

import { motion } from 'framer-motion';
import React, { KeyboardEvent } from 'react';
import { Badge } from '../../../components/ui/badge';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { Avatar, Rating } from '../../form-builder/form-elements';
import { CardSection, FormSchema } from '../../form-builder/types/form-schema';
import { cn } from '../../shared/utils';
import { CardContent } from '../card/components/CardContent';
import { CardWrapper } from '../card/components/CardWrapper';
import { getArrayValuesByRole, getBadgeConfig, getInitials, getSingleValueByRole, getValueByRole, renderCardSection } from '../utils';
import { DynamicBadgeRenderer } from './DynamicBadgeRenderer';
import { DynamicCardActionButtons } from './DynamicCardActionButtons';
import { DynamicMetricRenderer } from './DynamicMetricRenderer';

export interface DynamicCardRendererProps {
  schema: FormSchema;
  data: any;
  index: number;
  onView?: (data: any) => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
  maxBadges?: number;
  maxMetrics?: number;
  disableAnimation?: boolean;
}

export const DynamicCardRenderer: React.FC<DynamicCardRendererProps> = ({
  schema,
  data,
  index,
  onView,
  onEdit,
  onDelete,
  viewMode = 'grid',
  className,
  maxBadges = 2,
  maxMetrics = 3,
  disableAnimation = false
}) => {
  // Get card metadata from schema
  const cardMetadata = schema?.cardMetadata || [] as CardSection[];

  // Default actions configuration
  const showView = !!onView;
  const showEdit = !!onEdit;
  const showDelete = !!onDelete;

  // Find status field options from schema
  const findStatusFieldOptions = () => {
    if (!schema || !schema.fields) return undefined;

    for (const field of schema.fields) {
      if (field.role === 'status' && field.options) {
        return field.options;
      }
    }
    return undefined;
  };

  const statusOptions = findStatusFieldOptions();

  // Filter out performance section from cardMetadata
  const filteredSections = cardMetadata.filter(section => 
    section.id !== 'performance'
  ) || [];

  const cardConfig = {
    title: getValueByRole(schema, data, 'title') || data.name || 'Unknown',
    subtitle: getSingleValueByRole(schema, data, 'subtitle', data.email) || data.email || 'No description',
    avatarField: getSingleValueByRole(schema, data, 'avatar', data.name) || data.name || 'V',
    statusField: getSingleValueByRole(schema, data, 'status') || data.status || 'PENDING',
    ratingField: getSingleValueByRole(schema, data, 'rating') || data.rating || 0,
    badgeField: getArrayValuesByRole(schema, data, 'badge') || data.categories || [],
    metricsField: data.performanceMetrics || null,
    sections: filteredSections,
    statusOptions
  };


  const cardClasses = cn(
    'group cursor-pointer transition-all duration-300 h-full',
    viewMode === 'list' && 'w-full',
    className
  );

  const contentClasses = cn(
    'flex gap-4',
    viewMode === 'grid' ? 'flex-col' : 'flex-row items-center'
  );

  return (
    <motion.div
      initial={disableAnimation ? false : { opacity: 0, y: 30, scale: 0.95 }}
      animate={disableAnimation ? false : { opacity: 1, y: 0, scale: 1 }}
      transition={disableAnimation ? {} : {
        duration: 0.5,
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={disableAnimation ? undefined : {
        y: -1,
        boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.1)',
        transition: {
          duration: 0.15,
          ease: "easeOut"
        }
      }}
      whileTap={disableAnimation ? undefined : {
        scale: 0.99,
        transition: { duration: 0.1 }
      }}
      className={cardClasses}
      role="button"
      tabIndex={0}
      onClick={() => onView && onView(data)}
      aria-label={`Vendor card for ${cardConfig.title}`}
    >
      <CardWrapper
        config={{
          id: `dynamic-card-${data.id || index}`,
          name: `Dynamic Card ${cardConfig.title}`,
          styling: { variant: 'default', size: 'md' },
          behavior: { hoverable: !disableAnimation, clickable: true }
        }}
        className={cn(
          "h-full bg-white rounded-xl overflow-hidden",
          !className?.includes('border-none') && "border border-gray-100",
          !disableAnimation && "transition-all duration-200 ease-out group-hover:border-blue-100",
          className?.includes('border-none') ? "focus-within:ring-0" : "focus-within:ring-2 focus-within:ring-blue-400"
        )}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onView) onView(data);
          }
        }}
      >
        <CardContent className={cn("h-full flex flex-col", viewMode === 'list' ? 'p-2' : 'p-3 sm:p-4')}>
          {viewMode === 'grid' ? (
            <>
              {/* Avatar and Status Header */}
              <div className="flex justify-between space-x-3 mb-4 flex-nowrap w-full">
                <div className="flex items-center gap-2 truncate">
                  <motion.div
                    whileHover={disableAnimation ? undefined : { scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Avatar
                      fallback={getInitials(cardConfig.avatarField)}
                      size="lg"
                      variant="primary"
                      className="border border-gray-100"
                    >
                      {getInitials(cardConfig.avatarField)}
                    </Avatar>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className="text-md font-semibold group-hover:text-violet-700 transition-colors duration-200 truncate"
                      whileHover={{ x: 2 }}
                    >
                      {cardConfig.title}
                    </motion.h3>
                    <motion.div
                      className="text-xs text-gray-500 truncate"
                      whileHover={{ x: 2 }}
                    > <p className="text-xs text-gray-500 truncate">{cardConfig.subtitle}</p>
                    </motion.div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Rating */}
                  <Rating
                    value={Number(cardConfig.ratingField) || 0}
                    size="sm"
                    showValue={true}
                  />
                  {/* Status */}
                  <motion.div
                    whileHover={disableAnimation ? undefined : { scale: 1.02 }}
                  >
                    {(() => {
                      const badgeConfig = getBadgeConfig(cardConfig.statusField, cardConfig.statusOptions);
                      return (
                        <Badge variant={badgeConfig.color} className="flex items-center gap-1 px-1 py-0.5 shadow-sm">
                          {badgeConfig.icon && <IconRenderer iconName={badgeConfig.icon} className="h-3 w-3" />}
                          <span className="text-[0.625rem]">{badgeConfig.label}</span>
                        </Badge>
                      );
                    })()}
                  </motion.div>
                </div>
              </div>
              <div className="w-full items-center justify-start mb-2">
                <DynamicBadgeRenderer
                  items={Array.isArray(cardConfig.badgeField) ? cardConfig.badgeField : []}
                  maxBadges={maxBadges}
                  className="w-full"
                  badgeVariant="outline"
                />
              </div>
              
              {/* Performance Metrics */}
              {Array.isArray(cardConfig.metricsField) && cardConfig.metricsField.length > 0 && (
                <div className="w-full mb-3 border-t border-gray-100 pt-2 mt-2">
                  <div className="text-xs text-gray-500 mb-1">Performance:</div>
                  <DynamicMetricRenderer
                    metrics={cardConfig.metricsField}
                    maxMetrics={maxMetrics}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Separator after metrics */}
              {Array.isArray(cardConfig.metricsField) && cardConfig.metricsField.length > 0 && (
                <div className="w-full border-t border-gray-100 mb-3"></div>
              )}
              
              {/* Content Sections */}
              <div className="flex-1">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {filteredSections.map((section) => (
                    <div 
                      key={section.id || Math.random()} 
                      className={cn(
                        "overflow-hidden", 
                        section.colSpan === 2 ? "col-span-1 sm:col-span-2" : "col-span-1"
                      )}
                    >
                      {renderCardSection({ section, schema, data, maxMetrics })}
                    </div>
                  ))}
                </motion.div>
              </div>
            </>
          ) : (
            // List view layout
            <div className="flex items-center space-x-4 w-full flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={disableAnimation ? undefined : { scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Avatar
                    fallback={getInitials(cardConfig.avatarField)}
                    size="md"
                    variant="primary"
                    className="border border-gray-100"
                  >
                    {getInitials(cardConfig.avatarField)}
                  </Avatar>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.h3
                    className={cn(
                      "text-base font-semibold truncate",
                      !disableAnimation && "group-hover:text-violet-700 transition-colors duration-200"
                    )}
                    whileHover={disableAnimation ? undefined : { x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {cardConfig.title}
                  </motion.h3>
                  <motion.p
                    className={cn(
                      "text-xs text-gray-500 truncate",
                      !disableAnimation && "group-hover:text-gray-700 transition-colors duration-200"
                    )}
                    whileHover={disableAnimation ? undefined : { x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {cardConfig.subtitle}
                  </motion.p>
                  <DynamicBadgeRenderer
                    items={Array.isArray(cardConfig.badgeField) ? cardConfig.badgeField : []}
                    maxBadges={maxBadges}
                    className="mt-1"
                    badgeVariant="outline"
                  />
                  
                  {/* List view metrics removed */}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1 ml-auto mr-4">
                <motion.div
                  whileHover={disableAnimation ? undefined : { scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Rating
                    value={Number(cardConfig.ratingField) || 0}
                    size="sm"
                    showValue={true}
                  />
                </motion.div>
                <motion.div
                  whileHover={disableAnimation ? undefined : { scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {(() => {
                    const badgeConfig = getBadgeConfig(cardConfig.statusField, cardConfig.statusOptions);
                    return (
                      <Badge variant={badgeConfig.color} className="flex items-center gap-1 px-1 py-0.5 shadow-sm">
                        {badgeConfig.icon && <IconRenderer iconName={badgeConfig.icon} className="h-3 w-3" />}
                        <span className="text-xs">{badgeConfig.label}</span>
                      </Badge>
                    );
                  })()}
                </motion.div>
              </div>

              {/* Action Buttons for List View */}
              <DynamicCardActionButtons
                viewMode="list"
                showView={!!showView}
                showEdit={!!showEdit}
                showDelete={!!showDelete}
                onView={onView ? () => onView(data) : undefined}
                onEdit={onEdit ? () => onEdit(data) : undefined}
                onDelete={onDelete ? () => onDelete(data) : undefined}
              />
            </div>
          )}

          {/* Action Buttons - Only for Grid View */}
          {viewMode === 'grid' && (
            <DynamicCardActionButtons
              viewMode="grid"
              showView={!!showView}
              showEdit={!!showEdit}
              showDelete={!!showDelete}
              onView={onView ? () => onView(data) : undefined}
              onEdit={onEdit ? () => onEdit(data) : undefined}
              onDelete={onDelete ? () => onDelete(data) : undefined}
            />
          )}
        </CardContent>
      </CardWrapper>
    </motion.div>
  );
};

DynamicCardRenderer.displayName = 'DynamicCardRenderer';
