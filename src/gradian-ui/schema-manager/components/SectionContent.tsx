'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { IconInput } from '@/components/ui/icon-input';
import { Select } from '@/gradian-ui/form-builder/form-elements/components/Select';
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
          <Input 
            type="number" 
            value={section.columns || 2} 
            onChange={(e) => onUpdate({ columns: parseInt(e.target.value) || 2 })} 
            className="h-8 text-sm"
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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch 
            id={`repeating-${section.id}`} 
            checked={section.isRepeatingSection || false} 
            onCheckedChange={(checked) => onUpdate({ isRepeatingSection: checked })} 
          />
          <Label htmlFor={`repeating-${section.id}`} className="text-xs cursor-pointer">
            Repeating Section
          </Label>
        </div>
      </div>
    </div>
  );
}

