'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuickAction, FormSchema } from '@/shared/types/form-schema';
import { FormDialog } from '@/gradian-ui/form-builder/components/FormDialog';
import type { FormSchema as FormBuilderSchema } from '@/gradian-ui/form-builder/types/form-schema';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconRenderer } from '@/shared/utils/icon-renderer';
import { config } from '@/lib/config';

export interface DynamicQuickActionsProps {
  actions: QuickAction[];
  schema: FormSchema;
  data: any; // Current item data
  className?: string;
  disableAnimation?: boolean;
}

export const DynamicQuickActions: React.FC<DynamicQuickActionsProps> = ({
  actions,
  schema,
  data,
  className,
  disableAnimation = false
}) => {
  const router = useRouter();
  const [openDialogSchema, setOpenDialogSchema] = useState<FormSchema | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  if (!actions || actions.length === 0) {
    return null;
  }

  const handleAction = useCallback(async (action: QuickAction) => {
    if (action.action === 'goToUrl' && action.targetUrl) {
      let url = action.targetUrl;
      
      // If passItemAsReference is true, append the current item ID as reference
      if (action.passItemAsReference && data?.id) {
        // Format: http://localhost:3000/page/vendors/01K8QVCWS0ZSTMSVD5C6K7A806
        url = `${action.targetUrl}${action.targetUrl.endsWith('/') ? '' : '/'}${data.id}`;
      }
      
      router.push(url);
    } else if (action.action === 'openUrl' && action.targetUrl) {
      let url = action.targetUrl;
      
      // If passItemAsReference is true, append the current item ID as reference
      if (action.passItemAsReference && data?.id) {
        url = `${action.targetUrl}${action.targetUrl.endsWith('/') ? '' : '/'}${data.id}`;
      }
      
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (action.action === 'openFormDialog' && action.targetSchema) {
      setIsLoadingSchema(true);
      try {
        // Fetch schema from API (client-side only)
        const response = await fetch(`${config.schemaApi.basePath}/${action.targetSchema}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!response.ok) {
          console.error(`Schema not found: ${action.targetSchema}`);
          setIsLoadingSchema(false);
          return;
        }
        
        const result = await response.json();
        if (!result.success || !result.data) {
          console.error(`Schema not found: ${action.targetSchema}`);
          setIsLoadingSchema(false);
          return;
        }
        
        // Deep clone the schema to avoid mutation issues
        const rawSchema = result.data as FormSchema;
        const schema: FormSchema = JSON.parse(JSON.stringify(rawSchema));
        
        // Ensure schema has required properties for form-builder compatibility
        if (!schema.name) {
          schema.name = schema.singular_name;
        }
        
        // Process validation patterns (create new field objects to avoid mutation)
        if (schema.fields && Array.isArray(schema.fields)) {
          schema.fields = schema.fields.map(field => {
            const processedField = { ...field };
            if (processedField.validation?.pattern && typeof processedField.validation.pattern === 'string') {
              try {
                processedField.validation = {
                  ...processedField.validation,
                  pattern: new RegExp(processedField.validation.pattern)
                };
              } catch (error) {
                console.warn(`Invalid pattern for field ${field.id}: ${processedField.validation.pattern}`);
              }
            }
            return processedField;
          });
        }
        
        // Set both states together - React will batch them
        setOpenDialogSchema(schema);
        setIsDialogOpen(true);
      } catch (error) {
        console.error('Error loading schema for dialog:', error);
        setIsLoadingSchema(false);
      } finally {
        setIsLoadingSchema(false);
      }
    }
  }, [router, data]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setOpenDialogSchema(null);
  }, []);

  const handleDialogSubmit = useCallback(async (formData: Record<string, any>) => {
    try {
      // If passItemAsReference is true, include the current item as reference
      const enrichedData = data?.id ? {
        ...formData,
        referenceId: data.id,
        referenceSchema: schema.id
      } : formData;

      // Here you would typically save the form data to an API
      // For now, we'll just log it
      console.log('Form submitted:', enrichedData);
      
      // Close dialog after successful submission
      handleDialogClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Don't close dialog on error - let user try again
    }
  }, [data?.id, schema?.id, handleDialogClose]);

  return (
    <>
      <motion.div
        initial={disableAnimation ? false : { opacity: 0, y: 10 }}
        animate={disableAnimation ? false : { opacity: 1, y: 0 }}
        transition={disableAnimation ? {} : { duration: 0.3 }}
        className={cn('space-y-2', className)}
      >
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                onClick={() => handleAction(action)}
                disabled={isLoadingSchema}
                className="w-full justify-start"
                size="sm"
              >
                {action.icon && (
                  <IconRenderer iconName={action.icon} className="h-4 w-4 mr-2" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Form Dialog - Only render when both schema and open state are ready */}
      {openDialogSchema && isDialogOpen && (
        <FormDialog
          key={`create-${openDialogSchema.id}`}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          schema={openDialogSchema as FormBuilderSchema}
          onSubmit={handleDialogSubmit}
          initialValues={{}}
          title={`Create ${openDialogSchema.singular_name}`}
          description={`Add a new ${openDialogSchema.singular_name.toLowerCase()} to your system`}
          size="lg"
          closeOnOutsideClick={true}
        />
      )}
    </>
  );
};

DynamicQuickActions.displayName = 'DynamicQuickActions';

