'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableFieldProps {
  id: string;
  children: React.ReactNode;
}

export function SortableField({ id, children }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className={`flex items-center gap-2 bg-white rounded-xl border p-1.5 hover:border-violet-300 transition-all duration-200 ${isDragging ? 'border-violet-400 shadow-md' : 'border-gray-100'}`}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-0.5"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

