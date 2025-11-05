/**
 * Settings Domain Types
 * Defines all settings types for user preferences
 */

export interface ProfileSettings {
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  isAdmin: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  tenderUpdates: boolean;
  vendorUpdates: boolean;
  systemAlerts: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // in minutes
  passwordExpiry: number; // in days
  currentPassword?: string; // Only used for password changes, not stored
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

export interface IntegrationSettings {
  // Placeholder for future integration settings
  [key: string]: any;
}

export interface UserSettings {
  userId: string;
  profile: ProfileSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
  integrations?: IntegrationSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingsUpdate {
  profile?: Partial<ProfileSettings>;
  notifications?: Partial<NotificationSettings>;
  security?: Partial<SecuritySettings>;
  appearance?: Partial<AppearanceSettings>;
  integrations?: Partial<IntegrationSettings>;
}

export interface SettingsFilters {
  userId?: string;
}

