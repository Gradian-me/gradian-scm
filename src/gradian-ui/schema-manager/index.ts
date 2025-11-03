// Schema Manager - Central Export
// Provides general utilities to manage any schema

export * from './types';
export * from './utils';
export * from './components';
// Exclude FIELD_TYPES and ROLES from constants to avoid conflict with utils
export { } from './constants';
export { FIELD_TYPES, ROLES } from './constants';
export { useSchemaManager, createDomainHook } from './hooks/useSchemaManager';
export { useEntity, createEntityHook, createEntityAlias } from './hooks/useEntity';
export { useSchemaBuilder } from './hooks/useSchemaBuilder';

// Re-export from schema-manager types (the single source of truth)
export type { FormSchema, FormField, FormSection } from './types/form-schema';

