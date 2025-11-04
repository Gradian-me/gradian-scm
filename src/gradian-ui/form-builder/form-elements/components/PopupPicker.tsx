'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from './Avatar';
import { Badge } from '@/components/ui/badge';
import { CodeBadge } from './CodeBadge';
import { IconRenderer } from '@/shared/utils/icon-renderer';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { apiRequest } from '@/shared/utils/api';
import { getValueByRole, getSingleValueByRole, getFieldsByRole, getArrayValuesByRole } from '../utils/field-resolver';
import { getInitials, getBadgeConfig } from '@/gradian-ui/data-display/utils';
import { BadgeViewer } from '../utils/badge-viewer';
import { Search, Loader2, List } from 'lucide-react';
import { cn } from '@/gradian-ui/shared/utils';

export interface PopupPickerProps {
  isOpen: boolean;
  onClose: () => void;
  schemaId: string;
  schema?: FormSchema;
  onSelect: (item: any) => void;
  title?: string;
  description?: string;
  excludeIds?: string[]; // IDs to exclude from selection (already selected items)
  includeIds?: string[]; // IDs to include in selection (only show these items)
  selectedIds?: string[]; // IDs of items that are already selected (will be shown with distinct styling)
  canViewList?: boolean; // If true, shows a button to navigate to the list page
  viewListUrl?: string; // Custom URL for the list page (defaults to /page/{schemaId})
}

export const PopupPicker: React.FC<PopupPickerProps> = ({
  isOpen,
  onClose,
  schemaId,
  schema: providedSchema,
  onSelect,
  title,
  description,
  excludeIds = [],
  includeIds,
  selectedIds = [],
  canViewList = false,
  viewListUrl,
}) => {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema | null>(providedSchema || null);
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSelectedIds, setSessionSelectedIds] = useState<Set<string>>(new Set());

  // Use refs to track previous array values for comparison
  const prevExcludeIdsRef = useRef<string>('');
  const prevIncludeIdsRef = useRef<string>('');

  // Fetch schema if not provided
  useEffect(() => {
    if (!providedSchema && schemaId && isOpen) {
      const fetchSchema = async () => {
        try {
          const response = await apiRequest<FormSchema>(`/api/schemas/${schemaId}`);
          if (response.success && response.data) {
            setSchema(response.data);
          }
        } catch (err) {
          console.error('Error fetching schema:', err);
        }
      };
      fetchSchema();
    } else if (providedSchema) {
      setSchema(providedSchema);
    }
  }, [schemaId, providedSchema, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setFilteredItems([]);
      setSearchQuery('');
      setError(null);
      setSessionSelectedIds(new Set());
      // Don't reset refs here - we want to track changes across opens
    }
  }, [isOpen]);

  // Fetch items - only when modal opens
  // Array comparisons are done inside the effect to avoid dependency issues
  useEffect(() => {
    if (!schemaId || !isOpen) {
      return;
    }

    // Convert arrays to strings for comparison (compute inside effect to avoid dependency issues)
    const excludeIdsKey = excludeIds && excludeIds.length > 0 
      ? JSON.stringify(excludeIds.slice().sort())
      : '';
    const includeIdsKey = includeIds && includeIds.length > 0
      ? JSON.stringify(includeIds.slice().sort())
      : '';

    // Check if arrays have actually changed (by content, not reference)
    const excludeIdsChanged = excludeIdsKey !== prevExcludeIdsRef.current;
    const includeIdsChanged = includeIdsKey !== prevIncludeIdsRef.current;

    // Only fetch if this is the first time opening OR if arrays have changed
    const shouldFetch = prevExcludeIdsRef.current === '' || prevIncludeIdsRef.current === '' || excludeIdsChanged || includeIdsChanged;

    if (!shouldFetch) {
      return;
    }

    // Update refs with current values
    prevExcludeIdsRef.current = excludeIdsKey;
    prevIncludeIdsRef.current = includeIdsKey;

    setIsLoading(true);
    setError(null);
    
    const fetchItems = async () => {
      try {
        // Build query params
        const queryParams = new URLSearchParams();
        
        // Add includeIds if provided
        if (includeIds && includeIds.length > 0) {
          queryParams.append('includeIds', includeIds.join(','));
        }
        
        // Add excludeIds if provided
        if (excludeIds && excludeIds.length > 0) {
          queryParams.append('excludeIds', excludeIds.join(','));
        }
        
        const url = `/api/data/${schemaId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await apiRequest<any[]>(url);
        
        if (response.success && response.data) {
          // Items are already filtered by the API
          const itemsArray = Array.isArray(response.data) ? response.data : [];
          setItems(itemsArray);
          setFilteredItems(itemsArray);
        } else {
          setError(response.error || 'Failed to fetch items');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
    // Note: excludeIds and includeIds are intentionally not in dependencies
    // We compare them inside the effect using refs to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaId, isOpen]);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = items.filter((item) => {
      if (!schema) {
        const title = item.name || item.title || '';
        const subtitle = item.email || item.subtitle || '';
        return title.toLowerCase().includes(query) || subtitle.toLowerCase().includes(query);
      }

      const title = getValueByRole(schema, item, 'title') || item.name || '';
      const subtitle = getSingleValueByRole(schema, item, 'subtitle', item.email) || item.email || '';
      
      return title.toLowerCase().includes(query) || subtitle.toLowerCase().includes(query);
    });

    setFilteredItems(filtered);
  }, [searchQuery, items, schema]);

  const handleSelect = async (item: any) => {
    // Prevent form submission
    try {
      // Track selection in session
      if (item.id) {
        setSessionSelectedIds(prev => new Set([...prev, String(item.id)]));
      }
      await onSelect(item);
      onClose();
    } catch (error) {
      console.error('Error in handleSelect:', error);
      // Don't close on error
    }
  };

  // Check if an item is selected
  const isItemSelected = (item: any): boolean => {
    const itemId = String(item.id || '');
    return selectedIds.includes(itemId) || sessionSelectedIds.has(itemId);
  };

  const handleViewList = () => {
    const url = viewListUrl || `/page/${schemaId}`;
    router.push(url);
    onClose();
  };

  const renderItemCard = (item: any, index: number) => {
    const isSelected = isItemSelected(item);
    
    if (!schema) {
      // Fallback rendering
      const displayName = item.name || item.title || item.id || `Item ${index + 1}`;
      return (
        <div
          key={item.id || index}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSelect(item);
          }}
          className={cn(
            "p-4 rounded-lg border cursor-pointer transition-all",
            isSelected
              ? "border-violet-500 bg-violet-50 shadow-md"
              : "border-gray-200 hover:border-violet-300 hover:shadow-md bg-white"
          )}
        >
          <div className={cn(
            "font-medium text-sm",
            isSelected ? "text-violet-900" : "text-gray-900"
          )}>{displayName}</div>
        </div>
      );
    }

    // Extract data using schema roles
    const title = getValueByRole(schema, item, 'title') || item.name || `Item ${index + 1}`;
    const subtitle = getSingleValueByRole(schema, item, 'subtitle', item.email) || item.email || '';
    const avatarField = getSingleValueByRole(schema, item, 'avatar', item.name) || item.name || '?';
    const statusField = getSingleValueByRole(schema, item, 'status') || item.status || '';
    const ratingField = getSingleValueByRole(schema, item, 'rating') || item.rating || 0;

    // Get badge fields
    const badgeFields = getFieldsByRole(schema, 'badge');
    const allBadgeValues: any[] = [];
    const allOptions = new Map<string, any>();
    let combinedBadgeField: any = null;

    badgeFields.forEach(field => {
      const value = item[field.name];
      if (value && Array.isArray(value)) {
        allBadgeValues.push(...value);
      }
      if (field.options && Array.isArray(field.options)) {
        field.options.forEach((opt: any) => {
          if (!allOptions.has(opt.value)) {
            allOptions.set(opt.value, opt);
          }
        });
      }
      if (!combinedBadgeField && field) {
        combinedBadgeField = { ...field, options: Array.from(allOptions.values()) };
      }
    });

    if (combinedBadgeField && allOptions.size > 0) {
      combinedBadgeField.options = Array.from(allOptions.values());
    }

    const badgeValues = allBadgeValues.length > 0
      ? allBadgeValues
      : (getArrayValuesByRole(schema, item, 'badge') || []);

    // Find status field options
    const statusFieldDef = schema.fields?.find(f => f.role === 'status');
    const statusOptions = statusFieldDef?.options;
    const hasRatingField = schema.fields?.some(f => f.role === 'rating') || false;
    const hasStatusField = schema.fields?.some(f => f.role === 'status') || false;
    const hasCodeField = schema.fields?.some(f => f.role === 'code') || false;
    const codeField = getSingleValueByRole(schema, item, 'code');

    return (
      <div
        key={item.id || index}
        onClick={() => handleSelect(item)}
        className={cn(
          "p-4 rounded-xl border cursor-pointer transition-all duration-200",
          "group",
          isSelected
            ? "border-violet-500 bg-violet-50 shadow-md"
            : "border-gray-200 bg-white hover:border-violet-300 hover:shadow-md"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar
            fallback={getInitials(avatarField)}
            size="md"
            variant="primary"
            className={cn(
              "border shrink-0 transition-colors",
              isSelected
                ? "border-violet-400"
                : "border-gray-200 group-hover:border-violet-300"
            )}
          >
            {getInitials(avatarField)}
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={cn(
                    "text-sm font-semibold truncate transition-colors flex-1 min-w-0",
                    isSelected
                      ? "text-violet-900"
                      : "text-gray-900 group-hover:text-violet-700"
                  )}>
                    {title}
                  </h4>
                  {/* Code Badge */}
                  {hasCodeField && codeField && (
                    <CodeBadge code={codeField} />
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {subtitle}
                  </p>
                )}

                {/* Badges */}
                {combinedBadgeField && badgeValues.length > 0 && (
                  <div className="mt-2">
                    <BadgeViewer
                      field={combinedBadgeField}
                      value={badgeValues}
                      maxBadges={2}
                      badgeVariant="outline"
                      animate={false}
                    />
                  </div>
                )}
              </div>

              {/* Rating and Status */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {hasRatingField && (
                  <div className="text-xs text-gray-600 font-medium">
                    ⭐ {Number(ratingField) || 0}
                  </div>
                )}
                {hasStatusField && statusField && (() => {
                  const badgeConfig = getBadgeConfig(statusField, statusOptions);
                  return (
                    <Badge variant={badgeConfig.color} className="flex items-center gap-1 px-1.5 py-0.5 text-xs">
                      {badgeConfig.icon && <IconRenderer iconName={badgeConfig.icon} className="h-3 w-3" />}
                      <span>{badgeConfig.label}</span>
                    </Badge>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const schemaName = schema?.plural_name || schema?.singular_name || schemaId;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only close if explicitly set to false (not opening)
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-3xl w-full h-full rounded-none md:rounded-2xl md:max-h-[70vh] flex flex-col" onPointerDownOutside={(e) => {
        // Prevent closing on outside click during loading
        if (isLoading) {
          e.preventDefault();
        }
      }} onEscapeKeyDown={(e) => {
        // Prevent closing on escape during loading
        if (isLoading) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle>{title || `Select ${schemaName}`}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
            {canViewList && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewList();
                }}
                className="flex items-center gap-2 me-4"
              >
                <List className="h-4 w-4" />
                View All
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={`Search ${schemaName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading items...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 text-sm">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              {searchQuery ? `No items found matching "${searchQuery}"` : 'No items available'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item, index) => renderItemCard(item, index))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            type="button"
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

PopupPicker.displayName = 'PopupPicker';

