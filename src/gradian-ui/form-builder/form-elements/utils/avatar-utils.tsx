import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';

/**
 * Get initials from a name string
 */
export const getInitials = (name: string): string => {
  return (name || 'A').split(' ').map(n => n[0]).join('').toUpperCase();
};

interface GetAvatarContentProps {
  metadata: any;
  formSchema: any;
  data: any;
  getInitials: (name: string) => string;
}

/**
 * Get avatar content using role-based resolution
 */
export const getAvatarContent = ({
  metadata,
  formSchema,
  data,
  getInitials
}: GetAvatarContentProps): React.ReactNode | null => {
  if (!metadata.avatar || !formSchema) return null;

  // Find field with role='avatar' or 'title' for fallback
  let avatarField: any;
  let fallbackField: any;
  
  for (const section of formSchema.sections) {
    for (const field of section.fields || []) {
      if (field.role === 'avatar' && data[field.name]) {
        avatarField = data[field.name];
      }
      if (field.role === 'title' && data[field.name]) {
        fallbackField = data[field.name];
      }
    }
  }

  const initials = getInitials(avatarField || fallbackField || 'A');
  
  return (
    <Avatar className="h-12 w-12">
      {metadata.avatar.imagePath && avatarField ? (
        <img
          src={`${metadata.avatar.imagePath}/${avatarField.toLowerCase().replace(/\s+/g, '-')}.jpg`}
          alt={avatarField || 'Avatar'}
          className="h-12 w-12 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <AvatarFallback className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

