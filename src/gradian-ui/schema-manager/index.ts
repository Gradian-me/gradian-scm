// Schema Manager - Central Export
// Provides general utilities to manage any schema

export * from './types';
export * from './utils';
export * from './components';
export * from './constants';
export { useSchemaManager, createDomainHook } from './hooks/useSchemaManager';
export { useEntity, createEntityHook, createEntityAlias } from './hooks/useEntity';
export { useSchemaBuilder } from './hooks/useSchemaBuilder';

// Re-export from shared types (the single source of truth)
export type { FormSchema, FormField, FormSection } from '../../../shared/types/form-schema';

