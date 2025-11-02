// User Profile Hook

import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { validateUserProfile } from '../utils';

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isValid: boolean;
  validationErrors: string[];
  refetch: () => void;
}

export const useUserProfile = (userId: string): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch profile data
      // This is a mock implementation - replace with actual API call
      const mockProfile: UserProfile = {
        id: userId,
        firstName: 'Mahyar',
        lastName: 'Abidi',
        fullName: 'Mahyar Abidi',
        email: 'mahyar.abidi@example.com',
        phone: '+1 (555) 123-4567',
        avatar: '/avatars/mahyar.jpg',
        initials: 'MA',
        role: 'Administrator',
        department: 'Engineering',
        jobTitle: 'Software Engineer',
        location: 'San Francisco, CA',
        bio: 'Passionate software engineer with expertise in building modern web applications. Love working with React, Next.js, and TypeScript.',
        joinedAt: new Date('2024-01-15'),
        lastLogin: new Date(),
        metadata: {}
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProfile(mockProfile);
      
      // Validate profile
      const validation = validateUserProfile(mockProfile);
      setIsValid(validation.isValid);
      setValidationErrors(validation.errors);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      setIsValid(false);
      setValidationErrors(['Failed to load profile']);
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

