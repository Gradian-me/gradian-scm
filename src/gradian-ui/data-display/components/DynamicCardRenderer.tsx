// Dynamic Card Renderer Component

import React from 'react';
import { motion } from 'framer-motion';
import { CardWrapper } from '../card/components/CardWrapper';
import { CardContent } from '../card/components/CardContent';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { FormSchema } from '../../form-builder/types/form-schema';
import { cn } from '../../shared/utils';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  Building
} from 'lucide-react';

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
  // Get card configuration from schema
  const cardConfig = schema?.cardConfig || {
    title: 'name',
    subtitle: 'email',
    avatar: 'name',
    status: 'status',
    rating: 'rating',
    sections: []
  };

  // Helper functions
  const getInitials = (name: string) => {
    return (name || 'V').split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'INACTIVE': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return '✓';
      case 'PENDING': return '⏳';
      case 'INACTIVE': return '✗';
      default: return '?';
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-3 w-3 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const renderFieldValue = (field: any, value: any) => {
    if (!value) return 'N/A';
    
    switch (field.type) {
      case 'email':
        return (
          <div className="flex items-center space-x-2 text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
            <Mail className="h-4 w-4 group-hover:text-blue-500 transition-colors duration-200" />
            <span className="truncate">{value}</span>
          </div>
        );
      case 'tel':
        return (
          <div className="flex items-center space-x-2 text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
            <Phone className="h-4 w-4 group-hover:text-blue-500 transition-colors duration-200" />
            <span>{value}</span>
          </div>
        );
      case 'textarea':
        return (
          <div className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
            <span className="line-clamp-2">{value}</span>
          </div>
        );
      case 'checkbox':
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 2).map((item: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
              {value.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{value.length - 2}
                </Badge>
              )}
            </div>
          );
        }
        return value ? 'Yes' : 'No';
      case 'select':
        return (
          <div className="flex items-center space-x-2 text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
            <MapPin className="h-4 w-4 group-hover:text-green-500 transition-colors duration-200" />
            <span>{value}</span>
          </div>
        );
      case 'object':
        if (typeof value === 'object' && value !== null) {
          return (
            <div className="space-y-1">
              {Object.entries(value).slice(0, 3).map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-gray-700 font-medium">
                    {typeof val === 'number' ? val.toLocaleString() : String(val)}
                  </span>
                </div>
              ))}
              {Object.keys(value).length > 3 && (
                <div className="text-xs text-gray-400">
                  +{Object.keys(value).length - 3} more metrics
                </div>
              )}
            </div>
          );
        }
        return 'N/A';
      default:
        return (
          <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
            {value}
          </span>
        );
    }
  };

  const renderSection = (section: any) => {
    const sectionFields = section?.fields || [];
    const sectionData = data[section?.id] || {};

    return (
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
        className="space-y-2"
      >
        <span className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
          {section?.title}:
        </span>
        <div className="space-y-1">
          {sectionFields.map((field: any) => {
            const value = sectionData[field?.name] || data[field?.name];
            return (
              <div key={field?.id || Math.random()}>
                {renderFieldValue(field, value)}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
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
          name: `Dynamic Card ${data[cardConfig.title] || 'Unknown'}`,
          styling: { variant: 'default', size: 'md' },
          behavior: { hoverable: true, clickable: true }
        }}
        className="bg-white group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 ease-out transform border-2 border-transparent group-hover:border-blue-200 group-hover:bg-linear-to-br group-hover:from-white group-hover:to-blue-50/30"
      >
        <CardContent className={viewMode === 'list' ? 'p-4' : 'p-6'}>
          <div className={contentClasses}>
            <div className="flex-1">
              {viewMode === 'grid' ? (
                // Grid view layout
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div 
                      className="h-12 w-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-medium text-white shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {getInitials(data[cardConfig.title] || 'V')}
                    </motion.div>
                    <div className="flex-1">
                      <motion.h3 
                        className="text-lg font-semibold group-hover:text-blue-700 transition-colors duration-200"
                        whileHover={{ x: 2 }}
                      >
                        {data[cardConfig.title] || 'Unknown'}
                      </motion.h3>
                      <motion.div 
                        className="flex items-center space-x-1 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {getRatingStars(data[cardConfig.rating] || 0)}
                        <span className="text-sm text-gray-500 ml-1 group-hover:text-gray-700 transition-colors duration-200">
                          {(data[cardConfig.rating] || 0).toFixed(1)}
                        </span>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge variant={getStatusColor(data[cardConfig.status])} className="flex items-center space-x-1 shadow-sm">
                        <span>{getStatusIcon(data[cardConfig.status])}</span>
                        <span>{data[cardConfig.status] || 'PENDING'}</span>
                      </Badge>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    {(cardConfig.sections || []).map((section) => (
                      <div key={section?.id || Math.random()}>
                        {renderSection(section)}
                      </div>
                    ))}
                  </motion.div>
                </>
              ) : (
                // List view layout
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-medium text-white shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {getInitials(data[cardConfig.title] || 'V')}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold group-hover:text-blue-700 transition-colors duration-200 truncate">
                      {data[cardConfig.title] || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200 truncate">
                      {data[cardConfig.subtitle] || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(data[cardConfig.status])} className="text-xs">
                      {data[cardConfig.status] || 'PENDING'}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {getRatingStars(data[cardConfig.rating] || 0)}
                      <span className="text-xs text-gray-500">
                        {(data[cardConfig.rating] || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons for List View */}
                  <div className="flex items-center space-x-2">
                    {onView && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onView(data)}
                          className="h-8 w-8 p-0 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                    {onEdit && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEdit(data)}
                          className="h-8 w-8 p-0 group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                    {onDelete && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onDelete(data)}
                          className="h-8 w-8 p-0 group-hover:bg-red-50 group-hover:border-red-300 group-hover:text-red-700 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons - Only for Grid View - Fixed */}
          {viewMode === 'grid' && (
            <div className="flex space-y-2 mt-4">
              <motion.div 
                className="flex gap-2 flex-row w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {onView && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onView(data)}
                      className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </motion.div>
                )}
                {onEdit && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(data)}
                      className="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </motion.div>
                )}
                {onDelete && (
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
                      <Trash2 className="h-4 w-4 mr-2" />
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
