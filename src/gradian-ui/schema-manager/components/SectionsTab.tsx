'use client';

import { Button } from '@/components/ui/button';
import { ChevronsUp, Plus } from 'lucide-react';
import { FormSection, FormField } from '@/shared/types/form-schema';
import { SectionContent } from './SectionContent';
import { SectionFields } from './SectionFields';
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
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex items-start gap-2">
          <h3 className="text-sm sm:text-base font-semibold">Sections</h3>
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
                >
                  <SectionContent
                    section={section}
                    onUpdate={(updates) => onUpdateSection(section.id, updates)}
                  />
                  <SectionFields
                    section={section}
                    fields={fields}
                    sections={sections}
                    onAddField={() => onAddField(section.id)}
                    onFieldUpdate={onFieldUpdate}
                    onFieldDelete={onFieldDelete}
                    onFieldDragEnd={onFieldDragEnd}
                  />
                </SortableSection>
              );
            })}
            <Button
              variant="outline"
              onClick={onAddSection}
              className="w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-1.5" />
              <span className="truncate">Add Section</span>
            </Button>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

