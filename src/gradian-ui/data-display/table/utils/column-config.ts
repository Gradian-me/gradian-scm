import { ColumnWidthConfig, ColumnWidthMap } from '../types';

export const DEFAULT_COLUMN_WIDTHS: ColumnWidthMap = {
  text: { minWidth: 150, maxWidth: 400 },
  textarea: { minWidth: 180, maxWidth: 500 },
  email: { minWidth: 200, maxWidth: 300 },
  url: { minWidth: 220, maxWidth: 350 },
  phone: { minWidth: 150, maxWidth: 200 },
  tel: { minWidth: 150, maxWidth: 200 },
  number: { minWidth: 100, maxWidth: 150 },
  currency: { minWidth: 120, maxWidth: 180 },
  percentage: { minWidth: 100, maxWidth: 130 },
  date: { minWidth: 120, maxWidth: 150 },
  'datetime-local': { minWidth: 180, maxWidth: 220 },
  datetime: { minWidth: 180, maxWidth: 220 },
  select: { minWidth: 150, maxWidth: 250 },
  picker: { minWidth: 150, maxWidth: 280 },
  radio: { minWidth: 120, maxWidth: 200 },
  checkbox: { minWidth: 100, maxWidth: 150 },
  'checkbox-list': { minWidth: 150, maxWidth: 300 },
  file: { minWidth: 150, maxWidth: 250 },
  avatar: { minWidth: 80, maxWidth: 120 },
  'image-text': { minWidth: 200, maxWidth: 350 },
  icon: { minWidth: 80, maxWidth: 120 },
  'icon-input': { minWidth: 100, maxWidth: 150 },
  'color-picker': { minWidth: 100, maxWidth: 150 },
  rating: { minWidth: 100, maxWidth: 150 },
  badge: { minWidth: 100, maxWidth: 200 },
  countdown: { minWidth: 120, maxWidth: 180 },
  button: { minWidth: 100, maxWidth: 200 },
  input: { minWidth: 120, maxWidth: 300 },
  password: { minWidth: 120, maxWidth: 200 },
  default: { minWidth: 100, maxWidth: 300 },
};

export function resolveColumnWidth(
  field: any,
  columnWidths?: ColumnWidthMap
): ColumnWidthConfig {
  const widthConfig = columnWidths || DEFAULT_COLUMN_WIDTHS;
  const fieldType = field?.type || 'default';
  let widthSettings = widthConfig[fieldType] || widthConfig.default || {};

  const normalizedFieldName = typeof field?.name === 'string' ? field.name.toLowerCase() : '';

  if (normalizedFieldName.includes('address') || field?.role === 'location') {
    widthSettings = { maxWidth: 400, ...widthSettings };
  } else if (['city', 'state', 'zipcode', 'zip'].includes(normalizedFieldName)) {
    widthSettings = { maxWidth: 200, ...widthSettings };
  } else if (field?.role === 'badge') {
    widthSettings = { maxWidth: 300, ...widthSettings };
  }

  return widthSettings;
}

export function shouldAllowWrap(field: any, widthSettings: ColumnWidthConfig): boolean {
  const isNumericType = ['number', 'currency', 'percentage'].includes(field?.type);
  const isStatusType = field?.role === 'status';
  const isBadgeType = field?.role === 'badge';
  const baseAllowWrap = widthSettings.maxWidth != null;

  return baseAllowWrap && !isNumericType && !isStatusType && !isBadgeType;
}


