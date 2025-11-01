import { FormElementConfig } from '../../../gradian-ui/form-builder/form-elements/types';
import { FormSchema } from '../../../shared/types/form-schema';

/**
 * Extracts all fields from form schema and converts them to FormElementConfig
 * @param schema The extended form schema with fields
 * @returns Array of form element configs
 */
const extractFieldsFromSections = (schema: FormSchema): FormElementConfig[] => {
  if (!schema.fields) {
    return [];
  }
  
  const fields: FormElementConfig[] = [];
  
  // Convert FormField to FormElementConfig
  schema.fields.forEach(field => {
        // Handle component types that are not in FormElementConfig
        const component = field.component === 'tel' || field.component === 'url' || field.component === 'datetime-local' 
          ? 'text' 
          : field.component;
          
        // Create a compatible FormElementConfig
        const elementConfig: FormElementConfig = {
          name: field.name,
          label: field.label,
          type: field.type as FormElementConfig['type'],
          component: component as FormElementConfig['component'],
          placeholder: field.placeholder,
          validation: field.validation,
          options: field.options,
          defaultValue: field.defaultValue
        };
        
        // Add optional properties if they exist
        if (field.ui) {
          // Handle layout properties from ui
          elementConfig.layout = {
            width: field.ui.width,
            order: field.ui.order,
            hidden: false
          };
          
          // Handle styling properties from ui
          elementConfig.styling = {
            variant: field.ui.variant === 'underlined' ? 'outlined' : field.ui.variant as 'default' | 'outlined' | 'filled' | undefined,
            size: field.ui.size
          };
        }
        // For backward compatibility
        else if ((field as any).layout || (field as any).styling) {
          if ((field as any).layout) {
            elementConfig.layout = {
              width: (field as any).layout.width,
              order: (field as any).layout.order,
              hidden: false
            };
          }
          
          if ((field as any).styling) {
            elementConfig.styling = {
              variant: (field as any).styling.variant === 'underlined' ? 'outlined' : (field as any).styling.variant as 'default' | 'outlined' | 'filled' | undefined,
              size: (field as any).styling.size
            };
          }
        }
        
    fields.push(elementConfig);
  });
  
  return fields;
};

/**
 * Generates dynamic UI properties based on singular_name and plural_name
 * @param schema The extended form schema with singular_name and plural_name
 * @returns Updated config with dynamic UI properties
 */
export const generateDynamicSchemaProperties = (schema: FormSchema): any => {
  const { singular_name, plural_name, sections, cardMetadata, ...restSchema } = schema;
  
  // Extract all fields from sections
  const fields = extractFieldsFromSections(schema);
  
  if (!singular_name) {
    return {
      ...restSchema,
      fields,
    };
  }
  
  // Create a new config with dynamic properties
  // Return as 'any' to bypass type checking since we need to add ui property
  return {
    ...restSchema,
    fields,
    title: `Create New ${singular_name}`,
    // Add UI property required by schema manager
    ui: {
      entityName: singular_name || 'Entity', // Ensure entityName is never undefined
      createTitle: `Create New ${singular_name || 'Entity'}`,
      editTitle: `Edit ${singular_name || 'Entity'}`,
      basePath: schema.name ? schema.name.toLowerCase() : plural_name ? plural_name.toLowerCase() : (singular_name || 'entity').toLowerCase()
    },
    actions: {
      ...schema.actions,
      submit: {
        ...schema.actions?.submit,
        label: `Create ${singular_name}`,
      }
    }
  };
};

/**
 * Updates an existing form schema with dynamic properties
 * @param schema The form schema to update
 * @returns Updated config with dynamic properties
 */
export const updateSchemaWithDynamicProperties = (schema: FormSchema): any => {
  if (!schema.singular_name) {
    return {
      ...schema,
      fields: extractFieldsFromSections(schema),
      // Add empty UI property to satisfy schema manager
      ui: {
        entityName: schema.name || 'Entity', // Ensure entityName is never undefined
        createTitle: `Create New ${schema.name || 'Entity'}`,
        editTitle: `Edit ${schema.name || 'Entity'}`,
        basePath: schema.name ? schema.name.toLowerCase() : 'entity'
      }
    };
  }
  
  return generateDynamicSchemaProperties(schema);
};
