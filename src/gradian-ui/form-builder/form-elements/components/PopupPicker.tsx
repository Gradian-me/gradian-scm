'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getInitials } from '@/gradian-ui/data-display/utils';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { cn } from '@/gradian-ui/shared/utils';
import { UI_PARAMS } from '@/gradian-ui/shared/constants/application-variables';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { List, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getArrayValuesByRole, getFieldsByRole, getSingleValueByRole, getValueByRole } from '../utils/field-resolver';
import { Avatar } from './Avatar';
import { CodeBadge } from './CodeBadge';
import { SearchInput } from './SearchInput';
import { normalizeOptionArray, normalizeOptionEntry, NormalizedOption } from '../utils/option-normalizer';
import { BadgeOption, getBadgeMetadata } from '../utils/badge-utils';
import { renderHighlightedText } from '@/gradian-ui/shared/utils/highlighter';
import { formatFieldValue, getFieldValue } from '@/gradian-ui/data-display/table/utils/field-formatters';
import { cacheSchemaClientSide } from '@/gradian-ui/schema-manager/utils/schema-client-cache';

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      delay: Math.min(index * UI_PARAMS.CARD_INDEX_DELAY.STEP, UI_PARAMS.CARD_INDEX_DELAY.MAX),
    },
  }),
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.96,
    transition: {
      duration: 0.2,
    },
  },
};

interface PendingSelection {
  action: 'add' | 'remove';
  normalized?: NormalizedOption | null;
  raw?: any | null;
}

const normalizeIdList = (ids?: Array<string | number>): string[] =>
  (ids ?? []).map((id) => String(id));

const buildIdsKey = (ids?: Array<string | number>): string => {
  const normalized = normalizeIdList(ids);
  if (normalized.length === 0) {
    return '';
  }
  return normalized.slice().sort().join('|');
};

const buildSelectionEntry = (item: any, schema?: FormSchema | null): NormalizedOption => {
  if (!item) {
    return {
      id: '',
      label: '',
    };
  }

  const baseId = item.id ? String(item.id) : '';

  if (!schema) {
    const fallbackLabel = item.name || item.title || baseId;
    return {
      id: baseId,
      label: fallbackLabel || baseId,
      icon: item.icon,
      color: item.color,
    };
  }

  const title = getValueByRole(schema, item, 'title') || item.name || item.title || baseId;
  const icon = getSingleValueByRole(schema, item, 'icon') || item.icon;

  let color: string | undefined;
  const statusValue = getSingleValueByRole(schema, item, 'status') ?? item.status;
  if (statusValue) {
    const statusField = schema.fields?.find(field => field.role === 'status');
    const statusOptions = statusField?.options;
    if (statusOptions) {
      const statusMeta = getBadgeMetadata(statusValue, statusOptions as BadgeOption[]);
      color = statusMeta.color;
    }
  }

  const normalized = normalizeOptionEntry({
    id: baseId,
    label: title || baseId,
    icon,
    color,
  });

  return normalized || { id: baseId, label: title || baseId, icon, color };
};

export interface PopupPickerProps {
  isOpen: boolean;
  onClose: () => void;
  schemaId: string;
  schema?: FormSchema;
  onSelect: (selections: NormalizedOption[], rawItems: any[]) => Promise<void> | void;
  title?: string;
  description?: string;
  excludeIds?: string[]; // IDs to exclude from selection (already selected items)
  includeIds?: string[]; // IDs to include in selection (only show these items)
  selectedIds?: string[]; // IDs of items that are already selected (will be shown with distinct styling)
  canViewList?: boolean; // If true, shows a button to navigate to the list page
  viewListUrl?: string; // Custom URL for the list page (defaults to /page/{schemaId})
  allowMultiselect?: boolean; // Enables multi-select mode with confirm button
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
  allowMultiselect = false,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [schema, setSchema] = useState<FormSchema | null>(providedSchema || null);
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSelectedIds, setSessionSelectedIds] = useState<Set<string>>(new Set());
  const [pendingSelections, setPendingSelections] = useState<Map<string, PendingSelection>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseSelectedIdsRef = useRef<Set<string>>(new Set());
  const baseSelectedIds = baseSelectedIdsRef.current;

  // Use refs to track previous array values for comparison
  const prevExcludeIdsRef = useRef<string>('');
  const prevIncludeIdsRef = useRef<string>('');
  const prevSelectedIdsKeyRef = useRef<string>('');

  // Fetch schema if not provided
  useEffect(() => {
    if (!providedSchema && schemaId && isOpen) {
      const fetchSchema = async () => {
        try {
          const response = await apiRequest<FormSchema>(`/api/schemas/${schemaId}`);
          if (response.success && response.data) {
            await cacheSchemaClientSide(response.data, { queryClient, persist: false });
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
  }, [schemaId, providedSchema, isOpen, queryClient]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setFilteredItems([]);
      setSearchQuery('');
      setError(null);
      setPendingSelections(new Map());
      setSessionSelectedIds(new Set(baseSelectedIdsRef.current));
    }
  }, [isOpen]);

  useEffect(() => {
    const nextKey = buildIdsKey(selectedIds);
    if (nextKey === prevSelectedIdsKeyRef.current) {
      return;
    }
    prevSelectedIdsKeyRef.current = nextKey;
    const normalized = new Set(normalizeIdList(selectedIds));
    baseSelectedIdsRef.current = normalized;
    setSessionSelectedIds(new Set(normalized));
    setPendingSelections(new Map());
  }, [selectedIds]);

  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      
      if (includeIds && includeIds.length > 0) {
        queryParams.append('includeIds', includeIds.join(','));
      }
      
      if (excludeIds && excludeIds.length > 0) {
        queryParams.append('excludeIds', excludeIds.join(','));
      }
      
      const url = `/api/data/${schemaId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest<any[]>(url);
      
      if (response.success && response.data) {
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

    loadItems();
    // Note: excludeIds and includeIds are intentionally not in dependencies
    // We compare them inside the effect using refs to avoid infinite loops
  }, [schemaId, isOpen]);
  const handleRefresh = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    await loadItems();
  };


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

  const commitSingleSelection = async (item: any) => {
    if (isSubmitting) return;
    try {
      if (item.id) {
        setSessionSelectedIds((prev) => new Set([...prev, String(item.id)]));
      }
      const selectionEntry = buildSelectionEntry(item, schema);
      await onSelect([selectionEntry], [item]);
      onClose();
    } catch (error) {
      console.error('Error in commitSingleSelection:', error);
    }
  };

  const toggleSelection = (item: any) => {
    if (isSubmitting) {
      return;
    }

    if (!allowMultiselect) {
      void commitSingleSelection(item);
      return;
    }

    const itemId = String(item?.id ?? '');
    if (!itemId) {
      return;
    }

    const currentlySelected = sessionSelectedIds.has(itemId);
    const nextSelected = !currentlySelected;

    setSessionSelectedIds((prevIds) => {
      const updated = new Set(prevIds);
      if (nextSelected) {
        updated.add(itemId);
      } else {
        updated.delete(itemId);
      }
      return updated;
    });

    setPendingSelections((prev) => {
      const next = new Map(prev);
      const existing = next.get(itemId);
      const selectionEntry = buildSelectionEntry(item, schema);
      const isBaseSelection = baseSelectedIds.has(itemId);

      if (nextSelected) {
        // Selecting item
        if (isBaseSelection && existing?.action === 'remove') {
          next.delete(itemId);
        } else if (!isBaseSelection) {
          next.set(itemId, { action: 'add', normalized: selectionEntry, raw: item });
        } else {
          // Base item re-selected without pending removal - no change needed
          next.delete(itemId);
        }
      } else {
        // Deselecting item
        if (existing?.action === 'add') {
          next.delete(itemId);
        } else if (isBaseSelection) {
          next.set(itemId, { action: 'remove', normalized: selectionEntry, raw: item });
        } else {
          next.delete(itemId);
        }
      }

      return next;
    });

  };

  const buildSelectionData = (id: string): { normalized: NormalizedOption; raw: any } => {
    const pendingEntry = pendingSelections.get(id);
    if (pendingEntry && pendingEntry.action === 'add' && pendingEntry.normalized) {
      return {
        normalized: pendingEntry.normalized,
        raw: pendingEntry.raw ?? { id },
      };
    }

    const match = items.find((candidate) => String(candidate?.id ?? '') === id);
    if (match) {
      return {
        normalized: buildSelectionEntry(match, schema),
        raw: match,
      };
    }

    return {
      normalized: {
        id,
        label: id,
      },
      raw: { id },
    };
  };

  const handleClearSelection = () => {
    if (isSubmitting) {
      return;
    }

    if (!allowMultiselect) {
      return;
    }

    setSessionSelectedIds(new Set());
    setPendingSelections(() => {
      const next = new Map<string, PendingSelection>();
      baseSelectedIds.forEach((id) => {
        next.set(id, { action: 'remove' });
      });
      return next;
    });
  };

  const handleConfirmSelections = async () => {
    if (!allowMultiselect) {
      return;
    }

    let hasChanges = false;
    pendingSelections.forEach((entry) => {
      if (entry && (entry.action === 'add' || entry.action === 'remove')) {
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return;
    }
    setIsSubmitting(true);
    try {
      const finalSelectionIds = Array.from(sessionSelectedIds);
      const normalizedSelections: NormalizedOption[] = [];
      const rawSelections: any[] = [];

      finalSelectionIds.forEach((id) => {
        const data = buildSelectionData(id);
        normalizedSelections.push(data.normalized);
        rawSelections.push(data.raw);
      });

      await onSelect(normalizedSelections, rawSelections);
      setPendingSelections(new Map());
      onClose();
    } catch (error) {
      console.error('Error confirming selections:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingStats = useMemo(() => {
    let additions = 0;
    let removals = 0;
    pendingSelections.forEach((entry) => {
      if (!entry) return;
      if (entry.action === 'add') additions += 1;
      if (entry.action === 'remove') removals += 1;
    });
    return { additions, removals };
  }, [pendingSelections]);

  const hasPendingSelections = pendingStats.additions + pendingStats.removals > 0;
  const selectedCount = sessionSelectedIds.size;

  // Check if an item is selected
  const isItemSelected = (item: any): boolean => {
    const itemId = String(item.id || '');
    return sessionSelectedIds.has(itemId);
  };

  const handleViewList = () => {
    const url = viewListUrl || `/page/${schemaId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderItemCard = (item: any, index: number) => {
    const isSelected = isItemSelected(item);

    const baseCardClasses = "relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group";
    const selectedCardClasses = "border-violet-500 bg-gradient-to-br from-violet-50 via-white to-white shadow-lg ring-1 ring-violet-200";
    const defaultCardClasses = "border-gray-200 bg-white hover:border-violet-300 hover:shadow-md";

    const motionProps = {
      layout: true,
      variants: cardVariants,
      initial: 'hidden',
      animate: 'visible',
      exit: 'exit',
      custom: index,
    } as const;

    const highlightQuery = searchQuery.trim();

    if (!schema) {
      // Fallback rendering
      const displayName = item.name || item.title || item.id || `Item ${index + 1}`;
      return (
        <motion.div key={item.id || index} {...motionProps}>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSelection(item);
            }}
            className={cn(
              baseCardClasses,
              isSelected ? selectedCardClasses : defaultCardClasses
            )}
          >
            <div
              className={cn(
                "font-medium text-sm",
                isSelected ? "text-violet-900" : "text-gray-900"
              )}
            >
              {renderHighlightedText(displayName, highlightQuery)}
            </div>
          </div>
        </motion.div>
      );
    }

    // Extract data using schema roles
    const title = getValueByRole(schema, item, 'title') || item.name || `Item ${index + 1}`;
    const subtitle = getSingleValueByRole(schema, item, 'subtitle', item.email) || item.email || '';
    const avatarField = getSingleValueByRole(schema, item, 'avatar', item.name) || item.name || '?';
    // Get badge fields
    const badgeFields = getFieldsByRole(schema, 'badge');
    const allOptions = new Map<string, NormalizedOption>();
    let combinedBadgeField: any = null;

    badgeFields.forEach(field => {
      const value = item[field.name];
      const normalizedValue = normalizeOptionArray(value);
      if (field.options && Array.isArray(field.options)) {
        normalizeOptionArray(field.options).forEach((opt) => {
          if (!allOptions.has(opt.id)) {
            allOptions.set(opt.id, opt);
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

    // Find status field options
    const statusFieldDef = schema.fields?.find(f => f.role === 'status');
    const ratingFieldDef = schema.fields?.find(f => f.role === 'rating');
    const hasCodeField = schema.fields?.some(f => f.role === 'code') || false;
    const codeField = getSingleValueByRole(schema, item, 'code');
    const statusFieldValue = statusFieldDef ? getFieldValue(statusFieldDef, item) : null;
    const ratingFieldValue = ratingFieldDef ? getFieldValue(ratingFieldDef, item) : null;
    const statusFieldNode = statusFieldDef ? formatFieldValue(statusFieldDef, statusFieldValue, item) : null;
    const ratingFieldNode = ratingFieldDef ? formatFieldValue(ratingFieldDef, ratingFieldValue, item) : null;

    return (
      <motion.div key={item.id || index} {...motionProps}>
        <div
          onClick={() => toggleSelection(item)}
          className={cn(
            baseCardClasses,
            isSelected ? selectedCardClasses : defaultCardClasses
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
                    <h4
                      className={cn(
                        "text-sm font-semibold truncate transition-colors flex-1 min-w-0",
                        isSelected
                          ? "text-violet-900"
                          : "text-gray-900 group-hover:text-violet-700"
                      )}
                    >
                      {renderHighlightedText(title, highlightQuery)}
                    </h4>
                    {/* Code Badge */}
                    {hasCodeField && codeField && (
                      <CodeBadge code={codeField} />
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {renderHighlightedText(subtitle, highlightQuery)}
                    </p>
                  )}

                </div>

                {/* Rating and Status */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {ratingFieldNode && <div className="flex items-center gap-1">{ratingFieldNode}</div>}
                  {statusFieldNode && <div className="flex items-center gap-1">{statusFieldNode}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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
        // Prevent closing on outside click during loading or submission
        if (isLoading || isSubmitting) {
          e.preventDefault();
        }
      }} onEscapeKeyDown={(e) => {
        // Prevent closing on escape during loading or submission
        if (isLoading || isSubmitting) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
            <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle>{title || `Select ${schemaName}`}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
            <div className="flex items-center gap-2 me-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading || isSubmitting}
                aria-label="Refresh items"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-violet-600' : ''}`} />
              </Button>
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
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  View List
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="mb-4">
          <SearchInput
            config={{ name: 'picker-search', placeholder: `Search ${schemaName}...` }}
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            onClear={() => setSearchQuery('')}
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
              <AnimatePresence mode="sync">
                {filteredItems.map((item, index) => renderItemCard(item, index))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-2 pt-4 border-t">
          <Button 
            type="button"
            variant="ghost" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {allowMultiselect && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClearSelection();
              }}
              disabled={isSubmitting || selectedCount === 0}
            >
              Clear Selection
            </Button>
          )}
          {allowMultiselect && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleConfirmSelections();
              }}
              disabled={!hasPendingSelections || isSubmitting}
              className="inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? 'Applying...'
                : `Apply${hasPendingSelections ? ` (${selectedCount})` : ''}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

PopupPicker.displayName = 'PopupPicker';

