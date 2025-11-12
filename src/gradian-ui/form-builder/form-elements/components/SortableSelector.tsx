'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BadgeRenderer } from '../utils/badge-viewer';
import type { BadgeItem } from '../utils/badge-viewer';
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
  arrayMove,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SortableSelectorItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface SortableSelectorProps {
  /**
   * All available items to choose from
   */
  availableItems: SortableSelectorItem[];
  
  /**
   * Currently selected items (in order)
   */
  selectedItems: SortableSelectorItem[];
  
  /**
   * Callback when selected items change (including reordering)
   */
  onChange: (selectedItems: SortableSelectorItem[]) => void;
  
  /**
   * Whether items can be reordered via drag and drop
   * @default true
   */
  isSortable?: boolean;
  
  /**
   * Label for the selected items section
   * @default "Selected Items"
   */
  selectedLabel?: string;
  
  /**
   * Label for the available items section
   * @default "Available Items"
   */
  availableLabel?: string;
  
  /**
   * Maximum height for the lists (with scrolling)
   * @default "max-h-60"
   */
  maxHeight?: string;
  
  /**
   * Custom className for the container
   */
  className?: string;
  
  /**
   * Empty state message when no items are selected
   */
  emptySelectedMessage?: string;
  
  /**
   * Empty state message when no items are available
   */
  emptyAvailableMessage?: string;
}

/**
 * SortableItem - Internal component for rendering a sortable selected item
 */
interface SortableItemProps {
  item: SortableSelectorItem;
  onRemove: () => void;
  isSortable: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, onRemove, isSortable }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isSortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasIconOrColor = Boolean(item.icon || item.color);

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className={cn(
        "w-full rounded-lg border transition-all duration-200",
        isDragging
          ? 'border-violet-400 shadow-md ring-2 ring-violet-200 bg-white'
          : 'border-gray-200 bg-white hover:shadow-sm'
      )}>
        <div className="p-2">
          <div className="flex items-center gap-2">
            {isSortable && (
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-0.5 shrink-0"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              {hasIconOrColor ? (
                <BadgeRenderer
                  items={[{
                    id: item.id,
                    label: item.label,
                    icon: item.icon,
                    color: item.color,
                  } as BadgeItem]}
                  maxBadges={0}
                  animate={false}
                  className="justify-start"
                />
              ) : (
                <span className="text-sm font-medium text-gray-800">{item.label}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SortableSelector - Component for selecting and reordering items
 * Supports drag-and-drop reordering when isSortable is true
 * Uses BadgeRenderer to display items with icons and colors
 */
export const SortableSelector: React.FC<SortableSelectorProps> = ({
  availableItems = [],
  selectedItems = [],
  onChange,
  isSortable = true,
  selectedLabel = 'Selected Items',
  availableLabel = 'Available Items',
  maxHeight = 'max-h-60',
  className,
  emptySelectedMessage = 'No items selected. Select items below to add them.',
  emptyAvailableMessage = 'No items available.',
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleToggleItem = (itemId: string) => {
    const isSelected = selectedItems.some(item => item.id === itemId);
    const item = availableItems.find(i => i.id === itemId);
    
    if (!item) return;

    if (isSelected) {
      // Remove from selected
      onChange(selectedItems.filter(item => item.id !== itemId));
    } else {
      // Add to selected
      onChange([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    onChange(selectedItems.filter(item => item.id !== itemId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isSortable) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedItems.findIndex(item => item.id === active.id);
    const newIndex = selectedItems.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(selectedItems, oldIndex, newIndex);
      onChange(reordered);
    }
  };

  const getAvailableItems = () => {
    const selectedIds = new Set(selectedItems.map(item => item.id));
    return availableItems.filter(item => !selectedIds.has(item.id));
  };

  const unselectedItems = getAvailableItems();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected Items Section */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {selectedLabel} ({selectedItems.length})
        </Label>
        <AnimatePresence mode="popLayout">
          {selectedItems.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {isSortable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className={cn("space-y-2 overflow-y-auto border border-gray-200 rounded-lg p-3", maxHeight)}>
                      <AnimatePresence mode="popLayout">
                        {selectedItems.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10, height: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: idx * 0.03,
                              ease: [0.4, 0, 0.2, 1]
                            }}
                            layout
                          >
                            <SortableItem
                              item={item}
                              onRemove={() => handleRemoveItem(item.id)}
                              isSortable={isSortable}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className={cn("space-y-2 overflow-y-auto border border-gray-200 rounded-lg p-3", maxHeight)}>
                  <AnimatePresence mode="popLayout">
                    {selectedItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: idx * 0.03,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        layout
                      >
                        <SortableItem
                          item={item}
                          onRemove={() => handleRemoveItem(item.id)}
                          isSortable={false}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500"
            >
              {emptySelectedMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Available Items Section */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {availableLabel}
        </Label>
        {unselectedItems.length === 0 ? (
          <div className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
            {emptyAvailableMessage}
          </div>
        ) : (
          <div className={cn("space-y-2 overflow-y-auto border border-gray-200 rounded-lg p-3", maxHeight)}>
            {unselectedItems.map((item) => {
              const hasIconOrColor = Boolean(item.icon || item.color);
              return (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sortable-selector-${item.id}`}
                    checked={false}
                    onCheckedChange={() => handleToggleItem(item.id)}
                  />
                  <Label
                    htmlFor={`sortable-selector-${item.id}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {hasIconOrColor ? (
                      <BadgeRenderer
                        items={[{
                          id: item.id,
                          label: item.label,
                          icon: item.icon,
                          color: item.color,
                        }]}
                        maxBadges={0}
                        animate={false}
                        className="justify-start"
                      />
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

SortableSelector.displayName = 'SortableSelector';

