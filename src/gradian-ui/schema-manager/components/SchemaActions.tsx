'use client';

import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, RotateCcw, Loader2, LayoutList } from 'lucide-react';

interface SchemaActionsProps {
  onBack?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  onViewSchemaList?: () => void;
  saving?: boolean;
  backLabel?: string;
  saveLabel?: string;
  resetLabel?: string;
  viewSchemaListLabel?: string;
}

export function SchemaActions({ 
  onBack, 
  onSave, 
  onReset,
  onViewSchemaList,
  saving = false,
  backLabel = 'Back',
  saveLabel = 'Save Schema',
  resetLabel = 'Reset',
  viewSchemaListLabel = 'View List'
}: SchemaActionsProps) {
  return (
    <div className="flex items-center justify-between">
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
      )}
      <div className="flex gap-2 ml-auto">
        {onViewSchemaList && (
          <Button variant="outline" onClick={onViewSchemaList}>
            <LayoutList className="h-4 w-4 mr-2" />
            {viewSchemaListLabel}
          </Button>
        )}
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {resetLabel}
          </Button>
        )}
        {onSave && (
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

