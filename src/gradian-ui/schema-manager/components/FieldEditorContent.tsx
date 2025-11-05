'use client';

import { useState, useEffect } from 'react';
// Button import for DialogFooter buttons
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, ButtonMinimal } from '@/gradian-ui/form-builder/form-elements';
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
      <Card className="w-full border border-gray-200 hover:shadow-sm transition-all duration-200">
        <div className="w-full flex items-center justify-between p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate text-gray-800">{field.label || 'Unnamed Field'}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{field.type}</Badge>
              {field.required && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>}
            </div>
            <span className="text-[10px] text-gray-400 truncate block mt-0.5">{field.name}</span>
          </div>
          <div className="flex gap-0.5 ml-2 shrink-0">
            <ButtonMinimal
              icon={Edit}
              title="Edit Field"
              color="violet"
              size="md"
              onClick={() => setShowDialog(true)}
            />
            <ButtonMinimal
              icon={Trash2}
              title="Delete Field"
              color="red"
              size="md"
              onClick={onDelete}
            />
          </div>
        </div>
      </Card>

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
              <div className="flex items-center gap-2">
                <Switch id={`canCopy-${field.id}`} checked={tempField.canCopy || false} onCheckedChange={(checked) => setTempField({ ...tempField, canCopy: checked })} />
                <Label htmlFor={`canCopy-${field.id}`}>Can Copy</Label>
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={tempField.role || ''}
                onValueChange={(value) => setTempField({ ...tempField, role: value ? (value as any) : undefined })}
                options={[
                  { value: '', label: 'None' },
                  ...ROLES
                ]}
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
                <Input type="number" value={tempField.order || 1} onChange={(e) => setTempField({ ...tempField, order: parseInt(e.target.value) || 1 })} />
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

