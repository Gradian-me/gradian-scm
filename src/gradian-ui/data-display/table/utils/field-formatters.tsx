import React from 'react';
import { formatCurrency, formatDate, formatNumber } from '@/gradian-ui/shared/utils';
import { BadgeViewer } from '@/gradian-ui/form-builder/form-elements/utils/badge-viewer';
import { Badge } from '@/gradian-ui/form-builder/form-elements/components/Badge';
import { IconRenderer } from '@/shared/utils/icon-renderer';
import { getBadgeConfig, mapBadgeColorToVariant } from '../../utils';

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

  if (field?.type === 'picker' && field.targetSchema && row) {
    if (typeof value === 'object' && value !== null && value.id && value.label) {
      return <span>{String(value.label)}</span>;
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
    const badgeConfig = getBadgeConfig(String(value), statusOptions);
    return (
      <div className="inline-flex items-center whitespace-nowrap">
        <Badge
          variant={mapBadgeColorToVariant(badgeConfig.color)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] leading-tight w-auto whitespace-nowrap"
        >
          {badgeConfig.icon && <IconRenderer iconName={badgeConfig.icon} className="h-2.5 w-2.5" />}
          <span>{badgeConfig.label}</span>
        </Badge>
      </div>
    );
  }

  if (field?.role === 'badge' && Array.isArray(value)) {
    return (
      <BadgeViewer
        field={field}
        value={value}
        badgeVariant="outline"
        animate={true}
        className="flex-nowrap overflow-x-auto"
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
      if (Array.isArray(value)) {
        return <span>{value.join(', ')}</span>;
      }
      return <span>{String(value)}</span>;
    default:
      return <span>{String(value)}</span>;
  }
};


