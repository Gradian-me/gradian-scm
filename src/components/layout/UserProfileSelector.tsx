'use client';

import { useEffect, useMemo } from 'react';
import { useUserStore } from '@/stores/user.store';
import { ProfileSelector } from '@/gradian-ui/layout/profile-selector/components/ProfileSelector';
import { ProfileSelectorConfig } from '@/gradian-ui/layout/profile-selector/types';
import { UserProfile } from '@/gradian-ui/shared/types';
import { useRouter } from 'next/navigation';

interface UserProfileSelectorProps {
  config?: Partial<ProfileSelectorConfig>;
  onProfileSelect?: (profile: UserProfile) => void;
  className?: string;
}

/**
 * UserProfileSelector - Wrapper component that binds ProfileSelector to the logged-in user
 * Automatically converts the user from the store to UserProfile format
 */
export function UserProfileSelector({
  config: customConfig,
  onProfileSelect,
  className,
}: UserProfileSelectorProps) {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  // Convert User to UserProfile format
  const userProfile: UserProfile | null = useMemo(() => {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name, // First name
      lastname: user.lastname || undefined, // Last name (separate field)
      email: user.email,
      avatar: user.avatar,
      role: user.role || 'user',
      permissions: [], // TODO: Add permissions if needed
    };
  }, [user]);

  // Default config
  const defaultConfig: ProfileSelectorConfig = {
    id: 'user-profile-selector',
    name: 'user-profile-selector',
    title: 'Profile',
    allowCreate: false,
    allowEdit: true,
    allowDelete: false,
    maxProfiles: 1,
    layout: {
      variant: 'dropdown',
      size: 'md',
      showAvatar: true,
      showName: true,
      showEmail: false, // Hide email in minimal design
      showRole: false, // Hide role in minimal design
      showStatus: false,
    },
    styling: {
      variant: 'default',
      theme: 'light',
      rounded: true,
    },
    behavior: {
      searchable: false,
      filterable: false,
      sortable: false,
      multiSelect: false,
    },
    ...customConfig,
  };

  // Profiles array (just the logged-in user for now)
  const profiles: UserProfile[] = useMemo(() => {
    if (!userProfile) return [];
    return [userProfile];
  }, [userProfile]);

  // Handle profile selection
  const handleProfileSelect = (profile: UserProfile) => {
    onProfileSelect?.(profile);
    // Navigate to profile page
    router.push(`/profiles/${profile.id}`);
  };

  // Handle profile edit (settings)
  const handleProfileEdit = (profile: UserProfile) => {
    router.push('/settings');
  };

  // Handle logout
  const handleProfileDelete = async (profile: UserProfile) => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear user from store
      const { clearUser } = useUserStore.getState();
      clearUser();

      // Clear tokens from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      // Redirect to login
      router.push('/authentication/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      const { clearUser } = useUserStore.getState();
      clearUser();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      router.push('/authentication/login');
    }
  };

  // Don't render if no user is logged in
  if (!user || !userProfile) {
    return null;
  }

  return (
    <ProfileSelector
      config={defaultConfig}
      profiles={profiles}
      currentProfile={userProfile}
      onProfileSelect={handleProfileSelect}
      onProfileEdit={handleProfileEdit}
      onProfileDelete={handleProfileDelete}
      className={className}
    />
  );
}

