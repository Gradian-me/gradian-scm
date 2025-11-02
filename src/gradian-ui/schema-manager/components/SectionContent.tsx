'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { IconInput } from '@/components/ui/icon-input';
import { Select } from '@/gradian-ui/form-builder/form-elements/components/Select';
import { Plus } from 'lucide-react';
import { FormSection, FormField } from '@/shared/types/form-schema';

interface SectionContentProps {
  section: FormSection;
  fields: FormField[];
  sections: FormSection[];
  onUpdate: (updates: Partial<FormSection>) => void;
  onAddField: () => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldDelete: (fieldId: string) => void;
}

export function SectionContent({
  section,
  fields,
  sections,
  onUpdate,
  onAddField,
  onFieldUpdate,
  onFieldDelete
}: SectionContentProps) {
  // This component is just for section configuration, not for rendering fields
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-3 gap-3">
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
      
      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-semibold text-gray-600">Fields ({fields.length})</h4>
        </div>
        
        <Button
          variant="outline"
          onClick={onAddField}
          className="w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200 text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Field
        </Button>
      </div>
    </div>
  );
}

