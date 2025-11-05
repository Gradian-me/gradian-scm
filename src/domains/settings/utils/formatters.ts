/**
 * Settings Formatters
 * Formatting utilities for settings data
 */

import { UserSettings } from '../types';

/**
 * Format phone number to a standard format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as +1-XXX-XXX-XXXX if it's a US number
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Format as XXX-XXX-XXXX if it's a 10-digit number
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if it doesn't match standard formats
  return phone;
}

/**
 * Format user settings for display
 */
export function formatSettingsForDisplay(settings: UserSettings): {
  profile: string;
  notifications: string;
  security: string;
  appearance: string;
} {
  return {
    profile: settings.profile.name || settings.profile.email || 'No profile information',
    notifications: `Email: ${settings.notifications.emailNotifications ? 'On' : 'Off'}, Push: ${settings.notifications.pushNotifications ? 'On' : 'Off'}`,
    security: `2FA: ${settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}, Session: ${settings.security.sessionTimeout}min`,
    appearance: `Theme: ${settings.appearance.theme}, Language: ${settings.appearance.language}`,
  };
}

/**
 * Get settings summary
 */
export function getSettingsSummary(settings: UserSettings): string {
  const parts: string[] = [];
  
  if (settings.profile.name) {
    parts.push(settings.profile.name);
  }
  
  if (settings.profile.email) {
    parts.push(settings.profile.email);
  }
  
  if (parts.length === 0) {
    return 'User Settings';
  }
  
  return parts.join(' - ');
}

