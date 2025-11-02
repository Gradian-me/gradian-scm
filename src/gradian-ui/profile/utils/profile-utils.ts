// Profile Utilities

import { UserProfile, ProfileField, ProfileSection } from '../types';
import { formatDate, formatCurrency, formatNumber } from '../../shared/utils';

/**
 * Get user initials from full name
 */
export const getUserInitials = (user: UserProfile): string => {
  if (user.initials) return user.initials;
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  
  if (user.fullName) {
    const parts = user.fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return user.fullName.charAt(0).toUpperCase();
  }
  
  return user.email?.charAt(0).toUpperCase() || '?';
};

/**
 * Format profile field value based on type
 */
export const formatProfileFieldValue = (field: ProfileField): string => {
  const { value, type, format } = field;
  
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  
  // Handle different formats
  switch (format) {
    case 'currency':
      return formatCurrency(typeof value === 'number' ? value : parseFloat(value) || 0);
    case 'percentage':
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return `${numValue.toFixed(2)}%`;
    case 'date':
      try {
        const dateValue = typeof value === 'string' ? new Date(value) : value;
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          return formatDate(dateValue, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
        }
        return String(value);
      } catch {
        return String(value);
      }
    case 'phone':
      // Basic phone formatting
      return String(value).replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    case 'email':
      return String(value);
    default:
      return String(value);
  }
};

/**
 * Convert UserProfile to ProfileSections
 */
export const userProfileToSections = (user: UserProfile): ProfileSection[] => {
  const sections: ProfileSection[] = [];
  
  // Basic Information Section
  const basicFields: ProfileField[] = [
    {
      id: 'full-name',
      name: 'fullName',
      label: 'Full Name',
      value: user.fullName,
      type: 'text' as const,
      format: 'default'
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      value: user.email,
      type: 'email' as const,
      format: 'email'
    },
    {
      id: 'phone',
      name: 'phone',
      label: 'Phone',
      value: user.phone,
      type: 'tel' as const,
      format: 'phone'
    }
  ].filter(field => field.value) as ProfileField[]; // Only include fields with values
  
  if (basicFields.length > 0) {
    sections.push({
      id: 'basic-info',
      title: 'Basic Information',
      icon: 'User',
      fields: basicFields,
      colSpan: 1,
      layout: { columns: 1, gap: 4 }
    });
  }
  
  // Professional Information Section
  if (user.jobTitle || user.department || user.role) {
    const professionalFields: ProfileField[] = [
      {
        id: 'job-title',
        name: 'jobTitle',
        label: 'Job Title',
        value: user.jobTitle,
        type: 'text' as const,
        format: 'default'
      },
      {
        id: 'department',
        name: 'department',
        label: 'Department',
        value: user.department,
        type: 'text' as const,
        format: 'default'
      },
      {
        id: 'role',
        name: 'role',
        label: 'Role',
        value: user.role,
        type: 'badge' as const,
        format: 'default'
      }
    ].filter(field => field.value) as ProfileField[];
    
    if (professionalFields.length > 0) {
      sections.push({
        id: 'professional-info',
        title: 'Professional',
        icon: 'Briefcase',
        fields: professionalFields,
        colSpan: 1,
        layout: { columns: 1, gap: 4 }
      });
    }
  }
  
  // Location Section
  if (user.location) {
    sections.push({
      id: 'location',
      title: 'Location',
      icon: 'MapPin',
      fields: [{
        id: 'location',
        name: 'location',
        label: 'Location',
        value: user.location,
        type: 'text' as const,
        format: 'default',
        icon: 'MapPin'
      }],
      colSpan: 1,
      layout: { columns: 1, gap: 4 }
    });
  }
  
  // Bio Section
  if (user.bio) {
    sections.push({
      id: 'bio',
      title: 'About',
      icon: 'UserCircle',
      fields: [{
        id: 'bio',
        name: 'bio',
        label: 'Bio',
        value: user.bio,
        type: 'text' as const,
        format: 'default'
      }],
      colSpan: 2,
      layout: { columns: 1, gap: 4 }
    });
  }
  
  // Activity Section
  const activityFields: ProfileField[] = [
    {
      id: 'joined-at',
      name: 'joinedAt',
      label: 'Joined',
      value: user.joinedAt,
      type: 'date' as const,
      format: 'date'
    },
    {
      id: 'last-login',
      name: 'lastLogin',
      label: 'Last Login',
      value: user.lastLogin,
      type: 'date' as const,
      format: 'date'
    }
  ].filter(field => field.value) as ProfileField[];
  
  if (activityFields.length > 0) {
    sections.push({
      id: 'activity',
      title: 'Activity',
      icon: 'Activity',
      fields: activityFields,
      colSpan: 1,
      layout: { columns: 1, gap: 4 }
    });
  }
  
  return sections;
};

/**
 * Validate user profile data
 */
export const validateUserProfile = (user: UserProfile): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!user.id) errors.push('User ID is required');
  if (!user.firstName && !user.fullName) errors.push('First name or full name is required');
  if (!user.email) errors.push('Email is required');
  if (!user.role) errors.push('Role is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

