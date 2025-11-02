'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { FormSection } from '@/shared/types/form-schema';

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
      <div className={`bg-white rounded-md border transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-violet-400' : 'border-gray-200'}`}>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0 space-y-1">
                <Input
                  value={section.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="text-sm font-medium h-8 border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Section title..."
                />
                <Textarea
                  value={section.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Section description..."
                  rows={1}
                  className="text-xs border-none bg-transparent px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
          <div className="px-3 pb-3 border-t border-gray-100">{children}</div>
        )}
      </div>
    </div>
  );
}

