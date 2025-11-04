// Code Badge Component
// Minimal badge for displaying code values

import React from 'react';
import { cn } from '../../../shared/utils';

export interface CodeBadgeProps {
  code: string | number;
  className?: string;
}

export const CodeBadge: React.FC<CodeBadgeProps> = ({
  code,
  className,
}) => {
  if (!code && code !== 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[0.625rem] font-mono font-medium',
        'bg-cyan-50 text-cyan-700 border border-cyan-200',
        'select-none',
        className
      )}
    >
      {String(code)}
    </span>
  );
};

CodeBadge.displayName = 'CodeBadge';

