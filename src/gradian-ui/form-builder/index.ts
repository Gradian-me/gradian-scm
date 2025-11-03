// Form Builder Export

export * from './form-elements';
// export * from './form-wrapper'; // Deprecated - use SchemaFormWrapper instead

// Export types from form-schema, but exclude CardConfig to avoid conflict
export type {
  FormField,
  FormSection,
  CardMetadata,
  FormSchema,
  FormData,
  FormErrors,
  FormTouched,
  FormState,
  FormActions,
  FormContextType,
  FormWrapperProps,
  FormSectionProps,
  RepeatingSectionProps
} from '@/gradian-ui/schema-manager/types/form-schema';

export { FormSection as FormSectionComponent } from './components/FormSection';
export { AccordionFormSection } from './components/AccordionFormSection';
export { RepeatingSection } from './components/RepeatingSection';
export { SchemaFormWrapper } from './components/FormLifecycleManager';
export { FormDialog } from './components/FormDialog';
export { FormModal } from './components/FormModal';
export type { FormModalProps } from './components/FormModal';
export { useFormModal } from './hooks/use-form-modal';
export type { UseFormModalOptions, UseFormModalReturn, FormModalMode } from './hooks/use-form-modal';

// Re-export CardConfig from form-schema with alias to avoid conflict
export type { CardConfig as FormCardConfig } from '@/gradian-ui/schema-manager/types/form-schema';
