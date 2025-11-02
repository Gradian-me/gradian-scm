'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { IconInput } from '@/components/ui/icon-input';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit,
  Settings,
  Layers,
  ChevronUp,
  Loader2,
  GripVertical,
  RotateCcw,
  ChevronsUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FormSchema, FormField, FormSection } from '@/shared/types/form-schema';
import { Select } from '@/gradian-ui/form-builder/form-elements/components/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSection } from './components/SortableSection';
import { SortableField } from './components/SortableField';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'date', label: 'Date' },
  { value: 'datetime-local', label: 'Date Time' },
  { value: 'tel', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'file', label: 'File' },
];

const ROLES = [
  { value: 'title', label: 'Title' },
  { value: 'subtitle', label: 'Subtitle' },
  { value: 'description', label: 'Description' },
  { value: 'image', label: 'Image' },
  { value: 'avatar', label: 'Avatar' },
  { value: 'icon', label: 'Icon' },
  { value: 'rating', label: 'Rating' },
  { value: 'badge', label: 'Badge' },
  { value: 'status', label: 'Status' },
  { value: 'email', label: 'Email' },
  { value: 'location', label: 'Location' },
  { value: 'tel', label: 'Phone' },
  { value: 'expiration', label: 'Expiration' },
];

export default function SchemaEditorPage({ params }: { params: Promise<{ 'schema-id': string }> }) {
  const router = useRouter();
  const [schemaId, setSchemaId] = useState<string>('');
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [originalSchema, setOriginalSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'field' | 'section'; id: string; onConfirm: () => void } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadParams();
  }, []);

  const loadParams = async () => {
    const resolvedParams = await params;
    setSchemaId(resolvedParams['schema-id']);
    fetchSchema(resolvedParams['schema-id']);
  };

  const fetchSchema = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schemas/${id}`);
      const result = await response.json();

      if (result.success) {
        setSchema(result.data);
        setOriginalSchema(JSON.parse(JSON.stringify(result.data))); // Deep clone
        setExpandedSection(null); // Start with all sections collapsed
      } else {
        console.error('Failed to fetch schema:', result.error);
        alert('Failed to load schema');
        router.push('/builder/schemas');
      }
    } catch (error) {
      console.error('Error fetching schema:', error);
      alert('Error loading schema');
      router.push('/builder/schemas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!schema) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/schemas/${schemaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schema),
      });

      const result = await response.json();
      if (result.success) {
        // Update original schema to reflect saved state
        setOriginalSchema(JSON.parse(JSON.stringify(schema)));
        alert('Schema saved successfully!');
      } else {
        alert('Failed to save schema');
      }
    } catch (error) {
      alert('Error saving schema');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!originalSchema) return;
    setSchema(JSON.parse(JSON.stringify(originalSchema)));
    setExpandedSection(null); // Reset to collapsed
    setShowResetDialog(false);
  };

  const updateSchema = (updates: Partial<FormSchema>) => {
    setSchema(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!schema) return;
    
    const currentField = schema.fields.find(f => f.id === fieldId);
    if (!currentField) return;

    let updatedFields: FormField[];
    
    // If sectionId is being changed, move to the end of the new section
    if (updates.sectionId && updates.sectionId !== currentField.sectionId) {
      const newSectionFields = schema.fields.filter(f => f.sectionId === updates.sectionId);
      const maxOrder = newSectionFields.length > 0 
        ? Math.max(...newSectionFields.map(f => f.order || 0))
        : 0;
      
      updatedFields = schema.fields.map(f => {
        if (f.id === fieldId) {
          return { ...f, ...updates, order: maxOrder + 1 };
        }
        return f;
      });
    } else {
      updatedFields = schema.fields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      );
    }
    
    setSchema({ ...schema, fields: updatedFields });
  };

  const deleteField = (fieldId: string) => {
    if (!schema) return;
    const field = schema.fields.find(f => f.id === fieldId);
    setDeleteConfirm({
      type: 'field',
      id: fieldId,
      onConfirm: () => {
        const updatedFields = schema.fields.filter(f => f.id !== fieldId);
        setSchema({ ...schema, fields: updatedFields });
        setDeleteConfirm(null);
      }
    });
  };

  const addField = (sectionId: string) => {
    if (!schema) return;
    const sectionFields = schema.fields.filter(f => f.sectionId === sectionId);
    const maxOrder = sectionFields.length > 0 
      ? Math.max(...sectionFields.map(f => f.order || 0))
      : 0;
    
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: 'new_field',
      label: 'New Field',
      sectionId,
      type: 'text',
      component: 'text',
      order: maxOrder + 1,
    };
    setSchema({ ...schema, fields: [...schema.fields, newField] });
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    if (!schema) return;
    const updatedSections = schema.sections.map(s =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    setSchema({ ...schema, sections: updatedSections });
  };

  const deleteSection = (sectionId: string) => {
    if (!schema) return;
    const section = schema.sections.find(s => s.id === sectionId);
    setDeleteConfirm({
      type: 'section',
      id: sectionId,
      onConfirm: () => {
        const updatedSections = schema.sections.filter(s => s.id !== sectionId);
        const updatedFields = schema.fields.filter(f => f.sectionId !== sectionId);
        setSchema({ ...schema, sections: updatedSections, fields: updatedFields });
        setDeleteConfirm(null);
      }
    });
  };

  const addSection = () => {
    if (!schema) return;
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      columns: 2,
    };
    setSchema({ ...schema, sections: [...schema.sections, newSection] });
    setExpandedSection(newSection.id); // Expand the newly added section
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !schema) return;
    
    const oldIndex = schema.sections.findIndex(s => s.id === active.id);
    const newIndex = schema.sections.findIndex(s => s.id === over.id);
    
    if (oldIndex !== newIndex) {
      setSchema({
        ...schema,
        sections: arrayMove(schema.sections, oldIndex, newIndex),
      });
    }
  };

  const handleFieldDragEnd = (event: DragEndEvent, sectionId: string) => {
    const { active, over } = event;
    if (!over || !schema) return;
    
    const sectionFields = schema.fields
      .filter(f => f.sectionId === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const oldIndex = sectionFields.findIndex(f => f.id === active.id);
    const newIndex = sectionFields.findIndex(f => f.id === over.id);
    
    if (oldIndex !== newIndex) {
      const reorderedFields = arrayMove(sectionFields, oldIndex, newIndex);
      const updatedFields = reorderedFields.map((field, index) => ({
        ...field,
        order: index + 1,
      }));
      
      // Update fields in schema
      const otherFields = schema.fields.filter(f => f.sectionId !== sectionId);
      setSchema({
        ...schema,
        fields: [...otherFields, ...updatedFields],
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    // Accordion behavior: if clicking the same section, collapse it; otherwise expand the new one
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const collapseAllSections = () => {
    setExpandedSection(null);
  };

  const getFieldsForSection = (sectionId: string): FormField[] => {
    if (!schema) return [];
    return schema.fields
      .filter(f => f.sectionId === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  if (loading) {
    return (
      <MainLayout title="Loading Schema...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </MainLayout>
    );
  }

  if (!schema) {
    return (
      <MainLayout title="Schema Not Found">
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-4">Schema not found</h3>
          <Button onClick={() => router.push('/builder/schemas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schemas
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Editing: ${schema.plural_name}`} subtitle="Schema Builder">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push('/builder/schemas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Schema
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="sections">
              <Layers className="h-4 w-4 mr-2" />
              Sections & Fields
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
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
                  <Textarea id="schema-description" value={schema.description || ''} onChange={(e) => updateSchema({ description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="singular-name">Singular Name</Label>
                    <Input id="singular-name" value={schema.singular_name || ''} onChange={(e) => updateSchema({ singular_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="plural-name">Plural Name</Label>
                    <Input id="plural-name" value={schema.plural_name || ''} onChange={(e) => updateSchema({ plural_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="schema-icon">Icon</Label>
                  <IconInput id="schema-icon" value={schema.icon || ''} onChange={(e) => updateSchema({ icon: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sections ({schema.sections.length})</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={collapseAllSections}>
                  <ChevronsUp className="h-4 w-4 mr-2" />
                  Collapse
                </Button>
                <Button onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={schema.sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6">
                  {schema.sections.map((section) => {
                    const fields = getFieldsForSection(section.id);
                    return (
                      <SortableSection
                        key={section.id}
                        section={section}
                        isExpanded={expandedSection === section.id}
                        onToggle={() => toggleSection(section.id)}
                        onDelete={() => deleteSection(section.id)}
                        onUpdate={(updates) => updateSection(section.id, updates)}
                      >
                        <div className="space-y-4 pt-0">
                          <div>
                            <Label>Icon</Label>
                            <IconInput value={section.icon || ''} onChange={(e) => updateSection(section.id, { icon: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Columns</Label>
                              <Input type="number" value={section.columns || 2} onChange={(e) => updateSection(section.id, { columns: parseInt(e.target.value) || 2 })} />
                            </div>
                            <div>
                              <Label>Initial State</Label>
                              <Select
                                value={section.initialState || 'expanded'}
                                onValueChange={(value) => updateSection(section.id, { initialState: value as 'expanded' | 'collapsed' })}
                                options={[
                                  { value: 'expanded', label: 'Expanded' },
                                  { value: 'collapsed', label: 'Collapsed' },
                                ]}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch id={`repeating-${section.id}`} checked={section.isRepeatingSection || false} onCheckedChange={(checked) => updateSection(section.id, { isRepeatingSection: checked })} />
                              <Label htmlFor={`repeating-${section.id}`} className="cursor-pointer">Repeating Section</Label>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t space-y-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-sm font-semibold text-gray-700">Fields ({fields.length})</h4>
                            </div>
                            
                            {fields.length > 0 && (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleFieldDragEnd(e, section.id)}
                              >
                                <SortableContext
                                  items={fields.map(f => f.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-3 mb-4">
                                    {fields.map((field) => (
                                      <SortableField key={field.id} id={field.id}>
                                        <FieldEditorContent field={field} onUpdate={(updates) => updateField(field.id, updates)} onDelete={() => deleteField(field.id)} sections={schema.sections} />
                                      </SortableField>
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            )}
                            
                            <Button
                              variant="outline"
                              onClick={() => addField(section.id)}
                              className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              Add Field
                            </Button>
                          </div>
                        </div>
                      </SortableSection>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all changes? This will discard all unsaved modifications and restore the schema to its last saved state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirm?.type === 'field' ? 'Field' : 'Section'}</DialogTitle>
            <DialogDescription>
              {deleteConfirm?.type === 'field' 
                ? 'Are you sure you want to delete this field?'
                : 'Are you sure you want to delete this section? All fields in this section will be removed.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteConfirm?.onConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </MainLayout>
  );
}

interface FieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  sections: FormSection[];
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

interface FieldEditorContentProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  sections: FormSection[];
}

function FieldEditorContent({ field, onUpdate, onDelete, sections }: FieldEditorContentProps) {
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
      <div className="group w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{field.label || 'Unnamed Field'}</span>
            <Badge variant="outline" className="text-xs">{field.type}</Badge>
            {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </div>
          <span className="text-xs text-gray-500 truncate block">{field.name}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => setShowDialog(true)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Field Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>
              Configure field properties and behavior
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Field Label</Label>
                <Input value={tempField.label} onChange={(e) => setTempField({ ...tempField, label: e.target.value })} />
              </div>
              <div>
                <Label>Field Name</Label>
                <Input value={tempField.name} onChange={(e) => setTempField({ ...tempField, name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Field Type</Label>
                <Select
                  value={tempField.type}
                  onValueChange={(value) => setTempField({ ...tempField, type: value as any, component: value as any })}
                  options={FIELD_TYPES}
                />
              </div>
              <div>
                <Label>Component</Label>
                <Select
                  value={tempField.component}
                  onValueChange={(value) => setTempField({ ...tempField, component: value as any })}
                  options={FIELD_TYPES}
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
            <div className="grid grid-cols-3 gap-4">
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
                options={ROLES}
                placeholder="Select role..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
