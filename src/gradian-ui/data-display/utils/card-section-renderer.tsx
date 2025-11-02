import React from 'react';
import { motion } from 'framer-motion';
import { FormSchema } from '../../../shared/types/form-schema';
import { cn } from '../../shared/utils';
import { resolveFieldById } from '../../form-builder/form-elements/utils/field-resolver';
import { renderFieldValue } from './card-field-renderer';

interface RenderSectionProps {
  section: any;
  schema: FormSchema;
  data: any;
  maxMetrics?: number;
}

/**
 * Render a card section with its fields
 */
export const renderCardSection = ({ section, schema, data, maxMetrics = 3 }: RenderSectionProps): React.ReactNode | null => {
  const fieldIds = section?.fieldIds || [];
  if (fieldIds.length === 0) return null;

  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
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
              {renderFieldValue({ field, value, maxMetrics })}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

