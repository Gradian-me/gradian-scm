// Schema Manager - Central Export
// Provides general utilities to manage any schema

export * from './types';
export * from './utils';
export { useSchemaManager, createDomainHook } from './hooks/useSchemaManager';
export { useEntity, createEntityHook, createEntityAlias } from './hooks/useEntity';

// Re-export from form-builder for convenience
export type { FormSchema, FormField, FormSection } from '../form-builder/types/form-schema';

