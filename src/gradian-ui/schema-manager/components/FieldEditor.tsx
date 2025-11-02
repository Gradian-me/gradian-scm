'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Trash2, Edit, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { FieldEditorProps } from '../types/builder';
import { FIELD_TYPES, ROLES } from '../utils/builder-utils';

export function FieldEditor({
  field,
  onUpdate,
  onDelete,
  sections,
  canMoveUp = false,
  canMoveDown = false,
  onMoveUp,
  onMoveDown,
}: FieldEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-l-4 border-l-violet-500 hover:border-violet-600 transition-colors">
      <CardHeader className="py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1">
              {canMoveUp && (
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={onMoveUp}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
              )}
              <GripVertical className="h-4 w-4 text-gray-400" />
              {canMoveDown && (
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={onMoveDown}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  className="border-none p-0 h-auto font-semibold focus-visible:ring-0"
                  placeholder="Field label..."
                />
                <Badge variant="outline">{field.type}</Badge>
                {field.required && <Badge variant="destructive">Required</Badge>}
              </div>
              <Input
                value={field.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="text-sm text-gray-600 border-none p-0 h-auto focus-visible:ring-0"
                placeholder="field_name"
              />
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Field Type</Label>
                  <select
                    value={field.type}
                    onChange={(e) => onUpdate({ type: e.target.value as any, component: e.target.value as any })}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Component</Label>
                  <select
                    value={field.component}
                    onChange={(e) => onUpdate({ component: e.target.value as any })}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Section</Label>
                <select
                  value={field.sectionId}
                  onChange={(e) => onUpdate({ sectionId: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${field.id}`}
                    checked={field.required || false}
                    onChange={(e) => onUpdate({ required: e.target.checked })}
                  />
                  <Label htmlFor={`required-${field.id}`}>Required</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`disabled-${field.id}`}
                    checked={field.disabled || false}
                    onChange={(e) => onUpdate({ disabled: e.target.checked })}
                  />
                  <Label htmlFor={`disabled-${field.id}`}>Disabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`readonly-${field.id}`}
                    checked={field.readonly || false}
                    onChange={(e) => onUpdate({ readonly: e.target.checked })}
                  />
                  <Label htmlFor={`readonly-${field.id}`}>Readonly</Label>
                </div>
              </div>
              <div>
                <Label>Role</Label>
                <select
                  value={field.role || ''}
                  onChange={(e) => onUpdate({ role: e.target.value as any })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                >
                  <option value="">None</option>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Column Span</Label>
                  <Input
                    type="number"
                    value={field.colSpan || 1}
                    onChange={(e) => onUpdate({ colSpan: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={field.order || 0}
                    onChange={(e) => onUpdate({ order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

