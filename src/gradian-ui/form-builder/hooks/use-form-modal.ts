// Unified hook for managing form modals (create and edit) with dynamic schema loading
// Can be used to open create or edit modals for any schema ID

import { useState, useCallback } from 'react';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { apiRequest } from '../../../shared/utils/api';
import { config } from '@/lib/config';
import { asFormBuilderSchema } from '@/gradian-ui/schema-manager/utils/schema-utils';
import type { FormSchema as FormBuilderSchema } from '@/gradian-ui/schema-manager/types/form-schema';

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

export type FormModalMode = 'create' | 'edit';

export interface UseFormModalOptions {
  /**
   * Optional function to enrich form data before submission
   * For create mode: (formData) => enrichedData
   * For edit mode: (formData, entityId) => enrichedData
   */
  enrichData?: (formData: Record<string, any>, entityId?: string) => Record<string, any>;
  
  /**
   * Optional callback when entity is successfully created/updated
   */
  onSuccess?: (data: any) => void;
  
  /**
   * Optional callback when modal is closed
   */
  onClose?: () => void;
}

export interface UseFormModalReturn {
  /**
   * Target schema for the form modal
   */
  targetSchema: FormBuilderSchema | null;
  
  /**
   * Current entity data (only for edit mode, pre-populated)
   */
  entityData: any | null;
  
  /**
   * Entity ID being edited (only for edit mode)
   */
  entityId: string | null;
  
  /**
   * Current mode: 'create' or 'edit'
   */
  mode: FormModalMode | null;
  
  /**
   * Whether the form modal is open
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
   * Error message for schema/entity loading
   */
  loadError: string | null;
  
  /**
   * Whether schema/entity is currently loading
   */
  isLoading: boolean;
  
  /**
   * Open the form modal
   * @param schemaId - Schema ID for the form
   * @param modalMode - 'create' (default) or 'edit'
   * @param editEntityId - Entity ID (required for edit mode)
   */
  openFormModal: (schemaId: string, modalMode?: FormModalMode, editEntityId?: string) => Promise<void>;
  
  /**
   * Close the form modal
   */
  closeFormModal: () => void;
  
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
 * Unified hook for managing form modals (create and edit) with dynamic schema loading
 * 
 * @param options - Configuration options for the hook
 * @returns Modal state and handlers
 * 
 * @example
 * ```tsx
 * // Create mode
 * const { openFormModal } = useFormModal({
 *   enrichData: (data) => ({ ...data, referenceId: currentItem.id }),
 *   onSuccess: () => console.log('Created!'),
 * });
 * await openFormModal(schemaId);
 * 
 * // Edit mode
 * const { openFormModal } = useFormModal({
 *   enrichData: (data, id) => ({ ...data, updatedAt: new Date() }),
 *   onSuccess: () => console.log('Updated!'),
 * });
 * await openFormModal(schemaId, 'edit', entityId);
 * ```
 */
export function useFormModal(
  options: UseFormModalOptions = {}
): UseFormModalReturn {
  const { enrichData, onSuccess, onClose } = options;

  const [targetSchema, setTargetSchema] = useState<FormBuilderSchema | null>(null);
  const [entityData, setEntityData] = useState<any | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [mode, setMode] = useState<FormModalMode | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Open form modal - unified function that handles both create and edit modes
   */
  const openFormModal = useCallback(async (
    schemaId: string,
    modalMode: FormModalMode | undefined = 'create',
    editEntityId?: string
  ) => {
    // Clear previous errors
    setLoadError(null);
    setFormError(null);
    setIsLoading(true);
    
    try {
      // Fetch schema
      const response = await fetch(`${config.schemaApi.basePath}/${schemaId}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${schemaId}`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(`Schema not found: ${schemaId}`);
      }

      // Reconstruct RegExp objects
      const rawSchema = reconstructRegExp(result.data) as FormSchema;
      
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

      // For edit mode, fetch entity data
      if (modalMode === 'edit' && editEntityId) {
        const apiEndpoint = `/api/data/${schemaId}/${editEntityId}`;
        const entityResult = await apiRequest(apiEndpoint, {
          method: 'GET',
        });

        if (!entityResult.success || !entityResult.data) {
          throw new Error(`Entity not found: ${editEntityId}`);
        }

        setEntityData(entityResult.data);
        setEntityId(editEntityId);
      } else {
        // Create mode - clear entity data
        setEntityData(null);
        setEntityId(null);
      }

      // Set schema, mode, and open modal
      setTargetSchema(formBuilderSchema);
      setMode(modalMode);
      setIsOpen(true);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load form';
      console.error(`Error opening ${modalMode} modal:`, err);
      setLoadError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Close form modal
   */
  const closeFormModal = useCallback(() => {
    setIsOpen(false);
    setTargetSchema(null);
    setEntityData(null);
    setEntityId(null);
    setMode(null);
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

    if (mode === 'edit' && !entityId) {
      console.error('No entity ID available for edit submission');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    
    try {
      // Enrich data if provided (pass entityId for edit mode)
      const enrichedData = enrichData 
        ? enrichData(formData, mode === 'edit' ? entityId || undefined : undefined)
        : formData;

      // Determine API endpoint and method based on mode
      const apiEndpoint = mode === 'edit' && entityId
        ? `/api/data/${targetSchema.id}/${entityId}`
        : `/api/data/${targetSchema.id}`;
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const result = await apiRequest(apiEndpoint, {
        method,
        body: enrichedData,
      });

      if (result.success) {
        closeFormModal();
        onSuccess?.(result.data);
      } else {
        const action = mode === 'edit' ? 'update' : 'create';
        console.error(`Failed to ${action} ${targetSchema.name}:`, result.error);
        setFormError(result.error || `Failed to ${action} ${targetSchema.name}. Please try again.`);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      const action = mode === 'edit' ? 'update' : 'create';
      console.error(`Error ${action}ing ${targetSchema.name}:`, error);
      setFormError(error instanceof Error ? error.message : `Failed to ${action} ${targetSchema.name}. Please try again.`);
      setIsSubmitting(false);
    }
  }, [targetSchema, mode, entityId, enrichData, closeFormModal, onSuccess]);

  const clearFormError = useCallback(() => {
    setFormError(null);
  }, []);

  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  return {
    targetSchema,
    entityData,
    entityId,
    mode,
    isOpen,
    isSubmitting,
    formError,
    loadError,
    isLoading,
    openFormModal,
    closeFormModal,
    handleSubmit,
    clearFormError,
    clearLoadError,
  };
}

