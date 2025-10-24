'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTenderSchema, CreateTenderInput } from '../schemas';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { RepeatingSection } from '../../../shared/components/repeating-section';
import { Plus, Trash2 } from 'lucide-react';
import { CURRENCIES, UNITS } from '../../../shared/constants';

interface TenderFormProps {
  onSubmit: (data: CreateTenderInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateTenderInput>;
}

export function TenderForm({ onSubmit, onCancel, isLoading = false, initialData }: TenderFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTenderInput>({
    resolver: zodResolver(createTenderSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      estimatedValue: initialData?.estimatedValue || 0,
      currency: initialData?.currency || 'USD',
      closingDate: initialData?.closingDate || '',
      evaluationCriteria: {
        price: initialData?.evaluationCriteria?.price || 40,
        quality: initialData?.evaluationCriteria?.quality || 30,
        delivery: initialData?.evaluationCriteria?.delivery || 20,
        experience: initialData?.evaluationCriteria?.experience || 10,
      },
      items: initialData?.items || [
        {
          productName: '',
          description: '',
          quantity: 1,
          unit: 'piece',
          specifications: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const addItem = () => {
    append({
      productName: '',
      description: '',
      quantity: 1,
      unit: 'piece',
      specifications: '',
    });
  };

  const handleFormSubmit = (data: CreateTenderInput) => {
    onSubmit(data);
  };

  const evaluationCriteria = watch('evaluationCriteria');
  const totalWeight = (evaluationCriteria?.price || 0) + 
                     (evaluationCriteria?.quality || 0) + 
                     (evaluationCriteria?.delivery || 0) + 
                     (evaluationCriteria?.experience || 0);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tender Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Tender Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter tender title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter tender description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HPLC Columns">HPLC Columns</SelectItem>
                  <SelectItem value="Merck Products">Merck Products</SelectItem>
                  <SelectItem value="Laboratory Equipment">Laboratory Equipment</SelectItem>
                  <SelectItem value="Biotech Consumables">Biotech Consumables</SelectItem>
                  <SelectItem value="Analytical Instruments">Analytical Instruments</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="estimatedValue">Estimated Value *</Label>
              <Input
                id="estimatedValue"
                type="number"
                {...register('estimatedValue', { valueAsNumber: true })}
                placeholder="Enter estimated value"
              />
              {errors.estimatedValue && (
                <p className="text-sm text-red-600 mt-1">{errors.estimatedValue.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select onValueChange={(value) => setValue('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="closingDate">Closing Date *</Label>
            <Input
              id="closingDate"
              type="datetime-local"
              {...register('closingDate')}
            />
            {errors.closingDate && (
              <p className="text-sm text-red-600 mt-1">{errors.closingDate.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Criteria</CardTitle>
          <p className="text-sm text-gray-600">Set the weightings for evaluation (must total 100%)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="price">Price (%)</Label>
              <Input
                id="price"
                type="number"
                {...register('evaluationCriteria.price', { valueAsNumber: true })}
                placeholder="40"
              />
            </div>
            <div>
              <Label htmlFor="quality">Quality (%)</Label>
              <Input
                id="quality"
                type="number"
                {...register('evaluationCriteria.quality', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="delivery">Delivery (%)</Label>
              <Input
                id="delivery"
                type="number"
                {...register('evaluationCriteria.delivery', { valueAsNumber: true })}
                placeholder="20"
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience (%)</Label>
              <Input
                id="experience"
                type="number"
                {...register('evaluationCriteria.experience', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>
          </div>
          <div className="text-sm">
            <span className={totalWeight === 100 ? 'text-green-600' : 'text-red-600'}>
              Total: {totalWeight}%
            </span>
            {totalWeight !== 100 && (
              <p className="text-red-600 mt-1">Evaluation criteria must total 100%</p>
            )}
          </div>
          {errors.evaluationCriteria && (
            <p className="text-sm text-red-600">{errors.evaluationCriteria.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Tender Items */}
      <RepeatingSection
        title="Tender Items"
        items={fields}
        onAdd={addItem}
        onRemove={remove}
        addButtonText="Add Item"
        emptyMessage="No items added yet"
        minItems={1}
        renderItem={(item, index) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`items.${index}.productName`}>Product Name *</Label>
                <Input
                  {...register(`items.${index}.productName`)}
                  placeholder="Enter product name"
                />
                {errors.items?.[index]?.productName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.items[index]?.productName?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                <Input
                  type="number"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  placeholder="Enter quantity"
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`items.${index}.unit`}>Unit *</Label>
                <Select onValueChange={(value) => setValue(`items.${index}.unit`, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.items?.[index]?.unit && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.items[index]?.unit?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`items.${index}.estimatedUnitPrice`}>Unit Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.estimatedUnitPrice`, { valueAsNumber: true })}
                  placeholder="Enter unit price"
                />
                {errors.items?.[index]?.estimatedUnitPrice && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.items[index]?.estimatedUnitPrice?.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor={`items.${index}.description`}>Description *</Label>
              <Textarea
                {...register(`items.${index}.description`)}
                placeholder="Enter item description"
                rows={2}
              />
              {errors.items?.[index]?.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.items[index]?.description?.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`items.${index}.specifications`}>Specifications *</Label>
              <Textarea
                {...register(`items.${index}.specifications`)}
                placeholder="Enter technical specifications"
                rows={2}
              />
              {errors.items?.[index]?.specifications && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.items[index]?.specifications?.message}
                </p>
              )}
            </div>
          </div>
        )}
      />

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || totalWeight !== 100}>
          {isLoading ? 'Creating...' : 'Create Tender'}
        </Button>
      </div>
    </form>
  );
}
