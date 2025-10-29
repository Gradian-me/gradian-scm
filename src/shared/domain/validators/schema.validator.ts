// Schema Validator
// Validates data against schema definitions

import { FormSchema, FieldSchema } from '@/shared/types/form-schema';
import { ValidationError as DomainValidationError } from '../errors/domain.errors';

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Validate data against a schema
 */
export function validateAgainstSchema(
  data: Record<string, any>,
  schema: FormSchema
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Get all fields from all sections
  const allFields: FieldSchema[] = [];
  schema.sections.forEach(section => {
    allFields.push(...section.fields);
  });

  // Validate each field
  allFields.forEach(field => {
    const value = data[field.name];
    const fieldErrors = validateField(field, value);
    errors.push(...fieldErrors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single field
 */
export function validateField(
  field: FieldSchema,
  value: any
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required validation
  if (field.required || field.validation?.required) {
    if (value === undefined || value === null || value === '') {
      errors.push({
        field: field.name,
        message: `${field.label} is required`,
        code: 'REQUIRED',
      });
      return errors; // Don't continue validation if required field is empty
    }
  }

  // Skip further validation if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return errors;
  }

  // Type-specific validation
  switch (field.type) {
    case 'email':
      if (!isValidEmail(value)) {
        errors.push({
          field: field.name,
          message: `${field.label} must be a valid email address`,
          code: 'INVALID_EMAIL',
        });
      }
      break;

    case 'url':
      if (!isValidUrl(value)) {
        errors.push({
          field: field.name,
          message: `${field.label} must be a valid URL`,
          code: 'INVALID_URL',
        });
      }
      break;

    case 'tel':
    case 'phone':
      if (!isValidPhone(value)) {
        errors.push({
          field: field.name,
          message: `${field.label} must be a valid phone number`,
          code: 'INVALID_PHONE',
        });
      }
      break;

    case 'number':
      if (typeof value !== 'number' && isNaN(Number(value))) {
        errors.push({
          field: field.name,
          message: `${field.label} must be a valid number`,
          code: 'INVALID_NUMBER',
        });
      }
      break;
  }

  // Custom validation rules
  if (field.validation) {
    // Min length
    if (field.validation.minLength && value.length < field.validation.minLength) {
      errors.push({
        field: field.name,
        message: `${field.label} must be at least ${field.validation.minLength} characters`,
        code: 'MIN_LENGTH',
      });
    }

    // Max length
    if (field.validation.maxLength && value.length > field.validation.maxLength) {
      errors.push({
        field: field.name,
        message: `${field.label} must be at most ${field.validation.maxLength} characters`,
        code: 'MAX_LENGTH',
      });
    }

    // Min value (for numbers)
    if (field.validation.min !== undefined && Number(value) < field.validation.min) {
      errors.push({
        field: field.name,
        message: `${field.label} must be at least ${field.validation.min}`,
        code: 'MIN_VALUE',
      });
    }

    // Max value (for numbers)
    if (field.validation.max !== undefined && Number(value) > field.validation.max) {
      errors.push({
        field: field.name,
        message: `${field.label} must be at most ${field.validation.max}`,
        code: 'MAX_VALUE',
      });
    }

    // Pattern (RegExp stored as string)
    if (field.validation.pattern) {
      const pattern = typeof field.validation.pattern === 'string' 
        ? new RegExp(field.validation.pattern)
        : field.validation.pattern;
      
      if (!pattern.test(value)) {
        errors.push({
          field: field.name,
          message: `${field.label} format is invalid`,
          code: 'INVALID_FORMAT',
        });
      }
    }
  }

  return errors;
}

/**
 * Helper validation functions
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - can be enhanced
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Throw validation error if validation fails
 */
export function validateOrThrow(data: Record<string, any>, schema: FormSchema): void {
  const result = validateAgainstSchema(data, schema);
  
  if (!result.isValid) {
    throw new DomainValidationError(
      'Validation failed',
      result.errors.map(e => ({ field: e.field, message: e.message }))
    );
  }
}

