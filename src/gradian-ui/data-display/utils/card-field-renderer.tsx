import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { IconRenderer } from '../../../shared/utils/icon-renderer';

interface RenderFieldValueProps {
  field: any;
  value: any;
}

/**
 * Render a field value based on its type
 */
export const renderFieldValue = ({ field, value }: RenderFieldValueProps): React.ReactNode => {
  if (!value) return 'N/A';
  
  // Check if value is an object and handle it
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    return (
      <div className="space-y-1">
        {Object.entries(value).slice(0, 3).map(([key, val]) => (
          <div key={key} className="flex justify-between text-xs">
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

