'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Loader2,
  Link2,
  Palette,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RelationType } from '@/gradian-ui/relation-manager/types';
import { ConfirmationMessage } from '@/gradian-ui/form-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconInput } from '@/components/ui/icon-input';
import { IconRenderer } from '@/shared/utils/icon-renderer';
import { ColorPicker } from '@/gradian-ui/form-builder/form-elements';
import { FormAlert } from '@/components/ui/form-alert';

interface RelationTypeCardProps {
  relationType: RelationType;
  onEdit: () => void;
  onDelete: () => void;
}

function RelationTypeCard({ relationType, onEdit, onDelete }: RelationTypeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 h-full flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{relationType.label}</CardTitle>
              <div className="flex items-start gap-2 mb-2 flex-col">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: relationType.color,
                    color: relationType.color
                  }}
                >
                  {relationType.id}
                </Badge>
                {relationType.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {relationType.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8"
                title="Edit Relation Type"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Relation Type"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: relationType.color }}
            >
              <IconRenderer iconName={relationType.icon} className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {relationType.color}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RelationTypesBuilderPage() {
  const router = useRouter();
  const [relationTypes, setRelationTypes] = useState<RelationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; relationType: RelationType | null }>({ open: false, relationType: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; relationType: RelationType | null }>({ open: false, relationType: null });
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [newRelationType, setNewRelationType] = useState({
    id: '',
    label: '',
    description: '',
    color: '#4E79A7',
    icon: ''
  });

  useEffect(() => {
    fetchRelationTypes();
  }, []);

  const fetchRelationTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/relation-types', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setRelationTypes(result.data);
      } else {
        console.error('Failed to fetch relation types:', result.error);
      }
    } catch (error) {
      console.error('Error fetching relation types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.relationType) return;

    try {
      const response = await fetch(`/api/relation-types/${deleteDialog.relationType.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setRelationTypes(relationTypes.filter(rt => rt.id !== deleteDialog.relationType!.id));
        setDeleteDialog({ open: false, relationType: null });
        setAlert({ type: 'success', message: 'Relation type deleted successfully' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        console.error('Failed to delete relation type:', result.error);
        setAlert({ type: 'error', message: result.error || 'Failed to delete relation type' });
        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error deleting relation type:', error);
      setAlert({ type: 'error', message: 'Error deleting relation type' });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleCreate = async () => {
    if (!newRelationType.id || !newRelationType.label || !newRelationType.icon) {
      setFormAlert({ type: 'warning', message: 'Please provide ID, label, and icon' });
      setTimeout(() => setFormAlert(null), 4000);
      return;
    }

    try {
      const response = await fetch('/api/relation-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRelationType),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list and close modal
        await fetchRelationTypes();
        setCreateDialog(false);
        setFormAlert(null);
        setNewRelationType({
          id: '',
          label: '',
          description: '',
          color: '#4E79A7',
          icon: ''
        });
        setAlert({ type: 'success', message: 'Relation type created successfully' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        console.error('Failed to create relation type:', result.error);
        setFormAlert({ type: 'error', message: result.error || 'Failed to create relation type' });
        setTimeout(() => setFormAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error creating relation type:', error);
      setFormAlert({ type: 'error', message: 'Error creating relation type' });
      setTimeout(() => setFormAlert(null), 5000);
    }
  };

  const handleEdit = async () => {
    if (!editDialog.relationType) return;

    if (!editDialog.relationType.id || !editDialog.relationType.label || !editDialog.relationType.icon) {
      setFormAlert({ type: 'warning', message: 'Please provide ID, label, and icon' });
      setTimeout(() => setFormAlert(null), 4000);
      return;
    }

    try {
      const response = await fetch(`/api/relation-types/${editDialog.relationType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editDialog.relationType),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list and close modal
        await fetchRelationTypes();
        setEditDialog({ open: false, relationType: null });
        setFormAlert(null);
        setAlert({ type: 'success', message: 'Relation type updated successfully' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        console.error('Failed to update relation type:', result.error);
        setFormAlert({ type: 'error', message: result.error || 'Failed to update relation type' });
        setTimeout(() => setFormAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error updating relation type:', error);
      setFormAlert({ type: 'error', message: 'Error updating relation type' });
      setTimeout(() => setFormAlert(null), 5000);
    }
  };

  const filteredRelationTypes = relationTypes.filter(relationType =>
    relationType.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    relationType.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    relationType.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout
      title="Relation Types Builder"
      subtitle="Create and manage relation types"
      showCreateButton
      createButtonText="New Relation Type"
      onCreateClick={() => setCreateDialog(true)}
    >
      <div className="space-y-6">
        {/* Alert */}
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FormAlert
              type={alert.type}
              message={alert.message}
              dismissible
              onDismiss={() => setAlert(null)}
            />
          </motion.div>
        )}

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/builder')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builder
        </Button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search relation types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : filteredRelationTypes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Link2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No relation types found' : 'No relation types yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first relation type'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Relation Type
              </Button>
            )}
          </motion.div>
        ) : (
          /* Relation Types Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRelationTypes.map((relationType) => (
              <RelationTypeCard
                key={relationType.id}
                relationType={relationType}
                onEdit={() => setEditDialog({ open: true, relationType: { ...relationType } })}
                onDelete={() => setDeleteDialog({ open: true, relationType })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Relation Type Dialog */}
      <Dialog open={createDialog} onOpenChange={(open) => { setCreateDialog(open); setFormAlert(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Relation Type</DialogTitle>
            <DialogDescription>
              Add a new relation type to define relationships
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formAlert && (
              <FormAlert
                type={formAlert.type}
                message={formAlert.message}
                dismissible
                onDismiss={() => setFormAlert(null)}
              />
            )}
            <div>
              <Label htmlFor="relation-type-id">ID</Label>
              <Input
                id="relation-type-id"
                placeholder="e.g., HAS_INQUIRY_ITEM"
                value={newRelationType.id}
                onChange={(e) => setNewRelationType({ ...newRelationType, id: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="relation-type-label">Label</Label>
              <Input
                id="relation-type-label"
                placeholder="e.g., Has Inquiry Item"
                value={newRelationType.label}
                onChange={(e) => setNewRelationType({ ...newRelationType, label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="relation-type-description">Description</Label>
              <Input
                id="relation-type-description"
                placeholder="e.g., An inquiry contains one or more inquiry items."
                value={newRelationType.description}
                onChange={(e) => setNewRelationType({ ...newRelationType, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relation-type-color">Color</Label>
                <ColorPicker
                  id="relation-type-color"
                  value={newRelationType.color}
                  onChange={(e) => setNewRelationType({ ...newRelationType, color: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="relation-type-icon">Icon</Label>
                <IconInput
                  id="relation-type-icon"
                  value={newRelationType.icon}
                  onChange={(e) => setNewRelationType({ ...newRelationType, icon: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Relation Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Relation Type Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => { setEditDialog({ open, relationType: editDialog.relationType }); setFormAlert(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Relation Type</DialogTitle>
            <DialogDescription>
              Update relation type details
            </DialogDescription>
          </DialogHeader>
          {editDialog.relationType && (
            <div className="space-y-4 py-4">
              {formAlert && (
                <FormAlert
                  type={formAlert.type}
                  message={formAlert.message}
                  dismissible
                  onDismiss={() => setFormAlert(null)}
                />
              )}
              <div>
                <Label htmlFor="edit-relation-type-id">ID</Label>
                <Input
                  id="edit-relation-type-id"
                  placeholder="e.g., HAS_INQUIRY_ITEM"
                  value={editDialog.relationType.id}
                  onChange={(e) => setEditDialog({ ...editDialog, relationType: { ...editDialog.relationType!, id: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="edit-relation-type-label">Label</Label>
                <Input
                  id="edit-relation-type-label"
                  placeholder="e.g., Has Inquiry Item"
                  value={editDialog.relationType.label}
                  onChange={(e) => setEditDialog({ ...editDialog, relationType: { ...editDialog.relationType!, label: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="edit-relation-type-description">Description</Label>
                <Input
                  id="edit-relation-type-description"
                  placeholder="e.g., An inquiry contains one or more inquiry items."
                  value={editDialog.relationType.description}
                  onChange={(e) => setEditDialog({ ...editDialog, relationType: { ...editDialog.relationType!, description: e.target.value } })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-relation-type-color">Color</Label>
                  <ColorPicker
                    id="edit-relation-type-color"
                    value={editDialog.relationType.color}
                    onChange={(e) => setEditDialog({ ...editDialog, relationType: { ...editDialog.relationType!, color: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-relation-type-icon">Icon</Label>
                  <IconInput
                    id="edit-relation-type-icon"
                    value={editDialog.relationType.icon}
                    onChange={(e) => setEditDialog({ ...editDialog, relationType: { ...editDialog.relationType!, icon: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, relationType: null })}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationMessage
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, relationType: deleteDialog.relationType })}
        title="Delete Relation Type"
        message={
          <>
            Are you sure you want to delete "{deleteDialog.relationType?.label}"? This action cannot be undone.
          </>
        }
        variant="destructive"
        buttons={[
          {
            label: 'Cancel',
            variant: 'outline',
            action: () => setDeleteDialog({ open: false, relationType: null }),
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

