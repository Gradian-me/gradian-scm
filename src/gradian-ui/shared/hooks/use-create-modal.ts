// Hook for managing create modal with dynamic schema loading
// Can be used to open create modals for any schema ID

import { useState, useCallback } from 'react';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { apiRequest } from '../utils/api';
import { asFormBuilderSchema } from '@/gradian-ui/schema-manager/utils/schema-utils';
import type { FormSchema as FormBuilderSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { useCompanyStore } from '@/stores/company.store';

/**
 * Reconstruct RegExp objects from serialized schema
 */
function reconstructRegExp(obj: any): any {
  if (obj && typeof obj === 'object') {
    // Check if this is a serialized RegExp
    if (obj.__regexp === true && obj.source) {
      return new RegExp(obj.source, obj.flags || '');
    }
    
    // Recursively process arrays
    if (Array.isArray(obj)) {
      return obj.map(item => reconstructRegExp(item));
    }
    
    // Recursively process objects
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = reconstructRegExp(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

export interface UseCreateModalOptions {
  /**
   * Optional function to enrich form data before submission
   * Useful for adding reference IDs, default values, etc.
   */
  enrichData?: (formData: Record<string, any>) => Record<string, any>;
  
  /**
   * Optional callback when entity is successfully created
   */
  onSuccess?: (data: any) => void;
  
  /**
   * Optional callback when modal is closed
   */
  onClose?: () => void;
}

export interface UseCreateModalReturn {
  /**
   * Target schema for the create modal
   */
  targetSchema: FormBuilderSchema | null;
  
  /**
   * Whether the create modal is open
   */
  isOpen: boolean;
  
  /**
   * Whether form is currently submitting
   */
  isSubmitting: boolean;
  
  /**
   * Error message for the form
   */
  formError: string | null;
  
  /**
   * Error message for schema loading
   */
  loadError: string | null;
  
  /**
   * Whether schema is currently loading
   */
  isLoadingSchema: boolean;
  
  /**
   * Open the create modal with a schema ID
   */
  openCreateModal: (schemaId: string) => Promise<void>;
  
  /**
   * Close the create modal
   */
  closeCreateModal: () => void;
  
  /**
   * Handle form submission
   */
  handleSubmit: (formData: Record<string, any>) => Promise<void>;
  
  /**
   * Clear form error
   */
  clearFormError: () => void;
  
  /**
   * Clear load error
   */
  clearLoadError: () => void;
}

/**
 * Hook for managing create modal with dynamic schema loading
 * 
 * @param options - Configuration options for the hook
 * @returns Modal state and handlers
 * 
 * @example
 * ```tsx
 * const {
 *   targetSchema,
 *   isOpen,
 *   openCreateModal,
 *   closeCreateModal,
 *   handleSubmit
 * } = useCreateModal({
 *   enrichData: (data) => ({ ...data, referenceId: currentItem.id }),
 *   onSuccess: () => console.log('Created!'),
 * });
 * ```
 */
export function useCreateModal(
  options: UseCreateModalOptions = {}
): UseCreateModalReturn {
  const { enrichData, onSuccess, onClose } = options;
  const { getCompanyId } = useCompanyStore();

  const [targetSchema, setTargetSchema] = useState<FormBuilderSchema | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  /**
   * Open create modal with target schema ID
   */
  const openCreateModal = useCallback(async (schemaId: string) => {
    // Clear previous errors
    setLoadError(null);
    setFormError(null);
    setIsLoadingSchema(true);
    
    try {
      // Fetch schema using React Query (will use cache if available)
      const response = await apiRequest<FormSchema>(`/api/schemas/${schemaId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || `Schema not found: ${schemaId}`);
      }

      // Reconstruct RegExp objects
      const rawSchema = reconstructRegExp(response.data) as FormSchema;
      
      // Validate schema structure
      if (!rawSchema?.id) {
        throw new Error(`Invalid schema structure: ${schemaId}`);
      }

      // Convert to form-builder schema
      const formBuilderSchema = asFormBuilderSchema(rawSchema);

      // Final validation
      if (!formBuilderSchema?.id || !formBuilderSchema?.name) {
        throw new Error('Schema conversion failed: missing required fields');
      }

      // Set schema and open modal
      setTargetSchema(formBuilderSchema);
      setIsOpen(true);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load form';
      console.error('Error opening create modal:', err);
      setLoadError(errorMsg);
    } finally {
      setIsLoadingSchema(false);
    }
  }, []);

  /**
   * Close create modal
   */
  const closeCreateModal = useCallback(() => {
    setIsOpen(false);
    setTargetSchema(null);
    setFormError(null);
    onClose?.();
  }, [onClose]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (formData: Record<string, any>) => {
    if (!targetSchema) {
      console.error('No target schema available for submission');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    
    try {
      // Enrich data if provided
      let enrichedData = enrichData ? enrichData(formData) : formData;

      // Automatically add companyId from store if not already present and schema is company-based
      if (!targetSchema.isNotCompanyBased && !enrichedData.companyId) {
        const companyId = getCompanyId();
        if (companyId !== null && companyId !== -1) {
          enrichedData = {
            ...enrichedData,
            companyId: String(companyId),
          };
        }
      }

      // Create entity using API
      const apiEndpoint = `/api/data/${targetSchema.id}`;
      const result = await apiRequest(apiEndpoint, {
        method: 'POST',
        body: enrichedData,
      });

      if (result.success) {
        closeCreateModal();
        onSuccess?.(result.data);
      } else {
        console.error(`Failed to create ${targetSchema.name}:`, result.error);
        setFormError(result.error || `Failed to create ${targetSchema.name}. Please try again.`);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error(`Error creating ${targetSchema.name}:`, error);
      setFormError(error instanceof Error ? error.message : `Failed to create ${targetSchema.name}. Please try again.`);
      setIsSubmitting(false);
    }
  }, [targetSchema, enrichData, closeCreateModal, onSuccess, getCompanyId]);

  const clearFormError = useCallback(() => {
    setFormError(null);
  }, []);

  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  return {
    targetSchema,
    isOpen,
    isSubmitting,
    formError,
    loadError,
    isLoadingSchema,
    openCreateModal,
    closeCreateModal,
    handleSubmit,
    clearFormError,
    clearLoadError,
  };
}

