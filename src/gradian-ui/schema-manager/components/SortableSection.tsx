'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { TextInput, Textarea } from '@/gradian-ui/form-builder/form-elements';
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { FormSection } from '../types/form-schema';

export interface SortableSectionProps {
  section: FormSection;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<FormSection>) => void;
}

export function SortableSection({ 
  section, 
  children, 
  isExpanded, 
  onToggle, 
  onDelete,
  onUpdate
}: SortableSectionProps) {
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
    <div ref={setNodeRef} style={style} className="relative">
      <div className={`bg-white rounded-xl border transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-violet-400' : 'border-gray-200'}`}>
        <div className="px-2 sm:px-3 py-1.5">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0 space-y-1">
                <TextInput
                  config={{ name: 'section-title', label: 'Section Title', placeholder: 'Section title...' }}
                  value={section.title}
                  onChange={(value) => onUpdate({ title: value })}
                />
                <Textarea
                  config={{ name: 'section-description', label: 'Section Description', placeholder: 'Section description...' }}
                  value={section.description || ''}
                  onChange={(value) => onUpdate({ description: value })}
                  rows={1}
                  resize="none"
                />
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="px-2 sm:px-3 pb-2.5 border-t border-gray-100">{children}</div>
        )}
      </div>
    </div>
  );
}

