'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { SectionEditorProps } from '../types/builder';
import { FieldEditor } from './FieldEditor';
import { useMemo } from 'react';

export function SectionEditor({
  section,
  fields,
  onUpdate,
  onDelete,
  onAddField,
  onFieldUpdate,
  onFieldDelete,
  onFieldMove,
  sections,
  config,
}: SectionEditorProps) {
  const sortedFields = useMemo(() => {
    return fields.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [fields]);

  return (
    <Card className="transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Input
              value={section.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="text-lg font-semibold"
              placeholder="Section title..."
            />
            <Textarea
              value={section.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Section description..."
              rows={2}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Columns</Label>
            <Input
              type="number"
              value={section.columns || 2}
              onChange={(e) => onUpdate({ columns: parseInt(e.target.value) || 2 })}
            />
          </div>
          <div>
            <Label>Initial State</Label>
            <select
              value={section.initialState || 'expanded'}
              onChange={(e) => onUpdate({ initialState: e.target.value as 'expanded' | 'collapsed' })}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
            >
              <option value="expanded">Expanded</option>
              <option value="collapsed">Collapsed</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`repeating-${section.id}`}
              checked={section.isRepeatingSection || false}
              onChange={(e) => onUpdate({ isRepeatingSection: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor={`repeating-${section.id}`} className="cursor-pointer">
              Repeating Section
            </Label>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-700">Fields ({fields.length})</h4>
            <Button variant="outline" size="sm" onClick={onAddField}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No fields yet. Click "Add Field" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedFields.map((field, fieldIndex) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onUpdate={(updates) => onFieldUpdate(field.id, updates)}
                  onDelete={() => onFieldDelete(field.id)}
                  sections={sections}
                  canMoveUp={fieldIndex > 0 && !!onFieldMove}
                  canMoveDown={fieldIndex < sortedFields.length - 1 && !!onFieldMove}
                  onMoveUp={onFieldMove ? () => onFieldMove(field.id, 'up') : undefined}
                  onMoveDown={onFieldMove ? () => onFieldMove(field.id, 'down') : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

