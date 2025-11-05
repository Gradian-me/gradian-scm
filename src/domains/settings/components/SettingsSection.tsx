/**
 * Settings Section Component
 * Wrapper component for settings sections
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  icon,
  children,
  className = '',
}: SettingsSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {icon && <div className="text-gray-600">{icon}</div>}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

