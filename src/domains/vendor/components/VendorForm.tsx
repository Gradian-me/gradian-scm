'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createVendorSchema, CreateVendorInput } from '../schemas';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { RepeatingSection, useRepeatingSection } from '../../../shared/components/repeating-section';
import { Plus, X } from 'lucide-react';
import { COUNTRIES } from '../../../shared/constants';

interface VendorFormProps {
  onSubmit: (data: CreateVendorInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateVendorInput>;
  isEditMode?: boolean;
}

export function VendorForm({ onSubmit, onCancel, isLoading = false, initialData, isEditMode = false }: VendorFormProps) {
  const [categories, setCategories] = useState<string[]>(initialData?.categories || []);
  const [newCategory, setNewCategory] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<CreateVendorInput>({
    resolver: zodResolver(createVendorSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zipCode: initialData?.zipCode || '',
      country: initialData?.country || 'USA',
      registrationNumber: initialData?.registrationNumber || '',
      taxId: initialData?.taxId || '',
      categories: initialData?.categories || [],
      contacts: (initialData?.contacts || []).map(contact => ({
        ...contact,
        isPrimary: Boolean(contact.isPrimary),
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  // Sync categories with form state
  useEffect(() => {
    setValue('categories', categories);
  }, [categories, setValue]);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    const updatedCategories = categories.filter(c => c !== category);
    setCategories(updatedCategories);
  };

  const addContact = () => {
    append({
      name: '',
      email: '',
      phone: '',
      position: '',
      isPrimary: false,
    });
  };

  const removeContact = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleFormSubmit = (data: CreateVendorInput) => {
    // Ensure at least one contact is marked as primary
    if (data.contacts.length > 0 && !data.contacts.some(contact => contact.isPrimary)) {
      data.contacts[0].isPrimary = true;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter company name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="registrationNumber">Registration Number *</Label>
              <Input
                id="registrationNumber"
                {...register('registrationNumber')}
                placeholder="Enter registration number"
              />
              {errors.registrationNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID *</Label>
              <Input
                id="taxId"
                {...register('taxId')}
                placeholder="Enter tax ID"
              />
              {errors.taxId && (
                <p className="text-sm text-red-600 mt-1">{errors.taxId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={(value) => setValue('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter full address"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                {...register('zipCode')}
                placeholder="Enter ZIP code"
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 mt-1">{errors.zipCode.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add category"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            />
            <Button type="button" onClick={addCategory} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                >
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.categories && (
            <p className="text-sm text-red-600">{errors.categories.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Contacts */}
      <RepeatingSection
        title="Contacts"
        items={fields}
        onAdd={addContact}
        onRemove={removeContact}
        addButtonText="Add Contact"
        emptyMessage="No contacts added yet"
        minItems={1}
        renderItem={(contact, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`contactName-${index}`}>Contact Name *</Label>
              <Input
                id={`contactName-${index}`}
                {...register(`contacts.${index}.name`)}
                placeholder="Enter contact name"
              />
              {errors.contacts?.[index]?.name && (
                <p className="text-sm text-red-600 mt-1">{errors.contacts[index]?.name?.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor={`contactEmail-${index}`}>Contact Email *</Label>
              <Input
                id={`contactEmail-${index}`}
                type="email"
                {...register(`contacts.${index}.email`)}
                placeholder="Enter contact email"
              />
              {errors.contacts?.[index]?.email && (
                <p className="text-sm text-red-600 mt-1">{errors.contacts[index]?.email?.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor={`contactPhone-${index}`}>Contact Phone *</Label>
              <Input
                id={`contactPhone-${index}`}
                {...register(`contacts.${index}.phone`)}
                placeholder="Enter contact phone"
              />
              {errors.contacts?.[index]?.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.contacts[index]?.phone?.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor={`contactPosition-${index}`}>Position *</Label>
              <Input
                id={`contactPosition-${index}`}
                {...register(`contacts.${index}.position`)}
                placeholder="Enter position"
              />
              {errors.contacts?.[index]?.position && (
                <p className="text-sm text-red-600 mt-1">{errors.contacts[index]?.position?.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`isPrimary-${index}`}
                  {...register(`contacts.${index}.isPrimary`)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={`isPrimary-${index}`} className="text-sm font-medium">
                  Primary Contact
                </Label>
              </div>
            </div>
          </div>
        )}
      />

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Vendor' : 'Create Vendor')}
        </Button>
      </div>
    </form>
  );
}
