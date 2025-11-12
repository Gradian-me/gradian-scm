// Profile Selector Component

import React, { useState } from 'react';
import { ProfileSelectorProps } from '../types';
import { ProfileDropdown } from './ProfileDropdown';
import { ProfileList } from './ProfileList';
import { ProfileGrid } from './ProfileGrid';
import { ProfileTabs } from './ProfileTabs';
import { cn } from '../../../shared/utils';

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  config,
  profiles,
  currentProfile,
  onProfileSelect,
  onProfileCreate,
  onProfileEdit,
  onProfileDelete,
  onChangePassword,
  className,
  ...props
}) => {
  const {
    layout = { variant: 'dropdown' },
    styling = { variant: 'default' },
  } = config;

  const selectorClasses = cn(
    'profile-selector',
    styling.variant === 'minimal' && 'minimal',
    styling.variant === 'card' && 'card',
    styling.rounded && 'rounded-lg',
    className
  );

  const renderSelector = () => {
    switch (layout.variant) {
      case 'dropdown':
        return (
          <ProfileDropdown
            profiles={profiles}
            currentProfile={currentProfile}
            onProfileSelect={onProfileSelect}
            onProfileCreate={onProfileCreate}
            onProfileEdit={onProfileEdit}
            onProfileDelete={onProfileDelete}
            onChangePassword={onChangePassword}
            config={config}
          />
        );
      
      case 'list':
        return (
          <ProfileList
            profiles={profiles}
            currentProfile={currentProfile}
            onProfileSelect={onProfileSelect}
            onProfileCreate={onProfileCreate}
            onProfileEdit={onProfileEdit}
            onProfileDelete={onProfileDelete}
            config={config}
          />
        );
      
      case 'grid':
        return (
          <ProfileGrid
            profiles={profiles}
            currentProfile={currentProfile}
            onProfileSelect={onProfileSelect}
            onProfileCreate={onProfileCreate}
            onProfileEdit={onProfileEdit}
            onProfileDelete={onProfileDelete}
            config={config}
          />
        );
      
      case 'tabs':
        return (
          <ProfileTabs
            profiles={profiles}
            currentProfile={currentProfile}
            onProfileSelect={onProfileSelect}
            onProfileCreate={onProfileCreate}
            onProfileEdit={onProfileEdit}
            onProfileDelete={onProfileDelete}
            config={config}
          />
        );
      
      default:
        return (
          <ProfileDropdown
            profiles={profiles}
            currentProfile={currentProfile}
            onProfileSelect={onProfileSelect}
            onProfileCreate={onProfileCreate}
            onProfileEdit={onProfileEdit}
            onProfileDelete={onProfileDelete}
            onChangePassword={onChangePassword}
            config={config}
          />
        );
    }
  };

  return (
    <div className={selectorClasses} {...props}>
      {renderSelector()}
    </div>
  );
};

ProfileSelector.displayName = 'ProfileSelector';
