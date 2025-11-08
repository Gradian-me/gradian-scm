// Profile Selector Types

import { BaseComponentProps, UserProfile } from '../../../shared/types';

export interface ProfileSelectorProps extends BaseComponentProps {
  config: ProfileSelectorConfig;
  profiles: UserProfile[];
  currentProfile?: UserProfile;
  onProfileSelect?: (profile: UserProfile) => void;
  onProfileCreate?: () => void;
  onProfileEdit?: (profile: UserProfile) => void;
  onProfileDelete?: (profile: UserProfile) => void;
}

export interface ProfileSelectorConfig {
  id: string;
  name: string;
  title?: string;
  description?: string;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  maxProfiles?: number;
  layout?: {
    variant?: 'dropdown' | 'list' | 'grid' | 'tabs';
    size?: 'sm' | 'md' | 'lg';
    showAvatar?: boolean;
    showName?: boolean;
    showEmail?: boolean;
    showRole?: boolean;
    showStatus?: boolean;
    fullWidth?: boolean;
    popoverPlacement?: 'auto' | 'top' | 'bottom';
  };
  styling?: {
    variant?: 'default' | 'minimal' | 'card';
    theme?: 'light' | 'dark';
    rounded?: boolean;
  };
  behavior?: {
    searchable?: boolean;
    filterable?: boolean;
    sortable?: boolean;
    multiSelect?: boolean;
  };
}

export interface ProfileItemProps extends BaseComponentProps {
  profile: UserProfile;
  isSelected?: boolean;
  isActive?: boolean;
  onSelect?: (profile: UserProfile) => void;
  onEdit?: (profile: UserProfile) => void;
  onDelete?: (profile: UserProfile) => void;
  showActions?: boolean;
  showStatus?: boolean;
}

export interface ProfileDropdownProps extends BaseComponentProps {
  profiles: UserProfile[];
  currentProfile?: UserProfile;
  onProfileSelect?: (profile: UserProfile) => void;
  onProfileCreate?: () => void;
  onProfileEdit?: (profile: UserProfile) => void;
  onProfileDelete?: (profile: UserProfile) => void;
  config: ProfileSelectorConfig;
}

export interface ProfileListProps extends BaseComponentProps {
  profiles: UserProfile[];
  currentProfile?: UserProfile;
  onProfileSelect?: (profile: UserProfile) => void;
  onProfileCreate?: () => void;
  onProfileEdit?: (profile: UserProfile) => void;
  onProfileDelete?: (profile: UserProfile) => void;
  config: ProfileSelectorConfig;
}

export interface ProfileGridProps extends BaseComponentProps {
  profiles: UserProfile[];
  currentProfile?: UserProfile;
  onProfileSelect?: (profile: UserProfile) => void;
  onProfileCreate?: () => void;
  onProfileEdit?: (profile: UserProfile) => void;
  onProfileDelete?: (profile: UserProfile) => void;
  config: ProfileSelectorConfig;
}

export interface ProfileTabsProps extends BaseComponentProps {
  profiles: UserProfile[];
  currentProfile?: UserProfile;
  onProfileSelect?: (profile: UserProfile) => void;
  onProfileCreate?: () => void;
  onProfileEdit?: (profile: UserProfile) => void;
  onProfileDelete?: (profile: UserProfile) => void;
  config: ProfileSelectorConfig;
}

export interface ProfileSearchProps extends BaseComponentProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export interface ProfileFilterProps extends BaseComponentProps {
  onFilter?: (filters: ProfileFilters) => void;
  filters?: ProfileFilters;
}

export interface ProfileFilters {
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
  search?: string;
}

export interface ProfileStatusProps extends BaseComponentProps {
  status: 'active' | 'inactive' | 'pending';
  size?: 'sm' | 'md' | 'lg';
}
