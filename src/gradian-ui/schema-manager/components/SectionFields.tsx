'use client';

import { FormSection, FormField } from '../types/form-schema';
import { AddButtonFull } from '@/gradian-ui/form-builder/form-elements';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SectionFieldsProps {
  section: FormSection;
  fields: FormField[];
  sections: FormSection[];
  onAddField: () => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldDragEnd: (event: DragEndEvent, sectionId: string) => void;
}

export function SectionFields({
  section,
  fields,
  sections,
  onAddField,
  onFieldUpdate,
  onFieldDelete,
  onFieldDragEnd
}: SectionFieldsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-start gap-2">
        <h4 className="text-xs font-semibold text-gray-600">Fields</h4>
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
          {fields.length}
        </span>
      </div>

      {fields.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => onFieldDragEnd(e, section.id)}
        >
          <SortableContext
            items={fields.filter(f => !f.inactive).map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {fields.filter(f => !f.inactive).map((field) => (
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

      <AddButtonFull
        label="Add Field"
        onClick={onAddField}
        iconSize="w-4 h-4"
        textSize="text-xs sm:text-sm"
        className="px-3 py-2 rounded-xl"
      />
    </div>
  );
}

