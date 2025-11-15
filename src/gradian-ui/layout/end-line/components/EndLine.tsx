'use client';

import React from 'react';
import { Hexagon } from 'lucide-react';
import { cn } from '@/gradian-ui/shared/utils';

export interface EndLineProps {
  label?: string;
  className?: string;
}

export const EndLine: React.FC<EndLineProps> = ({ label = 'End of results', className }) => {
  return (
    <div className={cn('flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 py-4', className)}>
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
        <Hexagon className="h-4 w-4 text-violet-500" />
        <span className="font-medium uppercase tracking-wide">{label}</span>
      </span>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent dark:via-gray-700" />
    </div>
  );
};

EndLine.displayName = 'EndLine';

