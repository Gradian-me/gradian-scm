'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/gradian-ui/form-builder/form-elements/components/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Trash2 } from 'lucide-react';
import { FormField, FormSection } from '../types/form-schema';
import { FIELD_TYPES, ROLES } from '../constants';

interface FieldEditorContentProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  sections: FormSection[];
}

export function FieldEditorContent({ field, onUpdate, onDelete, sections }: FieldEditorContentProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [tempField, setTempField] = useState(field);

  useEffect(() => {
    setTempField(field);
  }, [field]);

  const handleSave = () => {
    onUpdate(tempField);
    setShowDialog(false);
  };

  return (
    <>
      <div className="group w-full flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium truncate">{field.label || 'Unnamed Field'}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{field.type}</Badge>
            {field.required && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>}
          </div>
          <span className="text-[10px] text-gray-400 truncate block">{field.name}</span>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowDialog(true)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Field Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>
              Configure field properties and behavior
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Field Label</Label>
                <Input value={tempField.label} onChange={(e) => setTempField({ ...tempField, label: e.target.value })} />
              </div>
              <div>
                <Label>Field Name</Label>
                <Input value={tempField.name} onChange={(e) => setTempField({ ...tempField, name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Field Type</Label>
                <Select
                  value={tempField.type}
                  onValueChange={(value) => setTempField({ ...tempField, type: value as any, component: value as any })}
                  options={[...FIELD_TYPES]}
                />
              </div>
              <div>
                <Label>Component</Label>
                <Select
                  value={tempField.component}
                  onValueChange={(value) => setTempField({ ...tempField, component: value as any })}
                  options={[...FIELD_TYPES]}
                />
              </div>
            </div>
            <div>
              <Label>Section</Label>
              <Select
                value={tempField.sectionId}
                onValueChange={(value) => setTempField({ ...tempField, sectionId: value })}
                options={sections.map(s => ({ value: s.id, label: s.title }))}
              />
            </div>
            <div>
              <Label>Placeholder</Label>
              <Input value={tempField.placeholder || ''} onChange={(e) => setTempField({ ...tempField, placeholder: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Switch id={`required-${field.id}`} checked={tempField.required || false} onCheckedChange={(checked) => setTempField({ ...tempField, required: checked })} />
                <Label htmlFor={`required-${field.id}`}>Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id={`disabled-${field.id}`} checked={tempField.disabled || false} onCheckedChange={(checked) => setTempField({ ...tempField, disabled: checked })} />
                <Label htmlFor={`disabled-${field.id}`}>Disabled</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id={`readonly-${field.id}`} checked={tempField.readonly || false} onCheckedChange={(checked) => setTempField({ ...tempField, readonly: checked })} />
                <Label htmlFor={`readonly-${field.id}`}>Readonly</Label>
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={tempField.role || ''}
                onValueChange={(value) => setTempField({ ...tempField, role: value as any })}
                options={[...ROLES]}
                placeholder="Select role..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Column Span</Label>
                <Input type="number" value={tempField.colSpan || 1} onChange={(e) => setTempField({ ...tempField, colSpan: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Order</Label>
                <Input type="number" value={tempField.order || 0} onChange={(e) => setTempField({ ...tempField, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto text-sm md:text-base">
              Cancel
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto text-sm md:text-base">
              <span className="hidden md:inline">Save Changes</span>
              <span className="md:hidden">Save</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

