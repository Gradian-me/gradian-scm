'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconInput } from '@/components/ui/icon-input';
import { Switch } from '@/components/ui/switch';
import { FormSchema } from '@/shared/types/form-schema';

interface GeneralInfoTabProps {
  schema: FormSchema;
  onUpdate: (updates: Partial<FormSchema>) => void;
  readonly?: boolean;
}

export function GeneralInfoTab({ schema, onUpdate, readonly = false }: GeneralInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schema Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="schema-id">Schema ID</Label>
          <Input id="schema-id" value={schema.id} disabled className="bg-gray-50" />
        </div>
        <div>
          <Label htmlFor="schema-description">Description</Label>
          <Textarea 
            id="schema-description" 
            value={schema.description || ''} 
            onChange={(e) => onUpdate({ description: e.target.value })} 
            rows={3}
            disabled={readonly}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="singular-name">Singular Name</Label>
            <Input 
              id="singular-name" 
              value={schema.singular_name || ''} 
              onChange={(e) => onUpdate({ singular_name: e.target.value })}
              disabled={readonly}
            />
          </div>
          <div>
            <Label htmlFor="plural-name">Plural Name</Label>
            <Input 
              id="plural-name" 
              value={schema.plural_name || ''} 
              onChange={(e) => onUpdate({ plural_name: e.target.value })}
              disabled={readonly}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="schema-icon">Icon</Label>
          <IconInput 
            id="schema-icon" 
            value={schema.icon || ''} 
            onChange={(e) => onUpdate({ icon: e.target.value })}
            disabled={readonly}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            id="show-in-navigation"
            checked={schema.showInNavigation || false}
            onCheckedChange={(checked) => onUpdate({ showInNavigation: checked })}
            disabled={readonly}
          />
          <Label htmlFor="show-in-navigation" className="cursor-pointer">
            Show in Navigation
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

