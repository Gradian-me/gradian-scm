'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsUp } from 'lucide-react';
import { FormSection, FormField } from '../types/form-schema';
import { AddButtonFull, Switch } from '@/gradian-ui/form-builder/form-elements';
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
  onAddField: (sectionId: string) => void; // Parent expects sectionId, but we'll make it work with optional
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

  // Check if a section is incomplete (has default values or missing required fields)
  const isSectionIncomplete = (section: FormSection): boolean => {
    // If it's still the default "New Section", it's incomplete
    if (section.title === 'New Section' || !section.title || section.title.trim() === '') {
      return true;
    }
    
    // If the name has been changed but:
    // - It has no fields AND
    // - It's not a repeating section
    // Then it's incomplete
    const fields = getFieldsForSection(section.id);
    const hasNoFields = fields.length === 0;
    const isNotRepeating = !section.isRepeatingSection;
    
    return hasNoFields && isNotRepeating;
  };

  // Check if there are any incomplete sections
  const hasIncompleteSections = sections.some(isSectionIncomplete);
  
  // Check if there are any inactive sections
  const hasInactiveSections = useMemo(() => sections.some(s => s.inactive), [sections]);
  const [showInactiveSections, setShowInactiveSections] = useState(false);
  
  // Calculate section count based on showInactiveSections
  const sectionsCount = useMemo(() => {
    return showInactiveSections 
      ? sections.length 
      : sections.filter(s => !s.inactive).length;
  }, [sections, showInactiveSections]);
  
  // Get sections to display
  const sectionsToDisplay = useMemo(() => {
    return showInactiveSections 
      ? sections 
      : sections.filter(s => !s.inactive);
  }, [sections, showInactiveSections]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {hasInactiveSections && (
            <div className="flex items-center border border-gray-300 rounded-lg px-3 h-8">
              <Switch
                config={{ 
                  name: 'show-inactive-sections', 
                  label: 'Show Inactive Sections'
                }}
                checked={showInactiveSections}
                onChange={setShowInactiveSections}
              />
            </div>
          )}
          <div className="flex items-start gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Sections</h3>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
              {sectionsCount}
            </span>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onSectionDragEnd}
      >
        <SortableContext
          items={sectionsToDisplay.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sectionsToDisplay.map((section) => {
              const fields = getFieldsForSection(section.id).filter(f => !f.inactive);
              const sectionIsIncomplete = isSectionIncomplete(section);
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
                  onAddField={(sectionId) => onAddField(sectionId || section.id)}
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
                  isIncomplete={sectionIsIncomplete}
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
              disabled={hasIncompleteSections}
            />
            {hasIncompleteSections && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                <span className="text-amber-600">⚠</span>
                <span>Please complete the configuration for the new section before adding another section.</span>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

