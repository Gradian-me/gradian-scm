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
import { useMemo, useState, useEffect } from 'react';
import { FormSchema } from '../types/form-schema';

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
  currentSchemaId,
}: SectionEditorProps) {
  const [relationTypes, setRelationTypes] = useState<Array<{ id: string; label: string }>>([]);
  const [availableSchemas, setAvailableSchemas] = useState<Array<{ id: string; name: string }>>([]);
  
  const sortedFields = useMemo(() => {
    return fields.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [fields]);

  const isRelationBased = section.isRepeatingSection && 
    section.repeatingConfig?.targetSchema && 
    section.repeatingConfig?.relationTypeId;

  // Fetch relation types
  useEffect(() => {
    const fetchRelationTypes = async () => {
      try {
        const response = await fetch('/api/relation-types');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setRelationTypes(result.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching relation types:', error);
      }
    };

    // Fetch available schemas
    const fetchSchemas = async () => {
      try {
        const response = await fetch('/api/schemas');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Filter out current schema from available schemas
            const schemas = result.data
              .filter((s: FormSchema) => s.id !== currentSchemaId)
              .map((s: FormSchema) => ({ id: s.id, name: s.plural_name || s.singular_name }));
            setAvailableSchemas(schemas);
          }
        }
      } catch (error) {
        console.error('Error fetching schemas:', error);
      }
    };

    if (section.isRepeatingSection) {
      fetchRelationTypes();
      fetchSchemas();
    }
  }, [section.isRepeatingSection, currentSchemaId]);

  const updateRepeatingConfig = (updates: Partial<typeof section.repeatingConfig>) => {
    onUpdate({
      repeatingConfig: {
        ...section.repeatingConfig,
        ...updates,
      },
    });
  };

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
              onChange={(e) => {
                const isRepeating = e.target.checked;
                onUpdate({ 
                  isRepeatingSection: isRepeating,
                  // Initialize repeatingConfig if enabling
                  repeatingConfig: isRepeating && !section.repeatingConfig 
                    ? { minItems: 0, maxItems: undefined }
                    : section.repeatingConfig,
                });
              }}
              className="w-4 h-4"
            />
            <Label htmlFor={`repeating-${section.id}`} className="cursor-pointer">
              Repeating Section
            </Label>
          </div>
        </div>

        {/* Repeating Section Configuration */}
        {section.isRepeatingSection && (
          <div className="pt-4 border-t space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700">Repeating Section Configuration</h4>
            
            {/* Relation-based configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Schema</Label>
                <select
                  value={section.repeatingConfig?.targetSchema || ''}
                  onChange={(e) => updateRepeatingConfig({ targetSchema: e.target.value || undefined })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                >
                  <option value="">Select target schema...</option>
                  {availableSchemas.map((schema) => (
                    <option key={schema.id} value={schema.id}>
                      {schema.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Relation Type</Label>
                <select
                  value={section.repeatingConfig?.relationTypeId || ''}
                  onChange={(e) => updateRepeatingConfig({ relationTypeId: e.target.value || undefined })}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                >
                  <option value="">Select relation type...</option>
                  {relationTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Common repeating config fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Items</Label>
                <Input
                  type="number"
                  value={section.repeatingConfig?.minItems ?? ''}
                  onChange={(e) => updateRepeatingConfig({ 
                    minItems: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
              <div>
                <Label>Max Items</Label>
                <Input
                  type="number"
                  value={section.repeatingConfig?.maxItems ?? ''}
                  onChange={(e) => updateRepeatingConfig({ 
                    maxItems: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Add Button Text</Label>
                <Input
                  value={section.repeatingConfig?.addButtonText || ''}
                  onChange={(e) => updateRepeatingConfig({ addButtonText: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label>Remove Button Text</Label>
                <Input
                  value={section.repeatingConfig?.removeButtonText || ''}
                  onChange={(e) => updateRepeatingConfig({ removeButtonText: e.target.value || undefined })}
                />
              </div>
            </div>
            <div>
                <Label>Empty Message</Label>
                <Input
                  value={section.repeatingConfig?.emptyMessage || ''}
                  onChange={(e) => updateRepeatingConfig({ emptyMessage: e.target.value || undefined })}
                />
              </div>
              
              {isRelationBased && (
                <>
                  <div>
                    <Label>Delete Type</Label>
                    <select
                      value={section.repeatingConfig?.deleteType || 'itemAndRelation'}
                      onChange={(e) => updateRepeatingConfig({ 
                        deleteType: e.target.value as 'relationOnly' | 'itemAndRelation' 
                      })}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                    >
                      <option value="relationOnly">Delete relation only (keep item)</option>
                      <option value="itemAndRelation">Delete item and relation</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {section.repeatingConfig?.deleteType === 'relationOnly' 
                        ? 'Only the relation will be deleted. The item will remain in the target schema.'
                        : 'Both the relation and the item will be permanently deleted.'}
                    </p>
                  </div>
                  <div>
                    <Label>Add Type</Label>
                    <select
                      value={section.repeatingConfig?.addType || 'addOnly'}
                      onChange={(e) => updateRepeatingConfig({ 
                        addType: e.target.value as 'addOnly' | 'canSelectFromData' | 'mustSelectFromData' 
                      })}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400"
                    >
                      <option value="addOnly">Add only (create new items)</option>
                      <option value="canSelectFromData">Can select from existing data</option>
                      <option value="mustSelectFromData">Must select from existing data</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {section.repeatingConfig?.addType === 'addOnly' 
                        ? 'Users can only create new items. No selection from existing data.'
                        : section.repeatingConfig?.addType === 'canSelectFromData'
                        ? 'Users can create new items or select from existing data. Both "Add" and "Select" buttons will be shown.'
                        : 'Users can only select from existing data. Only "Select" button will be shown.'}
                    </p>
                  </div>
                  {(section.repeatingConfig?.addType === 'canSelectFromData' || section.repeatingConfig?.addType === 'mustSelectFromData') && (
                    <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isUnique"
                          checked={section.repeatingConfig?.isUnique || false}
                          onChange={(e) => updateRepeatingConfig({ isUnique: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <Label htmlFor="isUnique" className="font-normal cursor-pointer">
                          Unique Selection
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        If enabled, each item can only be selected once. Already selected items will be excluded from the picker.
                      </p>
                    </>
                  )}
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Relation-based section:</strong> Fields are managed in the target schema "{section.repeatingConfig?.targetSchema}". 
                      Relations will be stored in all-data-relations.json.
                    </p>
                  </div>
                </>
              )}
          </div>
        )}

        {/* Fields Section - Only show for non-relation-based repeating sections or regular sections */}
        {(!section.isRepeatingSection || !isRelationBased) && (
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
        )}
      </CardContent>
    </Card>
  );
}

