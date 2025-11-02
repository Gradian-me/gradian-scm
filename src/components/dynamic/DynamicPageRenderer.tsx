'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  Plus,
  Star
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../layout/main-layout';
import { Spinner } from '../ui/spinner';
import { Button, DynamicCardRenderer, DynamicCardDialog, EmptyState, LoadingState, Modal, SchemaFormWrapper, GoToTop } from '../../gradian-ui';
import { FormSchema } from '../../shared/types/form-schema';
import { DynamicFilterPane } from '../../shared/components/DynamicFilterPane';
import { asFormSchema, asFormBuilderSchema } from '../../shared/utils/schema-utils';
import { useDynamicEntity } from '../../shared/hooks';

interface DynamicPageRendererProps {
  schema: FormSchema;
  entityName: string;
}

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

export function DynamicPageRenderer({ schema: rawSchema, entityName }: DynamicPageRendererProps) {
  const router = useRouter();
  // Reconstruct RegExp objects in the schema
  const schema = reconstructRegExp(rawSchema) as FormSchema;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEntityForDetail, setSelectedEntityForDetail] = useState<any | null>(null);
  const [searchTermLocal, setSearchTermLocal] = useState('');

  // Use the dynamic entity hook
  const {
    entities,
    currentEntity,
    isLoading,
    error,
    selectedEntity,
    isCreateModalOpen,
    isEditModalOpen,
    isModalOpen,
    modalTitle,
    currentFilters,
    formState,
    fetchEntities,
    fetchEntityById,
    createEntity,
    updateEntity,
    deleteEntity,
    setFilters,
    setCurrentEntity,
    clearError,
    handleSearch,
    handleFilterChange,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    handleEditEntity: defaultHandleEditEntity,
    handleDeleteEntity,
  } = useDynamicEntity(schema);

  // Custom handleViewEntity that opens the detail dialog (card click)
  const handleViewEntity = useCallback((entity: any) => {
    setSelectedEntityForDetail(entity);
    setIsDetailDialogOpen(true);
  }, []);

  // Navigate to detail page (view button click)
  const handleViewDetailPage = useCallback((entity: any) => {
    if (entity?.id && schema?.id) {
      router.push(`/page/${schema.id}/${entity.id}`);
    }
  }, [router, schema?.id]);

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    // Only fetch if we have actual filter changes from the UI
    const hasActiveFilters = currentFilters.search || currentFilters.status || currentFilters.category;
    
    if (hasActiveFilters && Object.keys(currentFilters).length > 0) {
      const filters = {
        search: currentFilters.search,
        status: currentFilters.status,
        category: currentFilters.category,
      };
      
      setFilters(filters);
      
      // Only fetch if we have search/filter criteria from user input
      if (filters.search || filters.status || filters.category) {
        fetchEntities(filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters.search, currentFilters.status, currentFilters.category]);

  const handleCreateEntity = async (data: any) => {
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      // Email validation function
      const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      // Validate primary email if exists
      if (data.email && !isValidEmail(data.email)) {
        setFormError(`Invalid email format: ${data.email}`);
        setIsSubmitting(false);
        return;
      }

      // Validate emails in contacts if exists
      if (data.contacts && Array.isArray(data.contacts)) {
        for (const contact of data.contacts) {
          if (contact.email && !isValidEmail(contact.email)) {
            setFormError(`Invalid email format: ${contact.email}`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Transform form data to match the expected schema
      const transformedData = {
        ...data,
        categories: data.categories || ['general'],
        contacts: data.contacts ? data.contacts.map((contact: any) => ({
          ...contact,
          isPrimary: contact.isPrimary === true || contact.isPrimary === "true" ? true : false,
          email: contact.email ? contact.email.trim() : contact.email,
          department: contact.department || "",
          notes: contact.notes || ""
        })) : data.email ? [{
          name: data.primaryContactName || data.name,
          email: data.primaryContactEmail || data.email,
          phone: data.primaryContactPhone || data.phone,
          position: data.primaryContactPosition || 'Primary Contact',
          isPrimary: true,
        }] : [],
        status: data.status || 'ACTIVE',
        rating: data.rating ? Number(data.rating) : 5,
      };
      
      const result = await createEntity(transformedData);
      if (result.success) {
        closeCreateModal();
      } else {
        console.error(`Failed to create ${entityName}:`, result.error);
        setFormError(result.error || `Failed to create ${entityName}. Please try again.`);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error);
      setFormError(error instanceof Error ? error.message : `Failed to create ${entityName}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  // Custom handleEditEntity that fetches fresh data
  const handleEditEntity = async (entity: any) => {
    try {
      setIsEditLoading(prev => ({ ...prev, [entity.id]: true }));
      
      // Fetch the latest data from API
      const freshEntity = await fetchEntityById(entity.id);
      
      if (freshEntity) {
        setCurrentEntity(freshEntity);
        setIsEditLoading(prev => ({ ...prev, [entity.id]: false }));
        openEditModal(freshEntity);
      } else {
        setIsEditLoading(prev => ({ ...prev, [entity.id]: false }));
        setCurrentEntity(entity);
        openEditModal(entity);
      }
    } catch (error) {
      console.error('Failed to fetch entity data:', error);
      setIsEditLoading(prev => ({ ...prev, [entity.id]: false }));
      setCurrentEntity(entity);
      openEditModal(entity);
    }
  };

  const handleUpdateEntity = async (data: any) => {
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      if (!selectedEntity?.id) {
        console.error(`No ${entityName} selected for update`);
        setIsSubmitting(false);
        return;
      }

      // Email validation function
      const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      // Validate primary email if exists
      if (data.email && !isValidEmail(data.email)) {
        setFormError(`Invalid email format: ${data.email}`);
        setIsSubmitting(false);
        return;
      }

      // Validate emails in contacts if exists
      if (data.contacts && Array.isArray(data.contacts)) {
        for (const contact of data.contacts) {
          if (contact.email && !isValidEmail(contact.email)) {
            setFormError(`Invalid email format: ${contact.email}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Clean up emails before submission
      if (data.email) {
        data.email = data.email.trim();
      }

      // Transform form data to match the expected schema
      const transformedData = {
        ...data,
        categories: data.categories || ['general'],
        contacts: data.contacts ? data.contacts.map((contact: any) => ({
          ...contact,
          isPrimary: contact.isPrimary === true || contact.isPrimary === "true" ? true : false,
          email: contact.email ? contact.email.trim() : contact.email,
          department: contact.department || "",
          notes: contact.notes || ""
        })) : data.email ? [{
          name: data.primaryContactName || data.name,
          email: data.primaryContactEmail || data.email,
          phone: data.primaryContactPhone || data.phone,
          position: data.primaryContactPosition || 'Primary Contact',
          isPrimary: true,
        }] : [],
        status: data.status || 'ACTIVE',
        rating: data.rating ? Number(data.rating) : 5,
      };
      
      const result = await updateEntity(selectedEntity.id, transformedData);
      
      if (result.success) {
        closeEditModal();
      } else {
        console.error(`Failed to update ${entityName}:`, result.error);
        setFormError(result.error || `Failed to update ${entityName}. Please try again.`);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error);
      setFormError(error instanceof Error ? error.message : `Failed to update ${entityName}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const filteredEntities = useMemo(() => {
    if (!entities) return [];
    
    // If no search term, return all entities
    if (!searchTermLocal || searchTermLocal.trim() === '') {
      return entities;
    }
    
    const searchLower = searchTermLocal.toLowerCase();
    
    return entities.filter((entity: any) => {
      // Search across common text fields dynamically
      const searchableFields = [
        'name', 'title', 'email', 'phone', 'description',
        'productName', 'requestId', 'batchNumber', 'productSku',
        'companyName', 'tenderTitle', 'projectName'
      ];
      
      return searchableFields.some(field => {
        const value = entity[field];
        if (value && typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }, [entities, searchTermLocal]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'INACTIVE': return <AlertCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  }, []);

  const getRatingStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  }, []);

  const pluralName = schema.plural_name || 'Entities';
  const singularName = schema.singular_name || 'Entity';

  if (isLoading) {
    return (
      <MainLayout 
        title={pluralName}
        icon={schema.icon}
      >
        <LoadingState size="lg" text={`Loading ${pluralName.toLowerCase()}...`} />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={pluralName}
      icon={schema.icon}
    >
      {/* Individual entity loading indicator */}
      <div 
        id="entity-loading-indicator" 
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md z-50"
        style={{ display: 'none' }}
      >
        Loading {entityName.toLowerCase()} data...
      </div>
      <div className="space-y-6">
        {/* Search and Filters */}
        <DynamicFilterPane
          searchTerm={searchTermLocal}
          onSearchChange={setSearchTermLocal}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddNew={openCreateModal}
          searchPlaceholder={`Search ${pluralName.toLowerCase()}...`}
          addButtonText={`Add ${singularName}`}
        />

        {/* Entities List */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4" : "space-y-4"}>
          {filteredEntities.map((entity: any, index: number) => (
            <div key={entity.id} className="relative">
              {isEditLoading[entity.id] && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center space-y-2">
                    <Spinner size="lg" variant="primary" />
                    <span className="text-sm font-medium text-violet-600">Loading...</span>
                  </div>
                </div>
              )}
              <DynamicCardRenderer
                key={entity.id}
                schema={asFormSchema(schema)}
                data={entity}
                index={index}
                viewMode={viewMode}
                maxBadges={3}
                maxMetrics={5}
                onView={handleViewEntity}
                onViewDetail={handleViewDetailPage}
                onEdit={(e) => {
                  if (!isEditLoading[e.id]) {
                    handleEditEntity(e);
                  }
                }}
                onDelete={handleDeleteEntity}
                className={isEditLoading[entity.id] ? "opacity-70" : ""}
              />
            </div>
          ))}
        </div>

        {filteredEntities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              icon={<Building className="h-12 w-12 text-gray-400" />}
              title={`No ${pluralName.toLowerCase()} found`}
              description={
                searchTermLocal
                  ? 'Try adjusting your search criteria.'
                  : `Get started by adding your first ${singularName.toLowerCase()}.`
              }
              action={
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {singularName}
                </Button>
              }
            />
          </motion.div>
        )}
      </div>

      {/* Detail Dialog */}
      <DynamicCardDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        schema={asFormSchema(schema)}
        data={selectedEntityForDetail}
        title={selectedEntityForDetail?.name || `${singularName} Details`}
        onView={handleViewEntity}
        onViewDetail={handleViewDetailPage}
        onEdit={handleEditEntity}
        onDelete={handleDeleteEntity}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={isCreateModalOpen ? closeCreateModal : closeEditModal}
        title={modalTitle}
        description={isCreateModalOpen ? `Add a new ${singularName.toLowerCase()} to your system` : `Edit ${singularName.toLowerCase()} information`}
        size="xl"
        showCloseButton={false}
      >
        {/* Loading indicator for form submission */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center space-y-3 bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <Spinner size="lg" variant="primary" />
              <span className="text-lg font-medium text-blue-700">
                {isCreateModalOpen ? `Creating ${entityName.toLowerCase()}...` : `Updating ${entityName.toLowerCase()}...`}
              </span>
            </div>
          </div>
        )}
        <SchemaFormWrapper
          key={isCreateModalOpen ? 'create' : `edit-${currentEntity?.id || 'none'}`}
          schema={asFormBuilderSchema(schema)}
          onSubmit={isCreateModalOpen ? handleCreateEntity : handleUpdateEntity}
          onReset={() => formState.reset()}
          initialValues={isCreateModalOpen ? formState.values : currentEntity || formState.values}
          error={formError}
          onErrorDismiss={() => setFormError(null)}
          disabled={isSubmitting}
        />
      </Modal>
      
      {/* Go to Top Button */}
      <GoToTop threshold={100} />
    </MainLayout>
  );
}

