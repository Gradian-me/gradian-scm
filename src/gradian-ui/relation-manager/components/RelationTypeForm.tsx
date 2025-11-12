'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconInput } from '@/components/ui/icon-input';
import { ColorPicker } from '@/gradian-ui/form-builder/form-elements';
import { RelationType } from '../types';
import { Palette, Type, Hash, Info } from 'lucide-react';

interface RelationTypeFormProps {
  relationType: RelationType;
  onChange: (updates: Partial<RelationType>) => void;
}

export function RelationTypeForm({ relationType, onChange }: RelationTypeFormProps) {
  const handleChange = (field: keyof RelationType, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="id" className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4" />
              ID
            </Label>
            <Input
              id="id"
              value={relationType.id}
              onChange={(e) => handleChange('id', e.target.value)}
              placeholder="e.g., HAS_INQUIRY_ITEM"
              required
            />
          </div>

          <div>
            <Label htmlFor="label" className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4" />
              Label
            </Label>
            <Input
              id="label"
              value={relationType.label}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="e.g., Has Inquiry Item"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              Description
            </Label>
            <Textarea
              id="description"
              value={relationType.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the relation type..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color" className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4" />
                Color
              </Label>
              <ColorPicker
                id="color"
                value={relationType.color}
                onChange={(value) => handleChange('color', value)}
              />
            </div>

            <div>
              <Label htmlFor="icon" className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4" />
                Icon
              </Label>
              <IconInput
                id="icon"
                value={relationType.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

