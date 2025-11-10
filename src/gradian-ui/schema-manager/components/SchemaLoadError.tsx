'use client';

import { AlertTriangle } from 'lucide-react';

interface SchemaLoadErrorProps {
  title?: string;
  description?: string;
  helperText?: string;
}

export function SchemaLoadError({
  title = 'Schema Not Found',
  description = "The schema you're looking for doesn't exist or hasn't been configured yet.",
  helperText = 'Need this page? Contact your system administrator to configure the schema for this entity.',
}: SchemaLoadErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="max-w-xl space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <p className="text-sm text-gray-500">{helperText}</p>
      </div>
    </div>
  );
}
