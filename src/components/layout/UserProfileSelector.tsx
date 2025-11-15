'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/stores/user.store';
import { ProfileSelector } from '@/gradian-ui/layout/profile-selector/components/ProfileSelector';
import { ProfileSelectorConfig } from '@/gradian-ui/layout/profile-selector/types';
import { UserProfile } from '@/gradian-ui/shared/types';
import { useRouter } from 'next/navigation';

interface UserProfileSelectorProps {
  config?: Partial<ProfileSelectorConfig>;
  onProfileSelect?: (profile: UserProfile) => void;
  className?: string;
  theme?: 'light' | 'dark';
}

/**
 * UserProfileSelector - Wrapper component that binds ProfileSelector to the logged-in user
 * Automatically converts the user from the store to UserProfile format
 */
export function UserProfileSelector({
  config: customConfig,
  onProfileSelect,
  className,
  theme,
}: UserProfileSelectorProps) {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const [hasAccessToken, setHasAccessToken] = useState<boolean>(true);
  const derivedTheme = theme ?? customConfig?.styling?.theme ?? 'light';

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    setHasAccessToken(Boolean(token));
  }, []);

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
  const baseConfig: ProfileSelectorConfig = {
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
      theme: derivedTheme,
      rounded: true,
    },
    behavior: {
      searchable: false,
      filterable: false,
      sortable: false,
      multiSelect: false,
    },
  };

  const mergedConfig: ProfileSelectorConfig = {
    ...baseConfig,
    ...customConfig,
    layout: {
      ...baseConfig.layout,
      ...(customConfig?.layout ?? {}),
    },
    styling: {
      ...baseConfig.styling,
      ...(customConfig?.styling ?? {}),
      theme: customConfig?.styling?.theme ?? derivedTheme,
    },
    behavior: {
      ...baseConfig.behavior,
      ...(customConfig?.behavior ?? {}),
    },
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

  // Handle change password
  const handleChangePassword = () => {
    router.push('/authentication/change-password');
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
  if (!hasAccessToken || !user || !userProfile) {
    return (
      <button
        type="button"
        onClick={() => router.push('/authentication/login')}
        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        Login
      </button>
    );
  }

  return (
    <ProfileSelector
      config={mergedConfig}
      profiles={profiles}
      currentProfile={userProfile}
      onProfileSelect={handleProfileSelect}
      onProfileEdit={handleProfileEdit}
      onProfileDelete={handleProfileDelete}
      onChangePassword={handleChangePassword}
      className={className}
    />
  );
}

