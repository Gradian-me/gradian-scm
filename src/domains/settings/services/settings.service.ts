/**
 * Settings Service
 * Handles CRUD operations for user settings
 */

import { UserSettings, SettingsUpdate, SettingsFilters } from '../types';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { mergeWithDefaults, getDefaultUserSettings } from '../utils/defaults';

/**
 * Get current user ID from store
 * Returns null if no user is logged in
 */
const getCurrentUserId = (): string | null => {
  // This will be called on the client side, so we need to handle SSR
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Import dynamically to avoid SSR issues
  try {
    const { useUserStore } = require('@/stores/user.store');
    return useUserStore.getState().getUserId();
  } catch (error) {
    console.warn('Failed to get user ID from store:', error);
    return null;
  }
};

/**
 * Get settings for a user
 * If settings don't exist, returns default settings
 */
export async function getSettings(userId?: string): Promise<UserSettings> {
  const targetUserId = userId || getCurrentUserId();
  
  if (!targetUserId) {
    throw new Error('userId is required. Please provide a userId or ensure a user is logged in.');
  }
  
  try {
    const response = await apiRequest<UserSettings>(
      `/api/settings`,
      {
        method: 'GET',
        // No params needed - userId comes from JWT token
      }
    );

    if (response.success && response.data) {
      // Merge with defaults to ensure all fields are present
      return mergeWithDefaults(response.data);
    }

    // If no settings found, return defaults
    return getDefaultUserSettings(targetUserId);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return defaults on error
    return getDefaultUserSettings(targetUserId);
  }
}

/**
 * Update settings for a user
 * Partial update - only updates provided fields
 */
export async function updateSettings(
  updates: SettingsUpdate,
  userId?: string
): Promise<UserSettings> {
  const targetUserId = userId || getCurrentUserId();

  if (!targetUserId) {
    throw new Error('userId is required. Please provide a userId or ensure a user is logged in.');
  }

  try {
    const response = await apiRequest<UserSettings>(
      `/api/settings`,
      {
        method: 'PUT',
        body: updates,
        // No params needed - userId comes from JWT token
      }
    );

    if (response.success && response.data) {
      return mergeWithDefaults(response.data);
    }

    throw new Error(response.error || 'Failed to update settings');
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

/**
 * Create or reset settings for a user
 * Creates new settings or resets to defaults
 */
export async function createSettings(
  settings: Partial<UserSettings>,
  userId?: string
): Promise<UserSettings> {
  const targetUserId = userId || getCurrentUserId();

  if (!targetUserId) {
    throw new Error('userId is required. Please provide a userId or ensure a user is logged in.');
  }

  try {
    const response = await apiRequest<UserSettings>(
      `/api/settings`,
      {
        method: 'POST',
        body: {
          userId: targetUserId,
          ...settings,
        },
        params: { userId: targetUserId },
      }
    );

    if (response.success && response.data) {
      return mergeWithDefaults(response.data);
    }

    throw new Error(response.error || 'Failed to create settings');
  } catch (error) {
    console.error('Error creating settings:', error);
    throw error;
  }
}

/**
 * Delete settings for a user
 * This will reset to defaults on next access
 */
export async function deleteSettings(userId?: string): Promise<void> {
  const targetUserId = userId || getCurrentUserId();

  if (!targetUserId) {
    throw new Error('userId is required. Please provide a userId or ensure a user is logged in.');
  }

  try {
    const response = await apiRequest<void>(
      `/api/settings`,
      {
        method: 'DELETE',
        params: { userId: targetUserId },
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete settings');
    }
  } catch (error) {
    console.error('Error deleting settings:', error);
    throw error;
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(userId?: string): Promise<UserSettings> {
  const targetUserId = userId || getCurrentUserId();
  
  if (!targetUserId) {
    throw new Error('userId is required. Please provide a userId or ensure a user is logged in.');
  }
  
  const defaults = getDefaultUserSettings(targetUserId);
  return createSettings(defaults, targetUserId);
}

export class SettingsService {
  static async getSettings(userId?: string): Promise<UserSettings> {
    return getSettings(userId);
  }

  static async updateSettings(
    updates: SettingsUpdate,
    userId?: string
  ): Promise<UserSettings> {
    return updateSettings(updates, userId);
  }

  static async createSettings(
    settings: Partial<UserSettings>,
    userId?: string
  ): Promise<UserSettings> {
    return createSettings(settings, userId);
  }

  static async deleteSettings(userId?: string): Promise<void> {
    return deleteSettings(userId);
  }

  static async resetSettings(userId?: string): Promise<UserSettings> {
    return resetSettings(userId);
  }
}

