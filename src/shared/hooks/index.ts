// Shared hooks index
export { useHydration } from './use-hydration';
export { useDynamicEntity } from './use-dynamic-entity';

// Re-export form modal from gradian-ui/form-builder for convenience
export { useFormModal } from '../../gradian-ui/form-builder';
export type { UseFormModalOptions, UseFormModalReturn, FormModalMode } from '../../gradian-ui/form-builder';

// Backward compatibility - re-export old hooks (deprecated, use useFormModal from gradian-ui/form-builder instead)
export { useCreateModal } from './use-create-modal';
export type { UseCreateModalOptions, UseCreateModalReturn } from './use-create-modal';
export { useEditModal } from './use-edit-modal';
export type { UseEditModalOptions, UseEditModalReturn } from './use-edit-modal';

