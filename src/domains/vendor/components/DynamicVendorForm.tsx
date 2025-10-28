import React from 'react';
import { FormWrapper } from '../../../gradian-ui/form-builder/form-wrapper/components/FormWrapper';
import { FormWrapperProps } from '../../../gradian-ui/form-builder/form-wrapper/types';
import { ExtendedFormSchema } from '../types/extended-form-schema';
import { updateSchemaWithDynamicProperties } from '../utils/form-schema-utils';

// Extend the FormWrapperProps to accept our ExtendedFormSchema
interface DynamicVendorFormProps extends Omit<FormWrapperProps, 'config'> {
  config: ExtendedFormSchema;
}

export const DynamicVendorForm: React.FC<DynamicVendorFormProps> = ({
  config,
  ...props
}) => {
  // Ensure config has required properties
  const safeConfig = {
    ...config,
    // Ensure UI property exists with required fields
    ui: {
      ...(config.ui || {}),
      entityName: config.singular_name || config.name || 'Entity',
      createTitle: `Create New ${config.singular_name || config.name || 'Entity'}`,
      editTitle: `Edit ${config.singular_name || config.name || 'Entity'}`,
      basePath: config.name ? config.name.toLowerCase() : (config.plural_name || 'entities').toLowerCase()
    }
  };
  
  // Process the schema to generate dynamic properties based on singular_name and plural_name
  const processedConfig = updateSchemaWithDynamicProperties(safeConfig);
  
  return (
    <FormWrapper
      config={processedConfig}
      {...props}
    />
  );
};
