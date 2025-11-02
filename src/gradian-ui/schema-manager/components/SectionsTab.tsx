'use client';

import { Button } from '@/components/ui/button';
import { ChevronsUp, Plus } from 'lucide-react';
import { FormSection, FormField } from '@/shared/types/form-schema';
import { SectionContent } from './SectionContent';
import { SortableSection } from './SortableSection';
import { SortableField } from './SortableField';
import { FieldEditorContent } from './FieldEditorContent';
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

interface SectionsTabProps {
  sections: FormSection[];
  getFieldsForSection: (sectionId: string) => FormField[];
  expandedSection: string | null;
  onToggleSection: (sectionId: string) => void;
  onAddSection: () => void;
  onUpdateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddField: (sectionId: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onSectionDragEnd: (event: DragEndEvent) => void;
  onFieldDragEnd: (event: DragEndEvent, sectionId: string) => void;
  onCollapseAll: () => void;
}

export function SectionsTab({
  sections,
  getFieldsForSection,
  expandedSection,
  onToggleSection,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddField,
  onFieldUpdate,
  onFieldDelete,
  onSectionDragEnd,
  onFieldDragEnd,
  onCollapseAll
}: SectionsTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Sections ({sections.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCollapseAll}>
            <ChevronsUp className="h-4 w-4 mr-2" />
            Collapse
          </Button>
          <Button onClick={onAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onSectionDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sections.map((section) => {
              const fields = getFieldsForSection(section.id);
              return (
                <SortableSection
                  key={section.id}
                  section={section}
                  isExpanded={expandedSection === section.id}
                  onToggle={() => onToggleSection(section.id)}
                  onDelete={() => onDeleteSection(section.id)}
                  onUpdate={(updates) => onUpdateSection(section.id, updates)}
                >
                  {fields.length > 0 && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => onFieldDragEnd(e, section.id)}
                    >
                      <SortableContext
                        items={fields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 mb-3">
                          {fields.map((field) => (
                            <SortableField key={field.id} id={field.id}>
                              <FieldEditorContent
                                field={field}
                                onUpdate={(updates) => onFieldUpdate(field.id, updates)}
                                onDelete={() => onFieldDelete(field.id)}
                                sections={sections}
                              />
                            </SortableField>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                  <SectionContent
                    section={section}
                    fields={fields}
                    sections={sections}
                    onUpdate={(updates) => onUpdateSection(section.id, updates)}
                    onAddField={() => onAddField(section.id)}
                    onFieldUpdate={onFieldUpdate}
                    onFieldDelete={onFieldDelete}
                  />
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

