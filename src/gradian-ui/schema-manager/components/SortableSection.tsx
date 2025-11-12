'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { ButtonMinimal, Badge } from '@/gradian-ui/form-builder/form-elements';
import { GripVertical, Trash2, Edit } from 'lucide-react';
import { FormSection, FormSchema } from '../types/form-schema';
import { SectionEditor } from './SectionEditor';
import { SchemaBuilderDialog } from './SchemaBuilderDialog';
import { config } from '@/lib/config';

export interface SortableSectionProps {
  section: FormSection;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<FormSection>) => void;
  fields: any[];
  sections: FormSection[];
  onAddField: (sectionId?: string) => void; // Optional sectionId - will use current section if not provided
  onFieldUpdate: (fieldId: string, updates: any) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, direction: 'up' | 'down') => void;
  config?: any;
  currentSchemaId?: string;
  isIncomplete?: boolean;
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
  currentSchemaId,
  isIncomplete = false
}: SortableSectionProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showSchemaDialog, setShowSchemaDialog] = useState(false);
  const [targetSchemaName, setTargetSchemaName] = useState<string | null>(null);
  const [targetSchemaId, setTargetSchemaId] = useState<string | null>(null);
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

  // Check if section is relation-based and fetch target schema name
  useEffect(() => {
    const targetSchema = section.repeatingConfig?.targetSchema;
    const isRelationBased = section.isRepeatingSection && targetSchema;
    
    if (isRelationBased && targetSchema) {
      setTargetSchemaId(targetSchema); // Set immediately so dialog can render
      const fetchTargetSchemaName = async () => {
        try {
          const response = await fetch(`/api/schemas/${targetSchema}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const schema: FormSchema = result.data;
              setTargetSchemaName(schema.plural_name || schema.singular_name || targetSchema);
            }
          }
        } catch (error) {
          console.error('Error fetching target schema:', error);
          // Fallback to schema ID if fetch fails
          setTargetSchemaName(targetSchema || null);
        }
      };
      fetchTargetSchemaName();
    } else {
      setTargetSchemaName(null);
      setTargetSchemaId(null);
    }
  }, [section.isRepeatingSection, section.repeatingConfig?.targetSchema]);

  const isInactive = section.inactive;

  return (
    <>
      <div ref={setNodeRef} style={style} className="relative">
        <Card className={`w-full border hover:shadow-sm transition-all duration-200 ${
          isDragging 
            ? 'border-violet-400 shadow-lg ring-2 ring-violet-400 bg-white' 
            : isInactive
              ? 'border-gray-300 bg-gray-50 opacity-60'
              : isIncomplete 
                ? 'border-amber-300 bg-amber-50/50 ring-1 ring-amber-200' 
                : 'border-gray-200 bg-white'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  {...attributes}
                  {...listeners}
                  className={`cursor-grab active:cursor-grabbing transition-colors p-0.5 ${
                    isInactive ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-md font-semibold truncate ${
                      isInactive 
                        ? 'text-gray-500' 
                        : isIncomplete 
                          ? 'text-amber-700' 
                          : 'text-gray-900'
                    }`}>
                      {section.title || 'Untitled Section'}
                    </h4>
                    {isInactive && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-300 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                    {isIncomplete && !isInactive && (
                      <Badge variant="warning" size="sm" className="text-[10px] px-1.5 py-0">
                        Incomplete
                      </Badge>
                    )}
                    {targetSchemaName ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (targetSchemaId) {
                            setShowSchemaDialog(true);
                          }
                        }}
                        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
                      >
                        <Badge 
                          variant="primary" 
                          size="sm" 
                          className="cursor-pointer hover:bg-blue-200 transition-colors"
                        >
                          {targetSchemaName}
                        </Badge>
                      </button>
                    ) : (
                      <Badge variant="outline" size="sm" className="shrink-0">
                        {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                      </Badge>
                    )}
                    {isIncomplete && fields.length === 0 && !section.isRepeatingSection && (
                      <span className="text-xs text-amber-600 ml-1">
                        • No fields are selected
                      </span>
                    )}
                  </div>
                  {section.description && (
                    <p className={`text-xs truncate mt-0.5 ${
                      isInactive 
                        ? 'text-gray-400' 
                        : isIncomplete 
                          ? 'text-amber-600' 
                          : 'text-gray-500'
                    }`}>
                      {section.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
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
          onAddField={(sectionId) => onAddField(sectionId || section.id)}
          onFieldUpdate={onFieldUpdate}
          onFieldDelete={onFieldDelete}
          onFieldMove={onFieldMove}
          sections={sections}
          config={config}
          currentSchemaId={currentSchemaId}
          onClose={() => setShowDialog(false)}
        />
      )}

      {targetSchemaId ? (
        <SchemaBuilderDialog
          schemaId={targetSchemaId}
          fetchSchema={async (id: string) => {
            const apiBasePath = config?.schemaApi?.basePath || '/api/schemas';
            const response = await fetch(`${apiBasePath}/${id}`);
            const result = await response.json();
            if (result.success) {
              return result.data;
            } else {
              throw new Error('Failed to fetch schema');
            }
          }}
          saveSchema={async (id: string, schema: FormSchema) => {
            const apiBasePath = config?.schemaApi?.basePath || '/api/schemas';
            const { id: _schemaId, ...payload } = schema;
            const response = await fetch(`${apiBasePath}/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!result.success) {
              throw new Error('Failed to save schema');
            }
          }}
          open={showSchemaDialog}
          onOpenChange={setShowSchemaDialog}
        />
      ) : null}
    </>
  );
}

