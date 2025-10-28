// Schema to Zod Converter
// Generates Zod validation schemas from FormSchema definitions

import { z } from 'zod';
import { FormSchema, FormField } from '../../form-builder/types/form-schema';

// Define ValidationRule type based on FormField validation property
type ValidationRule = NonNullable<FormField['validation']>;

/**
 * Converts a validation rule from form schema to Zod schema
 */
const convertValidationToZod = (field: FormField): any => {
  const { validation, type, required } = field;
  
  // Start with base type
  let zodType: z.ZodTypeAny;
  
  // Determine base type from field type
  switch (type) {
    case 'number':
      zodType = z.number();
      break;
    case 'email':
      zodType = z.string().email('Invalid email address');
      break;
    case 'url':
      zodType = z.string().url('Invalid URL');
      break;
    case 'checkbox':
      // For checkbox arrays (categories, etc.)
      if (field.options) {
        zodType = z.array(z.string());
      } else {
        zodType = z.boolean();
      }
      break;
    case 'date':
    case 'datetime-local':
      zodType = z.string(); // Store as ISO string
      break;
    case 'textarea':
    case 'text':
    case 'tel':
    case 'password':
      zodType = z.string();
      break;
    case 'select':
      zodType = z.string();
      break;
    default:
      zodType = z.string();
  }
  
  // Apply validation rules
  if (validation) {
    // Required validation
    const isRequired = required ?? validation.required ?? false;
    const errorMessage = validation.custom ? undefined : getErrorMessage(field, validation);
    
    if (isRequired) {
      if (type === 'text' || type === 'textarea' || type === 'email' || type === 'url' || type === 'tel' || type === 'password') {
        zodType = (zodType as z.ZodString).min(1, errorMessage || `${field.label} is required`);
      } else if (type === 'number') {
        // For number fields, we use refine instead of min for required validation
        zodType = (zodType as z.ZodNumber).refine(val => val !== undefined && val !== null, {
          message: errorMessage || `${field.label} is required`
        });
      }
    }
    
    // Min length for strings
    if (validation.minLength && (type === 'text' || type === 'textarea' || type === 'email' || type === 'url')) {
      zodType = (zodType as z.ZodString).min(
        validation.minLength, 
        errorMessage || `Minimum length is ${validation.minLength}`
      );
    }
    
    // Max length for strings
    if (validation.maxLength && (type === 'text' || type === 'textarea' || type === 'email' || type === 'url')) {
      zodType = (zodType as z.ZodString).max(
        validation.maxLength,
        errorMessage || `Maximum length is ${validation.maxLength}`
      );
    }
    
    // Min value for numbers
    if (validation.min !== undefined && type === 'number') {
      zodType = (zodType as z.ZodNumber).min(
        validation.min,
        errorMessage || `Minimum value is ${validation.min}`
      );
    }
    
    // Max value for numbers
    if (validation.max !== undefined && type === 'number') {
      zodType = (zodType as z.ZodNumber).max(
        validation.max,
        errorMessage || `Maximum value is ${validation.max}`
      );
    }
    
    // Pattern validation
    if (validation.pattern) {
      const patternStr = validation.pattern.toString();
      const errorMsg = errorMessage || 'Invalid format';
      zodType = (zodType as z.ZodString).regex(validation.pattern, errorMsg);
    }
  } else if (required && type !== 'number') {
    // If just required without validation object
    zodType = (zodType as z.ZodString).min(1, `${field.label} is required`);
  }
  
  // Checkbox with options (multi-select)
  if (type === 'checkbox' && field.options && validation?.required) {
    zodType = (zodType as z.ZodArray<z.ZodString>).min(1, `At least one ${field.label} is required`);
  }
  
  // For non-required fields, make it optional
  if (!required && !validation?.required) {
    zodType = zodType.optional();
  }
  
  return zodType;
};

/**
 * Generates a Zod schema from a FormSchema
 */
export const generateZodSchemaFromForm = <T extends FormSchema>(
  schema: T,
  mode: 'create' | 'update' = 'create'
): z.ZodSchema<any> => {
  const shape: Record<string, any> = {};
  
  schema.sections.forEach(section => {
    // Handle repeating sections (like contacts)
    if (section.isRepeatingSection) {
      const nestedShape: Record<string, any> = {};
      
      section.fields.forEach(field => {
        const zodType = convertValidationToZod(field);
        nestedShape[field.name] = zodType;
      });
      
      // Create array schema with min/max constraints
      const itemSchema = z.object(nestedShape);
      let arraySchema = z.array(itemSchema);
      
      if (section.repeatingConfig) {
        const { minItems, maxItems } = section.repeatingConfig;
        
        if (minItems !== undefined) {
          arraySchema = arraySchema.min(
            minItems,
            `At least ${minItems} ${minItems === 1 ? 'item is' : 'items are'} required`
          );
        }
        
        if (maxItems !== undefined) {
          arraySchema = arraySchema.max(
            maxItems,
            `Maximum ${maxItems} ${maxItems === 1 ? 'item is' : 'items are'} allowed`
          );
        }
      }
      
      // Use section id as the key (e.g., 'contacts')
      if (mode === 'update') {
        shape[section.id] = arraySchema.optional();
      } else {
        shape[section.id] = arraySchema;
      }
    } else {
      // Handle regular fields
      section.fields.forEach(field => {
        const zodType = convertValidationToZod(field);
        
        if (mode === 'update') {
          // For update schemas, all fields are optional
          shape[field.name] = zodType.optional();
        } else {
          shape[field.name] = zodType;
        }
      });
    }
  });
  
  return z.object(shape);
};

/**
 * Generates validation rules for useFormState from FormSchema
 */
export const generateValidationRulesFromForm = <T extends FormSchema>(
  schema: T
): Record<string, any> => {
  const rules: Record<string, any> = {};
  
  schema.sections.forEach(section => {
    // Handle repeating sections
    if (section.isRepeatingSection) {
      // For repeating sections, we create nested rules
      // The key is the section id, and values are the array items
      section.fields.forEach(field => {
        const fieldRules: ValidationRule = {};
        
        if (field.validation) {
          Object.assign(fieldRules, field.validation);
        }
        
        // Also check the required prop on the field itself
        if (field.required && !field.validation?.required) {
          fieldRules.required = true;
        }
        
        if (Object.keys(fieldRules).length > 0) {
          // For repeating sections, store rules at the field level
          // These will be applied to each item in the array
          const fieldPath = `${section.id}.${field.name}`;
          rules[fieldPath] = fieldRules;
        }
      });
    } else {
      // Handle regular fields
      section.fields.forEach(field => {
        const fieldRules: ValidationRule = {};
        
        if (field.validation) {
          Object.assign(fieldRules, field.validation);
        }
        
        // Also check the required prop on the field itself
        if (field.required && !field.validation?.required) {
          fieldRules.required = true;
        }
        
        if (Object.keys(fieldRules).length > 0) {
          rules[field.name] = fieldRules;
        }
      });
    }
  });
  
  return rules;
};

/**
 * Extracts initial values from FormSchema
 */
export const extractInitialValuesFromForm = <T extends FormSchema>(
  schema: T
): Record<string, any> => {
  const initialValues: Record<string, any> = {};
  
  schema.sections.forEach(section => {
    // Handle repeating sections
    if (section.isRepeatingSection) {
      // For repeating sections, initialize as empty array
      initialValues[section.id] = [];
    } else {
      // Handle regular fields
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue;
        } else {
          // Set appropriate defaults based on type
          switch (field.type) {
            case 'checkbox':
              if (field.options) {
                initialValues[field.name] = [];
              } else {
                initialValues[field.name] = false;
              }
              break;
            case 'number':
              initialValues[field.name] = 0;
              break;
            case 'date':
            case 'datetime-local':
              initialValues[field.name] = '';
              break;
            case 'select':
              // Check if it's the status field
              if (field.name === 'status' && field.options) {
                initialValues[field.name] = field.options[0]?.value || '';
              } else {
                initialValues[field.name] = '';
              }
              break;
            default:
              initialValues[field.name] = '';
          }
        }
      });
    }
  });
  
  return initialValues;
};

/**
 * Gets error message from validation rules
 */
const getErrorMessage = (field: FormField, validation: ValidationRule): string | undefined => {
  if (validation.custom) {
    return undefined; // Let custom handle it
  }
  
  if (validation.required) {
    return `${field.label} is required`;
  }
  
  return field.label ? `Invalid ${field.label.toLowerCase()}` : 'Invalid value';
};

/**
 * Generates both create and update schemas
 */
export const generateSchemasFromForm = <T extends FormSchema>(schema: T) => {
  const createSchema = generateZodSchemaFromForm(schema, 'create');
  const updateSchema = generateZodSchemaFromForm(schema, 'update');
  
  return {
    createSchema,
    updateSchema,
    validationRules: generateValidationRulesFromForm(schema),
    initialValues: extractInitialValuesFromForm(schema),
  };
};

/**
 * Helper to create nested array schemas (for repeating sections like contacts)
 */
export const createArrayFieldZodSchema = (
  fieldSchema: FormSchema,
  minItems?: number,
  maxItems?: number
) => {
  const itemSchema = generateZodSchemaFromForm(fieldSchema, 'create');
  
  let arraySchema = z.array(itemSchema);
  
  if (minItems !== undefined) {
    arraySchema = arraySchema.min(
      minItems,
      `At least ${minItems} ${minItems === 1 ? 'item is' : 'items are'} required`
    );
  }
  
  if (maxItems !== undefined) {
    arraySchema = arraySchema.max(
      maxItems,
      `Maximum ${maxItems} ${maxItems === 1 ? 'item is' : 'items are'} allowed`
    );
  }
  
  return arraySchema;
};

