import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { DynamicMetricRenderer } from '../components/DynamicMetricRenderer';

interface RenderFieldValueProps {
  field: any;
  value: any;
  maxMetrics?: number;
}

/**
 * Render a field value based on its type
 */
export const renderFieldValue = ({ field, value, maxMetrics = 3 }: RenderFieldValueProps): React.ReactNode => {
  if (!value) return 'N/A';
  
  // Handle performanceMetrics array
  if (field.name === 'performanceMetrics') {
    // If it's already an array of metric objects
    if (Array.isArray(value)) {
      return (
        <DynamicMetricRenderer 
          metrics={value}
          maxMetrics={maxMetrics}
          badgeVariant="outline"
          className="mt-1"
        />
      );
    }
    // If it's an object, convert to array format
    else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const metrics = Object.entries(value).map(([key, val]) => {
        // Convert to Pascal Case with spaces
        const pascalCaseLabel = key
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        return {
          id: key,
          label: pascalCaseLabel,
          value: typeof val === 'number' ? val : String(val),
          unit: typeof val === 'number' && key.toLowerCase().includes('score') ? '' : 
                typeof val === 'number' && key.toLowerCase().includes('orders') ? '' : '%',
          trend: 'none' as 'none'
        };
      });
      
      return (
        <DynamicMetricRenderer 
          metrics={metrics}
          maxMetrics={maxMetrics}
          badgeVariant="outline"
          className="mt-1"
        />
      );
    }
  }
  
  // Handle other object types
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    const metrics = Object.entries(value).map(([key, val]) => {
      // Convert to Pascal Case with spaces
      const pascalCaseLabel = key
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      return {
        id: key,
        label: pascalCaseLabel,
        value: typeof val === 'number' ? val : String(val),
        unit: typeof val === 'number' && field?.units?.[key] ? field.units[key] : 
              typeof val === 'number' && key.toLowerCase().includes('score') ? '' : 
              typeof val === 'number' && key.toLowerCase().includes('orders') ? '' : '%'
      };
    });
    
    return (
      <DynamicMetricRenderer 
        metrics={metrics}
        maxMetrics={maxMetrics}
        badgeVariant="outline"
        className="mt-1"
      />
    );
  }
  
  // Check if field has a custom icon defined
  const customIcon = field?.icon ? <IconRenderer iconName={field.icon} className="h-4 w-4 shrink-0" /> : null;
  
  switch (field.type) {
    case 'email':
      return (
        <div className="flex items-center space-x-2 text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
          {customIcon || <IconRenderer iconName="Mail" className="h-4 w-4 shrink-0" />}
          <span className="truncate">{value}</span>
        </div>
      );
    case 'tel':
      return (
        <div className="flex items-center space-x-2 text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
          {customIcon || <IconRenderer iconName="Phone" className="h-4 w-4 shrink-0" />}
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
          {customIcon || <IconRenderer iconName="MapPin" className="h-4 w-4 shrink-0" />}
          <span>{value}</span>
        </div>
      );
    default:
      // For default text fields, use custom icon if provided
      if (customIcon) {
        return (
          <div className="flex items-center space-x-2 text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
            {customIcon}
            <span>{value}</span>
          </div>
        );
      }
      return (
        <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
          {value}
        </span>
      );
  }
};

