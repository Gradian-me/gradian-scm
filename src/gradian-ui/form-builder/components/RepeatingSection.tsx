// Repeating Section Component

import React from 'react';
import { RepeatingSectionProps } from '@/gradian-ui/schema-manager/types/form-schema';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../shared/utils';

export const RepeatingSection: React.FC<RepeatingSectionProps> = ({
  section,
  items,
  onAdd,
  onRemove,
  renderItem,
  values,
  errors,
  touched,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
}) => {
  const { title, repeatingConfig } = section;
  const {
    minItems = 0,
    maxItems,
    addButtonText = 'Add Item',
    removeButtonText = 'Remove',
    emptyMessage = 'No items added yet',
    itemTitle = (index: number) => `${title} ${index + 1}`,
  } = repeatingConfig || {};

  const canAdd = !maxItems || items.length < maxItems;
  const canRemove = items.length > minItems;
  
  // Get section-level error
  const sectionError = errors?.[section.id];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-start gap-2">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            {items.length}
          </span>
          {sectionError && (
            <span className="text-sm text-red-600 mt-0.5" role="alert">
              • {sectionError}
            </span>
          )}
        </div>
        {section.description && (
          <p className="text-xs text-gray-600 mt-1">{section.description}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id || `item-${index}`} className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="pb-4 px-6 pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    {itemTitle(index + 1)}
                  </CardTitle>
                  {canRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(index)}
                      disabled={disabled}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">{removeButtonText}</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {renderItem(item, index)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {canAdd && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onAdd}
            disabled={disabled}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            {addButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};

RepeatingSection.displayName = 'RepeatingSection';
