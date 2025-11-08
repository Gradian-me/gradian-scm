/**
 * Default Settings
 * Based on the settings page defaults
 */

import {
  ProfileSettings,
  NotificationSettings,
  SecuritySettings,
  AppearanceSettings,
  UserSettings,
} from '../types';

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  name: '',
  email: '',
  role: '',
  department: '',
  phone: '',
  isAdmin: false,
};

// Example profile settings (for reference, not used as defaults)
export const EXAMPLE_PROFILE_SETTINGS: ProfileSettings = {
  name: 'Mahyar Abidi',
  email: 'mahyar.abidi@gradian.com',
  role: 'Director of Data Analytics',
  department: 'Data Analytics',
  phone: '+1-555-0123',
  isAdmin: true,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  tenderUpdates: true,
  vendorUpdates: true,
  systemAlerts: true,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorAuth: false,
  sessionTimeout: 30, // 30 minutes
  passwordExpiry: 90, // 90 days
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'light',
  language: 'en',
  timezone: 'Asia/Tehran',
};

/**
 * Get default settings for a user
 */
export function getDefaultUserSettings(userId: string): UserSettings {
  return {
    userId,
    profile: { ...DEFAULT_PROFILE_SETTINGS },
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
    security: { ...DEFAULT_SECURITY_SETTINGS },
    appearance: { ...DEFAULT_APPEARANCE_SETTINGS },
    integrations: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Merge user settings with defaults (for missing fields)
 */
export function mergeWithDefaults(userSettings: Partial<UserSettings>): UserSettings {
  const userId = userSettings.userId || '';
  const defaults = getDefaultUserSettings(userId);

  return {
    ...defaults,
    ...userSettings,
    profile: {
      ...defaults.profile,
      ...userSettings.profile,
    },
    notifications: {
      ...defaults.notifications,
      ...userSettings.notifications,
    },
    security: {
      ...defaults.security,
      ...userSettings.security,
    },
    appearance: {
      ...defaults.appearance,
      ...userSettings.appearance,
    },
    integrations: {
      ...defaults.integrations,
      ...userSettings.integrations,
    },
    createdAt: userSettings.createdAt || defaults.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

