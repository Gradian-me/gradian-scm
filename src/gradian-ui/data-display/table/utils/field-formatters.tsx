import React from 'react';
import { formatCurrency, formatDate, formatNumber } from '@/gradian-ui/shared/utils';
import { BadgeViewer } from '@/gradian-ui/form-builder/form-elements/utils/badge-viewer';
import { Badge } from '@/gradian-ui/form-builder/form-elements/components/Badge';
import { IconRenderer } from '@/shared/utils/icon-renderer';
import { getBadgeConfig, mapBadgeColorToVariant } from '../../utils';
import { normalizeOptionArray } from '@/gradian-ui/form-builder/form-elements/utils/option-normalizer';

export const getFieldValue = (field: any, row: any): any => {
  if (!field || !row) return null;

  if (field.source) {
    const path = field.source.split('.');
    let value = row;
    for (const key of path) {
      value = value?.[key];
      if (value === undefined) return null;
    }
    return value;
  }

  if (field.compute && typeof field.compute === 'function') {
    return field.compute(row);
  }

  return row[field.name];
};

export const formatRelationType = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const cleaned = value.replace(/_/g, ' ').toLowerCase();
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatFieldValue = (
  field: any,
  value: any,
  row?: any
): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }

  const normalizedOptions = normalizeOptionArray(value);
  const hasStructuredOptions = normalizedOptions.length > 0 && (
    Array.isArray(value) ||
    (typeof value === 'object' && value !== null)
  );

  if (field?.type === 'picker' && field.targetSchema && row) {
    if (normalizedOptions.length > 0) {
      const primaryOption = normalizedOptions[0];
      return <span>{String(primaryOption.label ?? primaryOption.id)}</span>;
    }

    const resolvedKey = `_${field.name}_resolved`;
    const resolvedData = row[resolvedKey];
    if (resolvedData) {
      const displayValue = resolvedData._resolvedLabel || resolvedData.name || resolvedData.title || value;
      return <span>{String(displayValue)}</span>;
    }

    return <span>{String(value)}</span>;
  }

  const displayType = field?.type || 'text';

  if (field?.role === 'status') {
    const statusOptions = field.options || [];
    const primaryOption = normalizedOptions[0];
    const statusValue = primaryOption?.id ?? String(
      Array.isArray(value) ? value[0] : value
    );
    const badgeConfig = getBadgeConfig(statusValue, statusOptions);
    const badgeColor = primaryOption?.color ?? badgeConfig.color;
    const badgeIcon = primaryOption?.icon ?? badgeConfig.icon;
    const badgeLabel = primaryOption?.label ?? badgeConfig.label;
    return (
      <div className="inline-flex items-center whitespace-nowrap">
        <Badge
          variant={mapBadgeColorToVariant(badgeColor)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] leading-tight w-auto whitespace-nowrap"
        >
          {badgeIcon && <IconRenderer iconName={badgeIcon} className="h-2.5 w-2.5" />}
          <span>{badgeLabel}</span>
        </Badge>
      </div>
    );
  }

  if (field?.role === 'rating') {
    const numericValue = Number(value) || 0;
    const clampedValue = Math.max(0, Math.min(5, numericValue));
    return (
      <span className="inline-flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <IconRenderer
            key={`rating-${index}`}
            iconName={index < Math.round(clampedValue) ? 'Star' : 'StarOff'}
            className="h-4 w-4"
          />
        ))}
      </span>
    );
  }

  if (field?.role === 'badge' && Array.isArray(value)) {
    return (
      <BadgeViewer
        field={field}
        value={value}
        badgeVariant="outline"
        animate={true}
      />
    );
  }

  switch (displayType) {
    case 'currency':
      return (
        <span className="whitespace-nowrap">
          {formatCurrency(typeof value === 'number' ? value : parseFloat(value) || 0)}
        </span>
      );
    case 'percentage': {
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return <span className="whitespace-nowrap">{numValue.toFixed(2)}%</span>;
    }
    case 'number':
      return (
        <span className="whitespace-nowrap">
          {formatNumber(typeof value === 'number' ? value : parseFloat(value) || 0)}
        </span>
      );
    case 'date':
    case 'datetime-local':
      try {
        const dateValue = typeof value === 'string' ? new Date(value) : value;
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          return (
            <span>
              {formatDate(dateValue, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          );
        }
        return <span>{String(value)}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'array':
    case 'checkbox':
      if (normalizedOptions.length > 0) {
        const labels = normalizedOptions.map(opt => opt.label ?? opt.id).filter(Boolean);
        return <span>{labels.join(', ')}</span>;
      }
      if (Array.isArray(value)) {
        return <span>{value.join(', ')}</span>;
      }
      return <span>{String(value)}</span>;
    default:
      if (hasStructuredOptions) {
        const labels = normalizedOptions.map(opt => opt.label ?? opt.id).filter(Boolean);
        if (labels.length > 0) {
          return <span>{labels.join(', ')}</span>;
        }
      }
      if (normalizedOptions.length > 0 && !(Array.isArray(value) || typeof value === 'object')) {
        const label = normalizedOptions[0].label ?? normalizedOptions[0].id;
        return <span>{String(label)}</span>;
      }
      return <span>{String(value)}</span>;
  }
};


