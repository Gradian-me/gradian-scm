/**
 * Settings Hook
 * React hook for managing user settings
 */

import { useState, useEffect, useCallback } from 'react';
import { UserSettings, SettingsUpdate } from '../types';
import { SettingsService } from '../services/settings.service';

interface UseSettingsOptions {
  userId?: string;
  autoLoad?: boolean;
}

interface UseSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: SettingsUpdate) => Promise<UserSettings>;
  resetSettings: () => Promise<UserSettings>;
  refreshSettings: () => Promise<void>;
}

export function useSettings(options: UseSettingsOptions = {}): UseSettingsReturn {
  const { userId, autoLoad = true } = options;
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userSettings = await SettingsService.getSettings(userId);
      setSettings(userSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoLoad) {
      loadSettings();
    }
  }, [autoLoad, loadSettings]);

  const updateSettings = useCallback(async (updates: SettingsUpdate): Promise<UserSettings> => {
    try {
      setError(null);
      const updatedSettings = await SettingsService.updateSettings(updates, userId);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('Error updating settings:', err);
      throw err;
    }
  }, [userId]);

  const resetSettings = useCallback(async (): Promise<UserSettings> => {
    try {
      setError(null);
      const defaultSettings = await SettingsService.resetSettings(userId);
      setSettings(defaultSettings);
      return defaultSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(errorMessage);
      console.error('Error resetting settings:', err);
      throw err;
    }
  }, [userId]);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    refreshSettings,
  };
}

