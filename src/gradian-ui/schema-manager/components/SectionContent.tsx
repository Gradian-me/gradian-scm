'use client';

import { Label } from '@/components/ui/label';
import { IconInput } from '@/components/ui/icon-input';
import { TextInput, Select, Switch } from '@/gradian-ui/form-builder/form-elements';
import { FormSection } from '../types/form-schema';

interface SectionContentProps {
  section: FormSection;
  onUpdate: (updates: Partial<FormSection>) => void;
}

export function SectionContent({
  section,
  onUpdate
}: SectionContentProps) {
  // This component is just for section configuration, not for rendering fields
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-gray-600">Icon</Label>
          <IconInput 
            value={section.icon || ''} 
            onChange={(e) => onUpdate({ icon: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Columns</Label>
          <TextInput
            config={{ name: 'section-columns', label: '', type: 'number' }}
            value={section.columns || 2}
            onChange={(value) => onUpdate({ columns: parseInt(String(value)) || 2 })}
            className="h-8 [&_input]:h-8 [&_input]:text-sm [&_label]:hidden"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Initial State</Label>
          <Select
            value={section.initialState || 'expanded'}
            onValueChange={(value) => onUpdate({ initialState: value as 'expanded' | 'collapsed' })}
            size="sm"
            options={[
              { value: 'expanded', label: 'Expanded' },
              { value: 'collapsed', label: 'Collapsed' },
            ]}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Switch
            config={{ name: `repeating-${section.id}`, label: 'Repeating Section' }}
            value={section.isRepeatingSection || false}
            onChange={(checked: boolean) => onUpdate({ isRepeatingSection: checked })}
            className="[&_label]:hidden"
          />
        </div>
      </div>
    </div>
  );
}

