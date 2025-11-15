import * as LucideIcons from 'lucide-react';

export interface LucideIconLibraryItem {
  id: string;
  label: string;
  icon: string;
}

const EXCLUDED_EXPORTS = new Set([
  'default',
  'createLucideIcon',
  'iconNode',
  'icons',
  'LucideIcon',
]);

const toReadableLabel = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase();

const isIconExport = (value: unknown): boolean => {
  if (typeof value === 'function') {
    return true;
  }
  if (value && typeof value === 'object' && '$$typeof' in (value as Record<string, unknown>)) {
    return true;
  }
  return false;
};

const seenIcons = new Set<string>();

const rawIconNames = Object.keys(LucideIcons)
  .filter((key) => {
    if (EXCLUDED_EXPORTS.has(key) || key.endsWith('Icon')) {
      return false;
    }
    const candidate = (LucideIcons as Record<string, unknown>)[key];
    if (!isIconExport(candidate)) {
      return false;
    }
    const normalizedKey = key.toLowerCase();
    if (seenIcons.has(normalizedKey)) {
      return false;
    }
    seenIcons.add(normalizedKey);
    return true;
  })
  .sort((a, b) => a.localeCompare(b));

export const LUCIDE_ICON_LIBRARY_ITEMS: LucideIconLibraryItem[] = rawIconNames.map((name) => ({
  id: name,
  label: toReadableLabel(name),
  icon: name,
}));


