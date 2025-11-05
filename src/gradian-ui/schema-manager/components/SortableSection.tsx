'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { ButtonMinimal } from '@/gradian-ui/form-builder/form-elements';
import { GripVertical, Trash2, Edit } from 'lucide-react';
import { FormSection } from '../types/form-schema';
import { SectionEditor } from './SectionEditor';

export interface SortableSectionProps {
  section: FormSection;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<FormSection>) => void;
  fields: any[];
  sections: FormSection[];
  onAddField: () => void;
  onFieldUpdate: (fieldId: string, updates: any) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, direction: 'up' | 'down') => void;
  config?: any;
  currentSchemaId?: string;
}

export function SortableSection({ 
  section, 
  children, 
  isExpanded, 
  onToggle, 
  onDelete,
  onUpdate,
  fields,
  sections,
  onAddField,
  onFieldUpdate,
  onFieldDelete,
  onFieldMove,
  config,
  currentSchemaId
}: SortableSectionProps) {
  const [showDialog, setShowDialog] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="relative">
        <Card className={`w-full border border-gray-200 hover:shadow-sm transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-violet-400' : ''}`}>
          <div className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{section.title || 'Untitled Section'}</h4>
                  {section.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{section.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                <ButtonMinimal
                  icon={Edit}
                  title="Edit Section"
                  color="violet"
                  size="md"
                  onClick={() => setShowDialog(true)}
                />
                <ButtonMinimal
                  icon={Trash2}
                  title="Delete Section"
                  color="red"
                  size="md"
                  onClick={onDelete}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {showDialog && (
        <SectionEditor
          section={section}
          fields={fields}
          onUpdate={onUpdate}
          onDelete={() => {
            setShowDialog(false);
            onDelete();
          }}
          onAddField={onAddField}
          onFieldUpdate={onFieldUpdate}
          onFieldDelete={onFieldDelete}
          onFieldMove={onFieldMove}
          sections={sections}
          config={config}
          currentSchemaId={currentSchemaId}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}

