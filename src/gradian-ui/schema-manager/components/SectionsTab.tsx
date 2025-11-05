'use client';

import { Button } from '@/components/ui/button';
import { ChevronsUp } from 'lucide-react';
import { FormSection, FormField } from '../types/form-schema';
import { AddButtonFull } from '@/gradian-ui/form-builder/form-elements';
import { SortableSection } from './SortableSection';
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
  currentSchemaId?: string;
  config?: any;
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
  onCollapseAll,
  currentSchemaId,
  config
}: SectionsTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex items-start gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Sections</h3>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            {sections.length}
          </span>
        </div>
        <Button variant="outline" className="h-9 sm:h-11 w-9 sm:w-11 p-0 rounded-xl shrink-0" title="Collapse All" size="sm" onClick={onCollapseAll}>
          <ChevronsUp className="h-4 w-4" />
        </Button>
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
                  fields={fields}
                  sections={sections}
                  onAddField={() => onAddField(section.id)}
                  onFieldUpdate={onFieldUpdate}
                  onFieldDelete={onFieldDelete}
                  onFieldMove={(fieldId, direction) => {
                    const sectionFields = fields.sort((a, b) => (a.order || 0) - (b.order || 0));
                    const currentIndex = sectionFields.findIndex(f => f.id === fieldId);
                    if (direction === 'up' && currentIndex > 0) {
                      const newIndex = currentIndex - 1;
                      const reordered = [...sectionFields];
                      [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
                      reordered.forEach((field, idx) => {
                        onFieldUpdate(field.id, { order: idx + 1 });
                      });
                    } else if (direction === 'down' && currentIndex < sectionFields.length - 1) {
                      const newIndex = currentIndex + 1;
                      const reordered = [...sectionFields];
                      [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
                      reordered.forEach((field, idx) => {
                        onFieldUpdate(field.id, { order: idx + 1 });
                      });
                    }
                  }}
                  config={config}
                  currentSchemaId={currentSchemaId}
                >
                  <div />
                </SortableSection>
              );
            })}
            <AddButtonFull
              label="Add Section"
              onClick={onAddSection}
              iconSize="w-4 h-4"
              textSize="text-xs sm:text-sm"
              className="px-3 py-2 rounded-xl"
            />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

