// Select Component

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { SelectProps } from '../types';
import { cn } from '../../../shared/utils';
import { IconRenderer } from '../../../../shared/utils/icon-renderer';
import { Badge } from '../../../../components/ui/badge';
import { motion } from 'framer-motion';
import { UI_PARAMS } from '@/shared/constants/application-variables';
import { extractFirstId, normalizeOptionArray, NormalizedOption } from '../utils/option-normalizer';
import { BadgeViewer } from '../utils/badge-viewer';
import { Check } from 'lucide-react';

export interface SelectOption {
  id?: string;
  value?: string;
  label: string;
  disabled?: boolean;
  icon?: string;
  color?: string; // Can be a badge variant (success, warning, etc.), custom hex color, or Tailwind classes
}

export interface SelectWithBadgesProps extends Omit<SelectProps, 'children'> {
  config?: any;
  options?: Array<SelectOption | string | number | null | undefined>;
  children?: React.ReactNode;
  placeholder?: string;
  error?: string;
  required?: boolean;
  onNormalizedChange?: (selection: NormalizedOption[]) => void;
}

export const Select: React.FC<SelectWithBadgesProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  options,
  value,
  onValueChange,
  placeholder,
  config,
  error,
  required,
  onNormalizedChange,
  onOpenChange,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const selectClasses = cn(
    sizeClasses[size],
    className
  );

  const fieldName = config?.name || 'unknown';
  const fieldLabel = config?.label;
  const fieldPlaceholder = placeholder || config?.placeholder || 'Select an option...';
  const allowMultiselect = Boolean(
    config?.metadata?.allowMultiselect ??
    (config as any)?.allowMultiselect
  );

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const shouldReopenRef = useRef(false);

  useEffect(() => {
    if (!allowMultiselect) {
      setIsSelectOpen(false);
    }
  }, [allowMultiselect]);

  const normalizedValueArray = useMemo(
    () => normalizeOptionArray(value),
    [value]
  );

  const normalizedValueIds = useMemo(
    () =>
      normalizedValueArray
        .map((opt) => opt.id)
        .filter((id): id is string => Boolean(id)),
    [normalizedValueArray]
  );

  const normalizedValueIdsKey = useMemo(
    () => JSON.stringify(normalizedValueIds),
    [normalizedValueIds]
  );

  const [multiSelectionIds, setMultiSelectionIds] = useState<string[]>(normalizedValueIds);

  useEffect(() => {
    if (!allowMultiselect) {
      setMultiSelectionIds([]);
      return;
    }

    const idsFromValue: string[] = normalizedValueIdsKey
      ? JSON.parse(normalizedValueIdsKey)
      : [];

    setMultiSelectionIds((prev) => {
      if (prev.length === idsFromValue.length) {
        let isEqual = true;
        for (let i = 0; i < prev.length; i += 1) {
          if (prev[i] !== idsFromValue[i]) {
            isEqual = false;
            break;
          }
        }
        if (isEqual) {
          return prev;
        }
      }
      return idsFromValue;
    });
  }, [allowMultiselect, normalizedValueIdsKey]);

  const multiSelectionSet = useMemo(
    () => new Set(multiSelectionIds),
    [multiSelectionIds]
  );

  // Check if color is a valid badge variant, custom color, or Tailwind classes
  const isValidBadgeVariant = (color?: string): boolean => {
    if (!color) return false;
    const validVariants = ['default', 'secondary', 'destructive', 'success', 'warning', 'info', 'outline', 'gradient', 'muted'];
    return validVariants.includes(color);
  };

  const isHexColor = (color: string): boolean => {
    return color.startsWith('#');
  };

  const isTailwindClasses = (color: string): boolean => {
    // Check if it contains Tailwind class patterns
    return color.includes('bg-') || 
           color.includes('text-') || 
           color.includes('border-') ||
           color.includes('rounded-') ||
           /^[a-z]+-[a-z0-9-]+/.test(color); // Matches Tailwind class patterns like bg-red-400
  };

  // Render badge or custom colored badge
  const renderBadgeContent = (option: NormalizedOption) => {
    if (!option.color) {
      return (
        <div className="flex items-center gap-2">
          {option.icon && <IconRenderer iconName={option.icon} className="h-4 w-4" />}
          {option.label}
        </div>
      );
    }

    const iconEl = option.icon ? (
      <IconRenderer iconName={option.icon} className="h-3 w-3" />
    ) : null;

    // Check badge variant
    if (isValidBadgeVariant(option.color)) {
      return (
        <Badge variant={option.color as any} className="flex items-center gap-1.5 px-2 py-0.5">
          {iconEl}
          {option.label}
        </Badge>
      );
    }

    // Tailwind classes - render with custom classes
    if (isTailwindClasses(option.color)) {
      // Check if text color is already specified, if not add a default
      const hasTextColor = option.color.includes('text-');
      const defaultTextColor = hasTextColor ? '' : 'text-white';
      
      return (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border ${defaultTextColor} ${option.color}`}>
          {iconEl}
          {option.label}
        </div>
      );
    }

    // Hex color - render with inline styles
    if (isHexColor(option.color)) {
      return (
        <div 
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: option.color, color: '#fff', border: 'none' }}
        >
          {iconEl}
          {option.label}
        </div>
      );
    }

    // Fallback - just render with color as className
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${option.color}`}>
        {iconEl}
        {option.label}
      </div>
    );
  };

  // If options are provided, render them with badges
  const normalizedCurrentValue = extractFirstId(value);
  const normalizedValueEntry = normalizedValueArray[0];

  if (options && options.length > 0) {
    const normalizedOptions = normalizeOptionArray(options).map((opt) => ({
      ...opt,
      label: opt.label ?? opt.id,
    }));

    const selectedOption = normalizedOptions.find((opt) => opt.id === normalizedCurrentValue);
    // Filter out empty string values as Radix doesn't allow them
    const validOptions = normalizedOptions.filter((opt) => opt.id && opt.id !== '');
    // Convert empty string to undefined so placeholder shows
    const selectValue = allowMultiselect
      ? undefined
      : selectedOption?.id ?? (normalizedCurrentValue === '' ? undefined : normalizedCurrentValue);
    const displayOption =
      !allowMultiselect
        ? selectedOption ??
          (normalizedValueEntry
            ? {
                ...normalizedValueEntry,
                label: normalizedValueEntry.label ?? normalizedValueEntry.id,
              }
            : undefined)
        : undefined;

    const multiSelectedOptions = allowMultiselect
      ? multiSelectionIds
          .map((id) => normalizedOptions.find((opt) => opt.id === id))
          .filter((opt): opt is NormalizedOption => Boolean(opt))
      : [];

    const handleRadixChange = (selectedId: string) => {
      if (onValueChange) {
        onValueChange(selectedId);
      }
      if (onNormalizedChange) {
        if (!selectedId) {
          onNormalizedChange([]);
          return;
        }
        const matched = normalizedOptions.find(opt => opt.id === selectedId);
        onNormalizedChange(matched ? [matched] : []);
      }
    };

    const handleMultiOptionToggle = (option: NormalizedOption) => {
      const optionId = option.id;
      if (!optionId) {
        return;
      }

      setMultiSelectionIds((prev) => {
        const alreadySelected = prev.includes(optionId);
        const next = alreadySelected
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId];

        if (onNormalizedChange) {
          const normalizedSelection = next
            .map((id) => normalizedOptions.find((opt) => opt.id === id))
            .filter((opt): opt is NormalizedOption => Boolean(opt));
          onNormalizedChange(normalizedSelection);
        }

        shouldReopenRef.current = true;
        // Re-open asynchronously to ensure Radix has time to process its close event
        requestAnimationFrame(() => {
          setIsSelectOpen(true);
        });
        return next;
      });
    };
    
    return (
      <div className="w-full">
        {fieldLabel && (
          <label
            htmlFor={fieldName}
            className={cn(
              'block text-sm font-medium mb-1',
              error ? 'text-red-700' : 'text-gray-700',
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {fieldLabel}
          </label>
        )}
        <RadixSelect
          value={selectValue}
          onValueChange={allowMultiselect ? undefined : handleRadixChange}
          {...(allowMultiselect
            ? {
                open: isSelectOpen,
                onOpenChange: (nextOpen: boolean) => {
                  if (!nextOpen) {
                    if (shouldReopenRef.current) {
                      shouldReopenRef.current = false;
                      requestAnimationFrame(() => setIsSelectOpen(true));
                      return;
                    }
                  } else {
                    shouldReopenRef.current = false;
                  }
                  setIsSelectOpen(nextOpen);
                  onOpenChange?.(nextOpen);
                },
              }
            : {
                onOpenChange,
              })}
          {...props}
        >
          <SelectTrigger
            className={cn(
              selectClasses,
              allowMultiselect && 'min-h-10 items-start py-2'
            )}
            id={fieldName}
          >
            <SelectValue placeholder={fieldPlaceholder}>
              {allowMultiselect ? (
                multiSelectedOptions.length > 0 ? (
                  <BadgeViewer
                    field={{
                      name: fieldName,
                      label: fieldLabel ?? fieldName,
                      type: 'select',
                      component: 'select',
                      sectionId: '',
                      options: normalizedOptions,
                    } as any}
                    value={multiSelectedOptions}
                    maxBadges={0}
                    className="flex flex-wrap gap-1"
                    enforceVariant={false}
                  />
                ) : null
              ) : (
                displayOption && renderBadgeContent(displayOption)
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            onCloseAutoFocus={(event) => {
              if (allowMultiselect) {
                event.preventDefault();
              }
            }}
          >
            {validOptions.map((option, index) => (
              <motion.div
                key={option.id ?? index}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(
                    index * UI_PARAMS.CARD_INDEX_DELAY.STEP,
                    UI_PARAMS.CARD_INDEX_DELAY.SKELETON_MAX
                  ),
                  ease: 'easeOut',
                }}
              >
                <SelectItem
                  value={option.id as string}
                  disabled={option.disabled}
                  className={cn(
                    allowMultiselect && 'relative pl-8',
                    allowMultiselect &&
                      option.id &&
                      multiSelectionSet.has(option.id) &&
                      'bg-violet-50 text-violet-700'
                  )}
                  {...(allowMultiselect
                    ? {
                        onSelect: (event: Event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleMultiOptionToggle(option);
                        },
                        onPointerDown: (event: React.PointerEvent) => {
                          event.preventDefault();
                          event.stopPropagation();
                        },
                      }
                    : {})}
                >
                  {allowMultiselect && (
                    <span className="absolute left-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded border border-gray-300 bg-white">
                      <Check
                        className={cn(
                          'h-3 w-3 text-violet-600 transition-opacity',
                          option.id && multiSelectionSet.has(option.id)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </span>
                  )}
                  {renderBadgeContent(option)}
                </SelectItem>
              </motion.div>
            ))}
          </SelectContent>
        </RadixSelect>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Default behavior for children
  return (
    <div className="w-full">
      {fieldLabel && (
        <label
          htmlFor={fieldName}
          className={cn(
            'block text-sm font-medium mb-1',
            error ? 'text-red-700' : 'text-gray-700',
            required && 'after:content-["*"] after:ml-1 after:text-red-500'
          )}
        >
          {fieldLabel}
        </label>
      )}
      <RadixSelect value={value} onValueChange={onValueChange} {...props}>
        <SelectTrigger className={selectClasses} id={fieldName}>
          <SelectValue placeholder={fieldPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.2,
                delay: Math.min(
                  index * UI_PARAMS.CARD_INDEX_DELAY.STEP,
                  UI_PARAMS.CARD_INDEX_DELAY.SKELETON_MAX
                ),
                ease: 'easeOut',
              }}
            >
              {child}
            </motion.div>
          ))}
        </SelectContent>
      </RadixSelect>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Export sub-components for convenience
export { SelectContent, SelectItem, SelectTrigger, SelectValue };

Select.displayName = 'Select';
