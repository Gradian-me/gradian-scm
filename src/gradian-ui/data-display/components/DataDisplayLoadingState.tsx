// Data Display Loading State Component

import React from 'react';
import { DataDisplayLoadingStateProps } from '../types';
import { cn } from '../../shared/utils';
import { Loader2 } from 'lucide-react';

export const DataDisplayLoadingState: React.FC<DataDisplayLoadingStateProps> = ({
  message = 'Loading...',
  skeleton = false,
  count = 6,
  className,
  ...props
}) => {
  const loadingClasses = cn(
    'data-display-loading-state',
    'flex flex-col items-center justify-center py-12 px-4 text-center',
    className
  );

  if (skeleton) {
    return (
      <div className={loadingClasses} {...props}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                <div className="h-3 bg-gray-300 rounded w-4/6"></div>
              </div>
              <div className="mt-4 flex space-x-2">
                <div className="h-8 bg-gray-300 rounded w-16"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={loadingClasses} {...props}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
};

DataDisplayLoadingState.displayName = 'DataDisplayLoadingState';
