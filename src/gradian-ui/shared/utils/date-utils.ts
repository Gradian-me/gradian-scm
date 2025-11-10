import { formatDistanceToNow, format } from 'date-fns';
import { enUS } from 'date-fns/locale';

/**
 * Formats a date as a relative time (e.g., "11 months ago")
 * @param date - The date to format
 * @param options - Optional formatting options
 * @returns Formatted relative time string
 */
export function formatRelativeTime(
  date: Date | string,
  options?: { addSuffix?: boolean }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, {
    addSuffix: options?.addSuffix ?? true,
    locale: enUS,
  });
}

/**
 * Formats a date in a readable format (e.g., "December 10, 2024 at 11:00 AM")
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatFullDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPpp', { locale: enUS });
}

/**
 * Formats a date in a short format (e.g., "Dec 10, 2024 11:00 AM")
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm', { locale: enUS });
}

/**
 * Formats a date with date and time (e.g., "Dec 10, 2024 11:00 AM")
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm', { locale: enUS });
}

/**
 * Formats a date for display (e.g., "December 10, 2024")
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPP', { locale: enUS });
}

/**
 * Formats a date with time only (e.g., "11:00 AM")
 * @param date - The date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'p', { locale: enUS });
}

/**
 * Creates a formatted "Created" label with relative time and full date on hover
 * @param date - The date to format
 * @returns Object with display text and hover title
 */
export function formatCreatedLabel(date: Date | string): {
  display: string;
  title: string;
} {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return {
    display: formatRelativeTime(dateObj),
    title: formatFullDate(dateObj),
  };
}

/**
 * Formats a date with custom format string
 * @param date - The date to format
 * @param formatString - The format string (e.g., 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatCustom(
  date: Date | string,
  formatString: string
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: enUS });
}

