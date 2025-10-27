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
} from './types/form-schema';

export { FormSection as FormSectionComponent } from './components/FormSection';
export { AccordionFormSection } from './components/AccordionFormSection';
export { RepeatingSection } from './components/RepeatingSection';
export { SchemaFormWrapper } from './components/FormLifecycleManager';
export { FormDialog } from './components/FormDialog';

// Re-export CardConfig from form-schema with alias to avoid conflict
export type { CardConfig as FormCardConfig } from './types/form-schema';
