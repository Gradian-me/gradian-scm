'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ArrowLeft, Plus, RefreshCw, Settings, Building2, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormAlert } from '@/components/ui/form-alert';
import { SchemaCardGrid, SchemaCardSkeletonGrid } from './SchemaCardGrid';
import { CreateSchemaDialog } from './CreateSchemaDialog';
import { ConfirmationMessage } from '@/gradian-ui/form-builder';
import { SearchInput } from '@/gradian-ui/form-builder/form-elements';
import { useSchemaManagerPage } from '../hooks/useSchemaManagerPage';
import { FormSchema } from '../types';

export function SchemaManagerWrapper() {
  const router = useRouter();
  const {
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredSchemas,
    systemSchemas,
    businessSchemas,
    handleRefresh,
    deleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleDelete,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    handleCreate,
    error,
    clearError,
  } = useSchemaManagerPage();

  const handleViewSchema = (schema: FormSchema) => router.push(`/page/${schema.id}`);
  const handleEditSchema = (schema: FormSchema) => router.push(`/builder/schemas/${schema.id}`);

  const handleCreateSchema = async (payload: Parameters<typeof handleCreate>[0]) => {
    const result = await handleCreate(payload);
    if (result.success) {
      router.push(`/builder/schemas/${payload.schemaId}`);
    }
    return result;
  };

  const emptyState = useMemo(() => {
    if (filteredSchemas.length > 0 || loading) {
      return null;
    }

    const isSearching = searchQuery.trim().length > 0;

    return (
      <div className="text-center py-20">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {isSearching ? 'No schemas found' : 'No schemas yet'}
        </h3>
        <p className="text-gray-500 mb-6">
          {isSearching ? 'Try adjusting your search query' : 'Get started by creating your first schema'}
        </p>
        {!isSearching && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Schema
          </Button>
        )}
      </div>
    );
  }, [filteredSchemas.length, loading, openCreateDialog, searchQuery]);

  return (
    <MainLayout title="Schema Builder" subtitle="Create and manage dynamic form schemas">
      <div className="space-y-6">
        {error && (
          <FormAlert
            type="error"
            message={error.message}
            statusCode={error.statusCode}
            dismissible
            onDismiss={clearError}
          />
        )}

        <div className="flex items-center justify-between gap-2 mb-2">
          <Button variant="outline" onClick={() => router.push('/builder')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Builder
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Schema
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'system' | 'business')}>
          <TabsList className="w-full">
            <TabsTrigger value="system" className="flex items-center gap-2 flex-1">
              <Settings className="h-4 w-4" />
              <span>System Schemas</span>
              <Badge variant="secondary" className="ms-1 bg-violet-200">
                {systemSchemas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2 flex-1">
              <Building2 className="h-4 w-4" />
              <span>Business Schemas</span>
              <Badge variant="secondary" className="ms-1 bg-violet-200">
                {businessSchemas.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="flex-1">
            <SearchInput
              config={{ name: 'search', placeholder: 'Search schemas...' }}
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              className="[&_input]:h-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="h-10 w-10"
            title="Refresh schemas"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <SchemaCardSkeletonGrid />
        ) : filteredSchemas.length > 0 ? (
          <SchemaCardGrid
            schemas={filteredSchemas}
            onEdit={handleEditSchema}
            onView={handleViewSchema}
            onDelete={openDeleteDialog}
          />
        ) : (
          emptyState
        )}
      </div>

      <CreateSchemaDialog
        open={createDialogOpen}
        onOpenChange={(open) => (open ? openCreateDialog() : closeCreateDialog())}
        onSubmit={handleCreateSchema}
      />

      <ConfirmationMessage
        isOpen={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        title="Delete Schema"
        message={
          <>
            Are you sure you want to delete "{deleteDialog.schema?.plural_name}"? This action cannot be undone.
          </>
        }
        variant="destructive"
        buttons={[
          {
            label: 'Cancel',
            variant: 'outline',
            action: () => closeDeleteDialog(),
          },
          {
            label: 'Delete',
            variant: 'destructive',
            icon: 'Trash2',
            action: handleDelete,
          },
        ]}
      />
    </MainLayout>
  );
}
