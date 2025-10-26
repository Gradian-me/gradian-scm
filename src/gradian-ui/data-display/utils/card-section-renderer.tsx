import React from 'react';
import { motion } from 'framer-motion';
import { FormSchema } from '../../form-builder/types/form-schema';
import { cn } from '../../shared/utils';
import { resolveFieldById } from './field-resolver';
import { renderFieldValue } from './card-field-renderer';

interface RenderSectionProps {
  section: any;
  schema: FormSchema;
  data: any;
}

/**
 * Render a card section with its fields
 */
export const renderCardSection = ({ section, schema, data }: RenderSectionProps): React.ReactNode | null => {
  const fieldIds = section?.fieldIds || [];
  if (fieldIds.length === 0) return null;

  // Determine span class based on section.colSpan
  const colSpan = section?.colSpan || 1;
  const spanClass = colSpan === 2 ? 'col-span-1 md:col-span-2' : 'col-span-1';

  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
      className={cn("space-y-2", spanClass)}
    >
      <span className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
        {section?.title || section?.id}:
      </span>
      <div className="space-y-1">
        {fieldIds.map((fieldId: string) => {
          const field = resolveFieldById(schema, fieldId);
          if (!field) return null;
          const value = data[field.name];
          return (
            <div key={fieldId}>
              {renderFieldValue({ field, value })}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

