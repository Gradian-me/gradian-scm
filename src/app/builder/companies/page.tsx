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
  Building2,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmationMessage } from '@/gradian-ui/form-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormAlert } from '@/components/ui/form-alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Company {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  country?: string;
  city?: string;
  zipCode?: string;
  registrationCode?: string;
  nationalId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
}

function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
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
              <div className="flex items-center gap-3 mb-2">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-violet-600" />
                  </div>
                )}
                <CardTitle className="text-xl">{company.name}</CardTitle>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {company.address && (
                  <p className="line-clamp-1">{company.address}</p>
                )}
                {(company.city || company.country) && (
                  <p>
                    {[company.city, company.country].filter(Boolean).join(', ')}
                    {company.zipCode && ` ${company.zipCode}`}
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
                title="Edit Company"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Company"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {company.registrationCode && (
              <div>
                <span className="text-gray-500">Registration:</span>
                <p className="font-medium">{company.registrationCode}</p>
              </div>
            )}
            {company.nationalId && (
              <div>
                <span className="text-gray-500">National ID:</span>
                <p className="font-medium">{company.nationalId}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CompaniesBuilderPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; company: Company | null }>({ open: false, company: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; company: Company | null }>({ open: false, company: null });
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: '',
    logo: '',
    address: '',
    country: '',
    city: '',
    zipCode: '',
    registrationCode: '',
    nationalId: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Add timestamp to bust cache
      const response = await fetch(`/api/companies?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setCompanies(result.data || []);
      } else {
        console.error('Failed to fetch companies:', result.error);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.company) return;

    try {
      const response = await fetch(`/api/companies/${deleteDialog.company.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCompanies(companies.filter(c => c.id !== deleteDialog.company!.id));
        setDeleteDialog({ open: false, company: null });
        setAlert({ type: 'success', message: 'Company deleted successfully' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        console.error('Failed to delete company:', result.error);
        setAlert({ type: 'error', message: result.error || 'Failed to delete company' });
        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      setAlert({ type: 'error', message: 'Error deleting company' });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleCreate = async () => {
    if (!newCompany.name) {
      setFormAlert({ type: 'warning', message: 'Please provide company name' });
      setTimeout(() => setFormAlert(null), 4000);
      return;
    }

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
      });

      const result = await response.json();

      if (result.success) {
        await fetchCompanies();
        setCreateDialog(false);
        setFormAlert(null);
        setNewCompany({
          name: '',
          logo: '',
          address: '',
          country: '',
          city: '',
          zipCode: '',
          registrationCode: '',
          nationalId: '',
        });
        setAlert({ type: 'success', message: 'Company created successfully' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        console.error('Failed to create company:', result.error);
        setFormAlert({ type: 'error', message: result.error || 'Failed to create company' });
        setTimeout(() => setFormAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error creating company:', error);
      setFormAlert({ type: 'error', message: 'Error creating company' });
      setTimeout(() => setFormAlert(null), 5000);
    }
  };

  const handleEdit = async () => {
    if (!editDialog.company || !editDialog.company.name || !editDialog.company.id) {
      setFormAlert({ type: 'warning', message: 'Please provide company name' });
      setTimeout(() => setFormAlert(null), 4000);
      return;
    }

    try {
      // Extract only the updateable fields (exclude id, createdAt)
      const { id, createdAt, ...updateData } = editDialog.company;
      
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        // Close dialog first
        setEditDialog({ open: false, company: null });
        setFormAlert(null);
        
        // Then refresh the list
        await fetchCompanies();
        
        setAlert({ type: 'success', message: 'Company updated successfully' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        console.error('Failed to update company:', result.error);
        setFormAlert({ type: 'error', message: result.error || 'Failed to update company' });
        setTimeout(() => setFormAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      setFormAlert({ type: 'error', message: 'Error updating company' });
      setTimeout(() => setFormAlert(null), 5000);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.registrationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.nationalId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout
      title="Companies Builder"
      subtitle="Create and manage companies"
      showCreateButton
      createButtonText="New Company"
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
            placeholder="Search companies..."
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
        ) : filteredCompanies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No companies found' : 'No companies yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first company'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Company
              </Button>
            )}
          </motion.div>
        ) : (
          /* Companies Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onEdit={() => setEditDialog({ open: true, company: { ...company } })}
                onDelete={() => setDeleteDialog({ open: true, company })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Company Dialog */}
      <Dialog open={createDialog} onOpenChange={(open) => { setCreateDialog(open); setFormAlert(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>
              Add a new company to your system
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
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="Enter company name"
                value={newCompany.name || ''}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company-logo">Logo URL</Label>
              <Input
                id="company-logo"
                placeholder="https://example.com/logo.png"
                value={newCompany.logo || ''}
                onChange={(e) => setNewCompany({ ...newCompany, logo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company-address">Address</Label>
              <Textarea
                id="company-address"
                placeholder="Enter company address"
                value={newCompany.address || ''}
                onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-country">Country</Label>
                <Input
                  id="company-country"
                  placeholder="Enter country"
                  value={newCompany.country || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company-city">City</Label>
                <Input
                  id="company-city"
                  placeholder="Enter city"
                  value={newCompany.city || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-zip">ZIP Code</Label>
                <Input
                  id="company-zip"
                  placeholder="Enter ZIP code"
                  value={newCompany.zipCode || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, zipCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company-registration">Registration Code</Label>
                <Input
                  id="company-registration"
                  placeholder="Enter registration code"
                  value={newCompany.registrationCode || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, registrationCode: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company-national-id">National ID</Label>
              <Input
                id="company-national-id"
                placeholder="Enter national ID"
                value={newCompany.nationalId || ''}
                onChange={(e) => setNewCompany({ ...newCompany, nationalId: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                Create Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => { setEditDialog({ open, company: null }); setFormAlert(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information
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
            {editDialog.company && (
              <>
                <div>
                  <Label htmlFor="edit-company-name">Company Name *</Label>
                  <Input
                    id="edit-company-name"
                    placeholder="Enter company name"
                    value={editDialog.company.name || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, name: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-company-logo">Logo URL</Label>
                  <Input
                    id="edit-company-logo"
                    placeholder="https://example.com/logo.png"
                    value={editDialog.company.logo || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, logo: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-company-address">Address</Label>
                  <Textarea
                    id="edit-company-address"
                    placeholder="Enter company address"
                    value={editDialog.company.address || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, address: e.target.value } })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-company-country">Country</Label>
                    <Input
                      id="edit-company-country"
                      placeholder="Enter country"
                      value={editDialog.company.country || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, country: e.target.value } })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-company-city">City</Label>
                    <Input
                      id="edit-company-city"
                      placeholder="Enter city"
                      value={editDialog.company.city || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, city: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-company-zip">ZIP Code</Label>
                    <Input
                      id="edit-company-zip"
                      placeholder="Enter ZIP code"
                      value={editDialog.company.zipCode || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, zipCode: e.target.value } })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-company-registration">Registration Code</Label>
                    <Input
                      id="edit-company-registration"
                      placeholder="Enter registration code"
                      value={editDialog.company.registrationCode || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, registrationCode: e.target.value } })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-company-national-id">National ID</Label>
                  <Input
                    id="edit-company-national-id"
                    placeholder="Enter national ID"
                    value={editDialog.company.nationalId || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, company: { ...editDialog.company!, nationalId: e.target.value } })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditDialog({ open: false, company: null })}>
                    Cancel
                  </Button>
                  <Button onClick={handleEdit}>
                    Update Company
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationMessage
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, company: null })}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteDialog.company?.name}"? This action cannot be undone.`}
        variant="destructive"
        buttons={[
          {
            label: 'Cancel',
            variant: 'outline',
            action: () => setDeleteDialog({ open: false, company: null }),
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

