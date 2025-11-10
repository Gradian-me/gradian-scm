// Profile Card Component

import React from 'react';
import { Avatar } from '../../form-builder/form-elements';
import { ProfileSection } from '../types';
import { formatProfileFieldValue } from '../utils';
import { IconRenderer } from '@/gradian-ui/shared/utils/icon-renderer';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../shared/utils';

export interface ProfileCardProps {
  section: ProfileSection;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ section, className }) => {
  const { title, description, icon, fields, layout } = section;
  
  const gridClasses = cn(
    "grid gap-4",
    layout?.columns === 1 && "grid-cols-1",
    layout?.columns === 2 && "grid-cols-1 md:grid-cols-2",
    layout?.columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    layout?.gap === 2 && "gap-2",
    layout?.gap === 3 && "gap-3",
    layout?.gap === 4 && "gap-4",
    layout?.gap === 6 && "gap-6"
  );

  return (
    <Card className={cn("h-auto bg-white border border-gray-200 shadow-sm", className)}>
      <CardHeader className="bg-gray-50/50 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          {icon && <IconRenderer iconName={icon} className="h-5 w-5 text-gray-600" />}
          <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1.5">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className={gridClasses}>
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                {field.icon && (
                  <IconRenderer iconName={field.icon} className="h-4 w-4" />
                )}
                {field.label}
              </label>
              <div className="text-sm text-gray-900">
                {formatProfileFieldValue(field)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

ProfileCard.displayName = 'ProfileCard';

