import React from 'react';
import { motion } from 'framer-motion';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
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
      <div className="text-gray-500 font-medium group-hover:text-gray-700 transition-colors duration-200 border-b border-gray-200 pb-1 mb-2">
        {section?.title || section?.id}
      </div>
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

