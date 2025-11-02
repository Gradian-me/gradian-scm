'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Layers, Loader2, ArrowLeft } from 'lucide-react';
import { FormSchema, FormField, FormSection } from '@/shared/types/form-schema';
import { GeneralInfoTab } from './GeneralInfoTab';
import { SectionsTab } from './SectionsTab';
import { SchemaActions } from './SchemaActions';
import { ResetDialog } from './ResetDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';

interface SchemaBuilderEditorProps {
  schemaId?: string;
  fetchSchema: (id: string) => Promise<FormSchema>;
  saveSchema: (id: string, schema: FormSchema) => Promise<void>;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export function SchemaBuilderEditor({
  schemaId,
  fetchSchema,
  saveSchema,
  onBack,
  title,
  subtitle = 'Schema Builder'
}: SchemaBuilderEditorProps) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [originalSchema, setOriginalSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'field' | 'section'; id: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    if (schemaId) {
      loadSchema(schemaId);
    }
  }, [schemaId]);

  const loadSchema = async (id: string) => {
    try {
      setLoading(true);
      const data = await fetchSchema(id);
      setSchema(data);
      setOriginalSchema(JSON.parse(JSON.stringify(data))); // Deep clone
      setExpandedSection(null);
    } catch (error) {
      console.error('Error loading schema:', error);
      alert('Error loading schema');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!schema || !schemaId) return;

    try {
      setSaving(true);
      await saveSchema(schemaId, schema);
      setOriginalSchema(JSON.parse(JSON.stringify(schema))); // Update original schema
      alert('Schema saved successfully!');
    } catch (error) {
      console.error('Error saving schema:', error);
      alert('Error saving schema');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!originalSchema) return;
    setSchema(JSON.parse(JSON.stringify(originalSchema)));
    setExpandedSection(null);
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
    setExpandedSection(newSection.id);
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
      const updatedFields = reorderedFields.map((field: FormField, index: number) => ({
        ...field,
        order: index + 1,
      }));
      
      const otherFields = schema.fields.filter(f => f.sectionId !== sectionId);
      setSchema({
        ...schema,
        fields: [...otherFields, ...updatedFields],
      });
    }
  };

  const toggleSection = (sectionId: string) => {
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
      <MainLayout title={title || 'Loading Schema...'} subtitle={subtitle}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </MainLayout>
    );
  }

  if (!schema) {
    return (
      <MainLayout title={title || 'Schema Not Found'} subtitle={subtitle}>
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-4">Schema not found</h3>
          {onBack && (
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={title || `Editing: ${schema.plural_name}`} subtitle={subtitle}>
      <div className="space-y-6">
        <SchemaActions
          onBack={onBack}
          onSave={handleSave}
          onReset={() => setShowResetDialog(true)}
          saving={saving}
        />

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
            <GeneralInfoTab
              schema={schema}
              onUpdate={updateSchema}
            />
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <SectionsTab
              sections={schema.sections}
              getFieldsForSection={getFieldsForSection}
              expandedSection={expandedSection}
              onToggleSection={toggleSection}
              onAddSection={addSection}
              onUpdateSection={updateSection}
              onDeleteSection={deleteSection}
              onAddField={addField}
              onFieldUpdate={updateField}
              onFieldDelete={deleteField}
              onSectionDragEnd={handleSectionDragEnd}
              onFieldDragEnd={handleFieldDragEnd}
              onCollapseAll={collapseAllSections}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onConfirm={handleReset}
      />

      {deleteConfirm && (
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          type={deleteConfirm.type}
          onConfirm={deleteConfirm.onConfirm}
        />
      )}
    </MainLayout>
  );
}

