'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { IconInput } from '@/components/ui/icon-input';
import { Switch } from '@/components/ui/switch';
import { TextInput, Textarea } from '@/gradian-ui/form-builder/form-elements';
import { FormSchema } from '../types/form-schema';

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
          <TextInput
            config={{ name: 'schema-id', label: 'Schema ID' }}
            value={schema.id}
            onChange={() => {}}
            disabled
            className="[&_input]:bg-gray-50"
          />
        </div>
        <div>
          <Textarea
            config={{ name: 'schema-description', label: 'Description' }}
            value={schema.description || ''}
            onChange={(value) => onUpdate({ description: value })}
            rows={3}
            disabled={readonly}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TextInput
              config={{ name: 'singular-name', label: 'Singular Name' }}
              value={schema.singular_name || ''}
              onChange={(value) => onUpdate({ singular_name: value })}
              disabled={readonly}
            />
          </div>
          <div>
            <TextInput
              config={{ name: 'plural-name', label: 'Plural Name' }}
              value={schema.plural_name || ''}
              onChange={(value) => onUpdate({ plural_name: value })}
              disabled={readonly}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="schema-icon" className="text-gray-700">Icon</Label>
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
          <Label htmlFor="show-in-navigation" className="cursor-pointer text-gray-700">
            Show in Navigation
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            id="is-system-schema"
            checked={schema.isSystemSchema || false}
            onCheckedChange={(checked) => onUpdate({ isSystemSchema: checked })}
            disabled={readonly}
          />
          <Label htmlFor="is-system-schema" className="cursor-pointer text-gray-700">
            Is System Schema
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

