import { FormSchema as BuilderFormSchema, FormField as BuilderFormField } from '../../types/form-schema';
import { FormSchema, FormField } from '../../../../shared/types/form-schema';

/**
 * Apply default properties to a field if they are not specified
 */
export const applyFieldUIDefaults = (field: FormField): FormField => {
  const fieldCopy = { ...field };
  
  // Apply defaults for colSpan and order only if not already specified
  if (fieldCopy.colSpan == null) {
    fieldCopy.colSpan = 1;
  }
  // Preserve order of 0, but default undefined/null to 999
  if (fieldCopy.order == null) {
    fieldCopy.order = 999; // Default high order for unsorted fields
  }
  
  return fieldCopy;
};

/**
 * Get all fields for a specific section from the schema
 */
export const getFieldsForSection = (schema: FormSchema | BuilderFormSchema, sectionId: string): FormField[] => {
  if (!schema?.fields) {
    return [];
  }
  return schema.fields
    .filter(field => field.sectionId === sectionId)
    .map(field => applyFieldUIDefaults(field));
};

/**
 * Get all fields from the schema that have a specific role
 */
export const getFieldsByRole = (schema: FormSchema, role: string): any[] => {
  const fields: any[] = [];
  if (schema?.fields) {
    schema.fields.forEach((field: any) => {
      if (field.role === role) {
        fields.push(field);
      }
    });
  }
  return fields;
};

/**
 * Get concatenated values by role (multiple fields with same role joined with |)
 */
export const getValueByRole = (schema: FormSchema, data: any, role: string): string => {
  const fields = getFieldsByRole(schema, role);
  if (fields.length === 0) return '';
  
  const values = fields
    .map(field => data[field.name])
    .filter(val => val !== undefined && val !== null && val !== '');
  
  return values.join(' | ');
};

/**
 * Get single value by role (for backwards compatibility)
 */
export const getSingleValueByRole = (schema: FormSchema, data: any, role: string, defaultValue: string = ''): string => {
  const fields = getFieldsByRole(schema, role);
  if (fields.length === 0) return defaultValue;
  const value = data[fields[0].name];
  return value !== undefined && value !== null ? value : defaultValue;
};

/**
 * Resolve field by ID from form schema
 */
export const resolveFieldById = (schema: FormSchema, fieldId: string): any => {
  if (!schema?.fields) {
    return { id: fieldId, name: fieldId };
  }
  
  const field = schema.fields.find(f => f.id === fieldId);
  if (!field) {
    return { id: fieldId, name: fieldId };
  }
  return field;
};

/**
 * Get field value from data using dot notation
 */
export const getFieldValue = (fieldPath: string, data: any) => {
  return fieldPath.split('.').reduce((obj, key) => obj?.[key], data);
};

/**
 * Get array values by role - specifically for badge/category fields
 */
export const getArrayValuesByRole = (schema: FormSchema, data: any, role: string): any[] => {
  const fields = getFieldsByRole(schema, role);
  if (fields.length === 0) return [];
  
  // Get the first field with this role
  const fieldName = fields[0].name;
  const value = data[fieldName];
  
  // Return as array if it exists and is an array
  if (value !== undefined && value !== null && Array.isArray(value)) {
    return value;
  }
  
  return [];
};

/**
 * Get metrics by role - specifically for performance metrics fields
 */
export const getMetricsByRole = (schema: FormSchema, data: any, role: string): any => {
  const fields = getFieldsByRole(schema, role);
  if (fields.length === 0) return null;
  
  // Get the first field with this role
  const fieldName = fields[0].name;
  const value = data[fieldName];
  
  // Return the object if it exists and is not an array
  if (value !== undefined && value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  
  return null;
};

