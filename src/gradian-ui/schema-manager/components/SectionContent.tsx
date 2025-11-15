'use client';

import { TextInput, Select, Switch, IconInput } from '@/gradian-ui/form-builder/form-elements';
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
        <IconInput
          config={{ name: `section-icon-${section.id}`, label: 'Icon' }}
          value={section.icon || ''}
          onChange={(value) => onUpdate({ icon: value })}
        />
        <TextInput
          config={{ name: 'section-columns', label: 'Columns', type: 'number' }}
          value={section.columns || 2}
          onChange={(value) => onUpdate({ columns: parseInt(String(value), 10) || 2 })}
        />
        <Select
          config={{ name: 'section-initial-state', label: 'Initial State' }}
          value={section.initialState || 'expanded'}
          onValueChange={(value) => onUpdate({ initialState: value as 'expanded' | 'collapsed' })}
          size="sm"
          options={[
            { value: 'expanded', label: 'Expanded' },
            { value: 'collapsed', label: 'Collapsed' },
          ]}
        />
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

