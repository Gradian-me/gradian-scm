'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateSchemaPayload, SchemaCreateResult } from '../types/schema-manager-page';
import { generatePluralName, generateSchemaId } from '../utils/schema-form';
import { Switch as FormSwitch } from '@/gradian-ui/form-builder/form-elements/components/Switch';
import { NameInput } from '@/gradian-ui/form-builder/form-elements';

interface CreateSchemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateSchemaPayload) => Promise<SchemaCreateResult>;
}

const INITIAL_FORM_STATE: CreateSchemaPayload = {
  singularName: '',
  pluralName: '',
  schemaId: '',
  description: '',
  showInNavigation: false,
  isSystemSchema: false,
  isNotCompanyBased: false,
};

export function CreateSchemaDialog({ open, onOpenChange, onSubmit }: CreateSchemaDialogProps) {
  const [formState, setFormState] = useState<CreateSchemaPayload>(INITIAL_FORM_STATE);
  const [isPluralCustom, setIsPluralCustom] = useState(false);
  const [isSchemaIdCustom, setIsSchemaIdCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setIsPluralCustom(false);
    setIsSchemaIdCustom(false);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSingularNameChange = (value: string) => {
    setFormState(prev => {
      const nextState = { ...prev, singularName: value };

      if (!isPluralCustom) {
        const generatedPlural = generatePluralName(value);
        nextState.pluralName = generatedPlural;

        if (!isSchemaIdCustom) {
          nextState.schemaId = generateSchemaId(generatedPlural);
        }
      } else if (!isSchemaIdCustom) {
        nextState.schemaId = generateSchemaId(prev.pluralName);
      }

      return nextState;
    });
  };

  const handlePluralNameChange = (value: string) => {
    setIsPluralCustom(true);
    setFormState(prev => {
      const nextState = { ...prev, pluralName: value };

      if (!isSchemaIdCustom) {
        nextState.schemaId = generateSchemaId(value);
      }

      return nextState;
    });
  };

  const handleSchemaIdChange = (value: string) => {
    if (!isSchemaIdCustom) {
      return;
    }

    setFormState(prev => ({ ...prev, schemaId: value }));
  };

  const handleSwitchChange = (key: 'showInNavigation' | 'isSystemSchema' | 'isNotCompanyBased') => (checked: boolean) => {
    setFormState(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handlePluralReset = () => {
    const generatedPlural = generatePluralName(formState.singularName);
    setIsPluralCustom(false);
    setFormState(prev => {
      const nextState = { ...prev, pluralName: generatedPlural };

      if (!isSchemaIdCustom) {
        nextState.schemaId = generateSchemaId(generatedPlural);
      }

      return nextState;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit(formState);

    if (result.success) {
      onOpenChange(false);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={formState.singularName}
              onChange={(e) => handleSingularNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="schema-plural-name">Plural Name</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={handlePluralReset}
                disabled={!formState.singularName || !isPluralCustom}
              >
                Use generated
              </Button>
            </div>
            <Input
              id="schema-plural-name"
              placeholder="e.g., Purchase Orders"
              value={formState.pluralName}
              onChange={(e) => handlePluralNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <NameInput
              config={{ name: 'schema-id', label: 'Schema ID', placeholder: 'Generated from the plural name' }}
              value={formState.schemaId}
              onChange={handleSchemaIdChange}
              isCustomizable
              customMode={isSchemaIdCustom}
              onCustomModeChange={(custom) => {
                if (!custom) {
                  const generatedId = generateSchemaId(formState.pluralName);
                  setFormState(prev => ({ ...prev, schemaId: generatedId }));
                }
                setIsSchemaIdCustom(custom);
              }}
              customizeDisabled={!formState.pluralName}
              helperText="Schema ID is permanent and cannot be changed later."
            />
          </div>
          <div>
            <Label htmlFor="schema-description">Description</Label>
            <Textarea
              id="schema-description"
              placeholder="Describe the purpose of this schema"
              value={formState.description}
              onChange={(e) =>
                setFormState(prev => ({ ...prev, description: e.target.value }))
              }
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <FormSwitch
              config={{ name: 'showInNavigation', label: 'Show in Navigation' }}
              value={formState.showInNavigation}
              onChange={handleSwitchChange('showInNavigation')}
            />
            <FormSwitch
              config={{ name: 'isSystemSchema', label: 'Is System Schema' }}
              value={formState.isSystemSchema}
              onChange={handleSwitchChange('isSystemSchema')}
            />
            <FormSwitch
              config={{ name: 'isNotCompanyBased', label: 'Is Not Company Based' }}
              value={formState.isNotCompanyBased}
              onChange={handleSwitchChange('isNotCompanyBased')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Schema'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
