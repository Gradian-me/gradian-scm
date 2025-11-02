'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export const SortableSection = ({ 
  section, 
  children, 
  isExpanded, 
  onToggle, 
  onDelete,
  onUpdate
}: SortableSectionProps) => {
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
      <Card className={`transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-violet-400' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 -ml-1"
              >
                <GripVertical className="h-5 w-5" />
              </button>
              <div className="flex-1 space-y-2">
                <Input
                  value={section.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="text-lg font-semibold"
                  placeholder="Section title..."
                />
                <Textarea
                  value={section.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Section description..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onToggle}>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>{children}</CardContent>
        )}
      </Card>
    </div>
  );
};

