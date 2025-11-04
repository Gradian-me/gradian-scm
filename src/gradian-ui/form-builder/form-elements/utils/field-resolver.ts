import { FormSchema as BuilderFormSchema, FormField as BuilderFormField } from '@/gradian-ui/schema-manager/types/form-schema';
import { FormSchema, FormField } from '@/gradian-ui/schema-manager/types/form-schema';

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
 * For picker fields, attempts to resolve the ID to a label from the target schema
 */
export const getValueByRole = (schema: FormSchema, data: any, role: string): string => {
  const fields = getFieldsByRole(schema, role);
  if (fields.length === 0) return '';
  
  const values = fields
    .map(field => {
      const rawValue = data[field.name];
      
      // Handle picker fields - try to resolve ID to label
      if (field.type === 'picker' && field.targetSchema && rawValue) {
        // If the value is {id, label} format, use the label
        if (typeof rawValue === 'object' && rawValue !== null && rawValue.id && rawValue.label) {
          return rawValue.label;
        }
        
        // If the value is already an object with resolved data, use it
        if (typeof rawValue === 'object' && rawValue !== null) {
          // Check if it has a resolved label (e.g., from API response)
          if (rawValue._resolvedLabel) {
            return rawValue._resolvedLabel;
          }
          // Try to get name or title from the object
          if (rawValue.name) return rawValue.name;
          if (rawValue.title) return rawValue.title;
          // If it has an id, it might be a partial object
          if (rawValue.id) return rawValue.id;
        }
        
        // If the value is a string ID, check for resolved data
        if (typeof rawValue === 'string') {
          // Check if there's a resolved field (e.g., vendorId -> _vendorId_resolved)
          const resolvedKey = `_${field.name}_resolved`;
          const resolvedData = data[resolvedKey];
          if (resolvedData) {
            // Try to get title role from resolved data
            if (resolvedData.name) return resolvedData.name;
            if (resolvedData.title) return resolvedData.title;
            // Fallback to the raw value if we can't resolve
            return rawValue;
          }
          
          // If no resolved data available, return the ID (will need to be resolved elsewhere)
          // This is a fallback - ideally resolved data should be provided
          return rawValue;
        }
        
        return rawValue;
      }
      
      // For non-picker fields, return value as-is
      return rawValue;
    })
    .filter(val => val !== undefined && val !== null && val !== '');
  
  return values.join(' | ');
};

/**
 * Get single value by role (for backwards compatibility)
 * For picker fields, attempts to resolve the ID to a label from the target schema
 */
export const getSingleValueByRole = (schema: FormSchema, data: any, role: string, defaultValue: string = ''): string => {
  const fields = getFieldsByRole(schema, role);
  if (fields.length === 0) return defaultValue;
  
  const field = fields[0];
  const rawValue = data[field.name];
  
  if (rawValue === undefined || rawValue === null) {
    return defaultValue;
  }
  
  // Handle picker fields - try to resolve ID to label
  if (field.type === 'picker' && field.targetSchema && rawValue) {
    // If the value is {id, label} format, use the label
    if (typeof rawValue === 'object' && rawValue !== null && rawValue.id && rawValue.label) {
      return rawValue.label;
    }
    
    // If the value is already an object with resolved data, use it
    if (typeof rawValue === 'object' && rawValue !== null) {
      // Check if it has a resolved label (e.g., from API response)
      if (rawValue._resolvedLabel) {
        return rawValue._resolvedLabel;
      }
      // Try to get name or title from the object
      if (rawValue.name) return rawValue.name;
      if (rawValue.title) return rawValue.title;
      // If it has an id, it might be a partial object
      if (rawValue.id) return rawValue.id;
    }
    
    // If the value is a string ID, check for resolved data
    if (typeof rawValue === 'string') {
      // Check if there's a resolved field (e.g., vendorId -> _vendorId_resolved)
      const resolvedKey = `_${field.name}_resolved`;
      const resolvedData = data[resolvedKey];
      if (resolvedData) {
        // Try to get title role from resolved data's schema
        // First try to get name or title directly
        if (resolvedData.name) return resolvedData.name;
        if (resolvedData.title) return resolvedData.title;
        // Fallback to the raw value if we can't resolve
        return rawValue;
      }
      
      // If no resolved data available, return the ID (will need to be resolved elsewhere)
      // This is a fallback - ideally resolved data should be provided
      return rawValue;
    }
    
    return rawValue;
  }
  
  // For non-picker fields, return value as-is
  return rawValue !== undefined && rawValue !== null ? rawValue : defaultValue;
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

