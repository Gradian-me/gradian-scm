// User Profile Hook

import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getUserInitials } from '../utils';
import { config } from '@/lib/config';

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isValid: boolean;
  validationErrors: string[];
  refetch: () => void;
}

/**
 * Convert API user data to UserProfile format
 */
function convertUserToProfile(user: any): UserProfile {
  const firstName = user.name || '';
  const lastName = user.lastname || '';
  const fullName = lastName 
    ? `${firstName} ${lastName}`.trim()
    : firstName;

  return {
    id: user.id,
    firstName,
    lastName,
    fullName,
    email: user.email || '',
    phone: user.phone || undefined,
    avatar: user.avatar || user.avatarUrl || undefined,
    initials: getUserInitials({ 
      firstName, 
      lastName, 
      fullName,
      email: user.email || ''
    } as UserProfile),
    role: user.role || 'user',
    department: user.department || undefined,
    jobTitle: user.jobTitle || undefined,
    location: user.location || undefined,
    bio: user.bio || undefined,
    joinedAt: user.createdAt ? new Date(user.createdAt) : undefined,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
    metadata: user.metadata || {}
  };
}

export const useUserProfile = (userId: string): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fetchProfile = async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch user data from API (uses config to determine correct URL based on demo mode)
      const apiUrl = `${config.dataApi.basePath}/users/${userId}`;
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch user profile');
      }

      // Convert API user data to UserProfile format
      const userProfile = convertUserToProfile(result.data);
      
      setProfile(userProfile);
      setIsValid(true);
      setValidationErrors([]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user profile';
      setError(errorMessage);
      setIsValid(false);
      setValidationErrors([errorMessage]);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    isValid,
    validationErrors,
    refetch: fetchProfile
  };
};

