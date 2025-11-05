'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  Layers,
  Type,
  Search,
  Loader2,
  ArrowLeft,
  LayoutList,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { ConfirmationMessage } from '@/gradian-ui/form-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { config } from '@/lib/config';
import { IconRenderer } from '@/shared/utils/icon-renderer';

interface SchemaCardProps {
  schema: FormSchema;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

function SchemaCard({ schema, onEdit, onDelete, onView }: SchemaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-sm transition-all duration-200 h-full flex flex-col border border-gray-200">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                {schema.icon && (
                  <IconRenderer 
                    iconName={schema.icon} 
                    className="h-5 w-5 text-violet-600 flex-shrink-0" 
                  />
                )}
                <CardTitle className="text-base font-semibold truncate">{schema.plural_name}</CardTitle>
              </div>
              {schema.description && (
                <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                  {schema.description}
                </p>
              )}
            </div>
            <div className="flex gap-0.5 ml-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onView}
                className="h-7 w-7"
                title="View List"
              >
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-7 w-7"
                title="Edit Schema"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Schema"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>{schema.sections?.length || 0} Sections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" />
              <span>{schema.fields?.length || 0} Fields</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SchemaBuilderPage() {
  const router = useRouter();
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; schema: FormSchema | null }>({ open: false, schema: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaId, setNewSchemaId] = useState('');

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await fetch(config.schemaApi.basePath);
      const result = await response.json();
      
      if (result.success) {
        setSchemas(result.data);
      } else {
        console.error('Failed to fetch schemas:', result.error);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSchemas(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.schema) return;

    try {
      const response = await fetch(`${config.schemaApi.basePath}/${deleteDialog.schema.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSchemas(schemas.filter(s => s.id !== deleteDialog.schema!.id));
        setDeleteDialog({ open: false, schema: null });
      } else {
        console.error('Failed to delete schema:', result.error);
        alert('Failed to delete schema');
      }
    } catch (error) {
      console.error('Error deleting schema:', error);
      alert('Error deleting schema');
    }
  };

  const handleCreate = async () => {
    if (!newSchemaName || !newSchemaId) {
      alert('Please provide both singular name and ID');
      return;
    }

    try {
      const newSchema: FormSchema = {
        id: newSchemaId,
        description: `Schema for ${newSchemaName}`,
        singular_name: newSchemaName,
        plural_name: `${newSchemaName}s`,
        fields: [],
        sections: [],
      };

      const response = await fetch(config.schemaApi.basePath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchema),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/builder/schemas/${newSchemaId}`);
      } else {
        console.error('Failed to create schema:', result.error);
        alert(result.error || 'Failed to create schema');
      }
    } catch (error) {
      console.error('Error creating schema:', error);
      alert('Error creating schema');
    } finally {
      setCreateDialog(false);
      setNewSchemaName('');
      setNewSchemaId('');
    }
  };

  const filteredSchemas = schemas.filter(schema =>
    schema.plural_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schema.singular_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schema.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout
      title="Schema Builder"
      subtitle="Create and manage dynamic form schemas"
      showCreateButton
      createButtonText="New Schema"
      onCreateClick={() => setCreateDialog(true)}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/builder')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builder
        </Button>

        {/* Search Bar and Refresh Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search schemas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : filteredSchemas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No schemas found' : 'No schemas yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first schema'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Schema
              </Button>
            )}
          </motion.div>
        ) : (
          /* Schema Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemas.map((schema) => (
              <SchemaCard
                key={schema.id}
                schema={schema}
                onEdit={() => router.push(`/builder/schemas/${schema.id}`)}
                onView={() => router.push(`/page/${schema.id}`)}
                onDelete={() => setDeleteDialog({ open: true, schema })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Schema Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Schema</DialogTitle>
            <DialogDescription>
              Add a new schema to start building dynamic forms
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="schema-name">Singular Name</Label>
              <Input
                id="schema-name"
                placeholder="e.g., Purchase Order"
                value={newSchemaName}
                onChange={(e) => setNewSchemaName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="schema-id">Schema ID</Label>
              <Input
                id="schema-id"
                placeholder="e.g., purchase-orders"
                value={newSchemaId}
                onChange={(e) => setNewSchemaId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schema
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationMessage
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, schema: deleteDialog.schema })}
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
            action: () => setDeleteDialog({ open: false, schema: null }),
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

