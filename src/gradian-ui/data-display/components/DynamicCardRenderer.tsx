// Dynamic Card Renderer Component

import React from 'react';
import { motion } from 'framer-motion';
import { CardWrapper } from '../card/components/CardWrapper';
import { CardContent } from '../card/components/CardContent';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { FormSchema } from '../../form-builder/types/form-schema';
import { Rating, Avatar } from '../../form-builder/form-elements';
import { cn } from '../../shared/utils';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { getValueByRole, getSingleValueByRole, getInitials, getStatusColor, getStatusIcon, renderCardSection, getBadgeConfig } from '../utils';

export interface DynamicCardRendererProps {
  schema: FormSchema;
  data: any;
  index: number;
  onView?: (data: any) => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const DynamicCardRenderer: React.FC<DynamicCardRendererProps> = ({
  schema,
  data,
  index,
  onView,
  onEdit,
  onDelete,
  viewMode = 'grid',
  className
}) => {
  // Get card metadata from schema
  const cardMetadata = schema?.cardMetadata || {} as any;
  
  // Get actions configuration from schema
  const actionsConfig = schema?.ui?.actions || { view: true, edit: true, delete: true };
  
  // Conditionally determine if actions should be shown
  const showView = actionsConfig.view && onView;
  const showEdit = actionsConfig.edit && onEdit;
  const showDelete = actionsConfig.delete && onDelete;
  
  // Find status field options from schema
  const findStatusFieldOptions = () => {
    if (!schema || !schema.sections) return undefined;
    
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (field.role === 'status' && field.options) {
          return field.options;
        }
      }
    }
    return undefined;
  };
  
  const statusOptions = findStatusFieldOptions();
  
  const cardConfig = {
    title: getValueByRole(schema, data, 'title') || data.name || 'Unknown',
    subtitle: getSingleValueByRole(schema, data, 'subtitle', data.email) || data.email || 'No description',
    avatarField: getSingleValueByRole(schema, data, 'avatar', data.name) || data.name || 'V',
    statusField: getSingleValueByRole(schema, data, 'status') || data.status || 'PENDING',
    ratingField: getSingleValueByRole(schema, data, 'rating') || data.rating || 0,
    sections: (cardMetadata as any)?.sections || [],
    statusOptions
  };


  const cardClasses = cn(
    'group cursor-pointer',
    viewMode === 'list' && 'w-full',
    className
  );

  const contentClasses = cn(
    'flex gap-4',
    viewMode === 'grid' ? 'flex-col' : 'flex-row items-center'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -2,
        scale: 1.005,
        transition: { 
          duration: 0.2, 
          ease: "easeOut"
        }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className={cardClasses}
    >
      <CardWrapper 
        config={{
          id: `dynamic-card-${data.id || index}`,
          name: `Dynamic Card ${cardConfig.title}`,
          styling: { variant: 'default', size: 'md' },
          behavior: { hoverable: true, clickable: true }
        }}
        className="h-full bg-white group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 ease-out transform border-2 border-transparent group-hover:border-blue-200 group-hover:bg-linear-to-br group-hover:from-white group-hover:to-blue-50/30"
      >
        <CardContent className={cn("h-full flex flex-col", viewMode === 'list' ? 'p-4' : 'p-6')}>
          {viewMode === 'grid' ? (
            <>
              {/* Avatar and Status Header */}
              <div className="flex items-start space-x-3 mb-4 shrink-0">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Avatar
                        fallback={getInitials(cardConfig.avatarField)}
                        size="lg"
                        variant="primary"
                        className="shadow-lg"
                      >
                        {getInitials(cardConfig.avatarField)}
                      </Avatar>
                    </motion.div>
                    <div className="flex-1">
                      <motion.h3 
                        className="text-lg font-semibold group-hover:text-violet-700 transition-colors duration-200"
                        whileHover={{ x: 2 }}
                      >
                        {cardConfig.title}
                      </motion.h3>
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                  </div>
                  
                  {/* Content Sections */}
                  <div className="flex-1">
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {(cardConfig.sections || []).map((section: any) => (
                        <div key={section?.id || Math.random()}>
                          {renderCardSection({ section, schema, data })}
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </>
              ) : (
                // List view layout
                <div className="flex items-center space-x-4">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Avatar
                      fallback={getInitials(cardConfig.avatarField)}
                      size="md"
                      variant="primary"
                      className="shadow-lg"
                    >
                      {getInitials(cardConfig.avatarField)}
                    </Avatar>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.h3 
                      className="text-base font-semibold group-hover:text-violet-700 transition-colors duration-200 truncate"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {cardConfig.title}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200 truncate"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {cardConfig.subtitle}
                    </motion.p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Rating 
                        value={Number(cardConfig.ratingField) || 0} 
                        size="sm"
                        showValue={true}
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                  <div className="flex items-center space-x-2">
                    {showView && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onView(data)}
                          className="h-8 w-8 p-0 group-hover:bg-sky-50 group-hover:border-sky-300 group-hover:text-sky-700 transition-all duration-200"
                        >
                          <IconRenderer iconName="Eye" className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                    {showEdit && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEdit(data)}
                          className="h-8 w-8 p-0 group-hover:bg-emerald-50 group-hover:border-emerald-300 group-hover:text-emerald-700 transition-all duration-200"
                        >
                          <IconRenderer iconName="Edit" className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                    {showDelete && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onDelete(data)}
                            className="h-8 w-8 p-0 group-hover:bg-red-50 group-hover:border-red-300 group-hover:text-red-700 transition-all duration-200"
                        >
                          <IconRenderer iconName="Trash2" className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
          
          {/* Action Buttons - Only for Grid View - Fixed */}
          {viewMode === 'grid' && (
            <div className="flex space-y-2 mt-auto">
              <motion.div 
                className="flex gap-2 flex-row w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {showView && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onView(data)}
                      className="w-full group-hover:bg-sky-50 group-hover:border-sky-300 group-hover:text-sky-700 transition-all duration-200"
                    >
                      <IconRenderer iconName="Eye" className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </motion.div>
                )}
                {showEdit && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(data)}
                      className="w-full group-hover:bg-emerald-50 group-hover:border-emerald-300 group-hover:text-emerald-700 transition-all duration-200"
                    >
                      <IconRenderer iconName="Edit" className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </motion.div>
                )}
                {showDelete && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(data)}
                      className="w-full group-hover:bg-red-50 group-hover:border-red-300 group-hover:text-red-700 transition-all duration-200"
                    >
                      <IconRenderer iconName="Trash2" className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </CardContent>
      </CardWrapper>
    </motion.div>
  );
};

DynamicCardRenderer.displayName = 'DynamicCardRenderer';
