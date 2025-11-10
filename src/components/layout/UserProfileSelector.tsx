'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/stores/user.store';
import { ProfileSelector } from '@/gradian-ui/layout/profile-selector/components/ProfileSelector';
import { ProfileSelectorConfig } from '@/gradian-ui/layout/profile-selector/types';
import { UserProfile } from '@/gradian-ui/shared/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
  const [hasAccessToken, setHasAccessToken] = useState<boolean>(true);

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
    <div className="flex items-center gap-3">
      <ProfileSelector
        config={defaultConfig}
        profiles={profiles}
        currentProfile={userProfile}
        onProfileSelect={handleProfileSelect}
        onProfileEdit={handleProfileEdit}
        onProfileDelete={handleProfileDelete}
        className={className}
      />
      <Button variant="outline" size="sm" onClick={() => router.push('/authentication/change-password')}>
        Change Password
      </Button>
    </div>
  );
}

