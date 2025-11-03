'use client';

import React from 'react';
import { Modal, SchemaFormWrapper } from '@/gradian-ui';
import { useFormModal, UseFormModalOptions, FormModalMode } from '../hooks/use-form-modal';
import { Spinner } from '@/components/ui/spinner';

export interface FormModalProps extends UseFormModalOptions {
  /**
   * Schema ID for the form
   */
  schemaId?: string;
  
  /**
   * Entity ID (required for edit mode)
   */
  entityId?: string;
  
  /**
   * Form mode: 'create' or 'edit'
   * @default 'create'
   */
  mode?: FormModalMode;
  
  /**
   * Modal title override
   */
  title?: string;
  
  /**
   * Modal description override
   */
  description?: string;
  
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * Show loading spinner while schema/entity loads
   */
  showLoadingSpinner?: boolean;
}

/**
 * Unified FormModal component that handles both create and edit modes
 * 
 * @example
 * ```tsx
 * // Create mode
 * <FormModal
 *   schemaId={schemaId}
 *   mode="create"
 *   enrichData={(data) => ({ ...data, referenceId: currentItem.id })}
 *   onSuccess={() => console.log('Created!')}
 * />
 * 
 * // Edit mode
 * <FormModal
 *   schemaId={schemaId}
 *   entityId={entity.id}
 *   mode="edit"
 *   enrichData={(data, id) => ({ ...data, updatedAt: new Date() })}
 *   onSuccess={() => console.log('Updated!')}
 * />
 * ```
 */
export const FormModal: React.FC<FormModalProps> = ({
  schemaId,
  entityId,
  mode = 'create',
  title,
  description,
  size = 'xl',
  showLoadingSpinner = true,
  enrichData,
  onSuccess,
  onClose,
}) => {
  const {
    targetSchema,
    entityData,
    mode: currentMode,
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
  } = useFormModal({
    enrichData,
    onSuccess,
    onClose,
  });

  // Track the last opened combination to prevent duplicate opens
  const lastOpenedRef = React.useRef<{ schemaId?: string; entityId?: string; mode?: FormModalMode }>({});

  // Auto-open modal if schemaId is provided
  React.useEffect(() => {
    const shouldOpen = schemaId && (!isOpen && !targetSchema && !isLoading);
    const isNewCombination = 
      lastOpenedRef.current.schemaId !== schemaId || 
      lastOpenedRef.current.entityId !== entityId ||
      lastOpenedRef.current.mode !== mode;
    
    if (shouldOpen && isNewCombination) {
      lastOpenedRef.current = { schemaId, entityId, mode };
      
      if (mode === 'edit' && entityId) {
        openFormModal(schemaId, 'edit', entityId);
      } else {
        openFormModal(schemaId, 'create');
      }
    }
    
    // Reset when modal closes
    if (!isOpen && !targetSchema) {
      lastOpenedRef.current = {};
    }
  }, [schemaId, entityId, mode, isOpen, targetSchema, isLoading, openFormModal]);

  // Don't render if modal is not open
  if (!isOpen && !targetSchema) {
    return null;
  }

  const modalMode = currentMode || mode;
  const isEdit = modalMode === 'edit';
  
  const modalTitle = title || (isEdit 
    ? `Edit ${targetSchema?.name || 'Item'}` 
    : `Create New ${targetSchema?.name || 'Item'}`);
    
  const modalDescription = description || (isEdit
    ? `Update ${(targetSchema?.name || 'item').toLowerCase()} information`
    : `Add a new ${(targetSchema?.name || 'item').toLowerCase()} to your system`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeFormModal}
      title={modalTitle}
      description={modalDescription}
      size={size}
      showCloseButton={false}
    >
      {/* Loading indicator for schema/entity loading */}
      {isLoading && showLoadingSpinner && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <Spinner size="lg" variant="primary" />
            <span className="text-sm font-medium text-gray-600">Loading form...</span>
          </div>
        </div>
      )}

      {/* Loading indicator for form submission */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center space-y-3 bg-white p-6 rounded-xl shadow-lg border border-blue-100">
            <Spinner size="lg" variant="primary" />
            <span className="text-lg font-medium text-blue-700">
              {isEdit ? 'Updating' : 'Creating'} {targetSchema?.name?.toLowerCase() || 'item'}...
            </span>
          </div>
        </div>
      )}

      {/* Load error */}
      {loadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {loadError}
          <button
            onClick={clearLoadError}
            className="ml-2 text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      {targetSchema && !isLoading && (
        <SchemaFormWrapper
          key={isEdit && entityId ? `edit-${entityId}` : `create-${targetSchema.id}`}
          schema={targetSchema}
          onSubmit={handleSubmit}
          onReset={() => {}}
          onCancel={closeFormModal}
          initialValues={isEdit && entityData ? entityData : {}}
          error={formError}
          onErrorDismiss={clearFormError}
          disabled={isSubmitting}
        />
      )}
    </Modal>
  );
};

FormModal.displayName = 'FormModal';

