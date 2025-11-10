'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuickAction, FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconRenderer } from '@/gradian-ui/shared/utils/icon-renderer';
import { FormModal } from '@/gradian-ui/form-builder';

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
  
  // Track loading state per action (not globally)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [targetSchemaId, setTargetSchemaId] = useState<string | null>(null);

  /**
   * Handle action click - simplified
   */
  const handleAction = useCallback(async (action: QuickAction) => {
    if (action.action === 'goToUrl' && action.targetUrl) {
      let url = action.targetUrl;
      if (action.passItemAsReference && data?.id) {
        url = `${action.targetUrl}${action.targetUrl.endsWith('/') ? '' : '/'}${data.id}`;
      }
      router.push(url);
      
    } else if (action.action === 'openUrl' && action.targetUrl) {
      let url = action.targetUrl;
      if (action.passItemAsReference && data?.id) {
        url = `${action.targetUrl}${action.targetUrl.endsWith('/') ? '' : '/'}${data.id}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      
    } else if (action.action === 'openFormDialog' && action.targetSchema) {
      // Set loading state for this specific action
      setLoadingActionId(action.id);
      
      try {
        // Set target schema ID to trigger modal
        setTargetSchemaId(action.targetSchema);
      } finally {
        // Clear loading state after a short delay to allow modal to render
        setTimeout(() => {
          setLoadingActionId(null);
        }, 100);
      }
    }
  }, [router, data]);

  if (!actions || actions.length === 0) {
    return null;
  }

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
            {actions.map((action) => {
              const isLoading = loadingActionId === action.id;
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  onClick={() => handleAction(action)}
                  disabled={isLoading}
                  className="w-full justify-start"
                  size="sm"
                >
                  {action.icon && (
                    <IconRenderer iconName={action.icon} className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Loading...' : action.label}
                </Button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Create Modal - using unified FormModal */}
      {targetSchemaId && (
        <FormModal
          schemaId={targetSchemaId}
          mode="create"
          enrichData={(formData) => {
            // Enrich data with reference if needed
            return data?.id ? {
              ...formData,
              referenceId: data.id,
              referenceSchema: schema.id
            } : formData;
          }}
          onSuccess={() => {
            setTargetSchemaId(null);
          }}
          onClose={() => {
            setTargetSchemaId(null);
          }}
        />
      )}
    </>
  );
};

DynamicQuickActions.displayName = 'DynamicQuickActions';

