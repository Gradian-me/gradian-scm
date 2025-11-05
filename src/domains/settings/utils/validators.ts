/**
 * Settings Validators
 * Validation utilities for settings data
 */

import { UserSettings, ProfileSettings, NotificationSettings, SecuritySettings, AppearanceSettings } from '../types';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Allow various formats: +1-555-0123, (555) 012-3456, 555-0123, etc.
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate profile settings
 */
export function validateProfileSettings(profile: Partial<ProfileSettings>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (profile.email && !isValidEmail(profile.email)) {
    errors.push('Invalid email format');
  }

  if (profile.phone && !isValidPhone(profile.phone)) {
    errors.push('Invalid phone number format');
  }

  if (profile.name && profile.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate security settings
 */
export function validateSecuritySettings(security: Partial<SecuritySettings>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (security.sessionTimeout !== undefined) {
    if (security.sessionTimeout < 5 || security.sessionTimeout > 1440) {
      errors.push('Session timeout must be between 5 and 1440 minutes (24 hours)');
    }
  }

  if (security.passwordExpiry !== undefined) {
    if (security.passwordExpiry < 1 || security.passwordExpiry > 365) {
      errors.push('Password expiry must be between 1 and 365 days');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate appearance settings
 */
export function validateAppearanceSettings(appearance: Partial<AppearanceSettings>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const validThemes = ['light', 'dark', 'auto'];
  if (appearance.theme && !validThemes.includes(appearance.theme)) {
    errors.push(`Theme must be one of: ${validThemes.join(', ')}`);
  }

  const validLanguages = ['en', 'es', 'fr', 'de'];
  if (appearance.language && !validLanguages.includes(appearance.language)) {
    errors.push(`Language must be one of: ${validLanguages.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all settings
 */
export function validateSettings(settings: Partial<UserSettings>): { isValid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  if (settings.profile) {
    const profileValidation = validateProfileSettings(settings.profile);
    if (!profileValidation.isValid) {
      errors.profile = profileValidation.errors;
    }
  }

  if (settings.security) {
    const securityValidation = validateSecuritySettings(settings.security);
    if (!securityValidation.isValid) {
      errors.security = securityValidation.errors;
    }
  }

  if (settings.appearance) {
    const appearanceValidation = validateAppearanceSettings(settings.appearance);
    if (!appearanceValidation.isValid) {
      errors.appearance = appearanceValidation.errors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

