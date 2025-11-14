'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuickAction, FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconRenderer } from '@/gradian-ui/shared/utils/icon-renderer';
import { FormModal } from '@/gradian-ui/form-builder';
import { apiRequest } from '@/gradian-ui/shared/utils/api';

export interface DynamicQuickActionsProps {
  actions: QuickAction[];
  schema: FormSchema;
  data: any; // Current item data
  className?: string;
  disableAnimation?: boolean;
  schemaCache?: Record<string, FormSchema>;
}

export const DynamicQuickActions: React.FC<DynamicQuickActionsProps> = ({
  actions,
  schema,
  data,
  className,
  disableAnimation = false,
  schemaCache,
}) => {
  const router = useRouter();
  
  // Track loading state per action (not globally)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [targetSchemaId, setTargetSchemaId] = useState<string | null>(null);
  const [schemaCacheState, setSchemaCacheState] = useState<Record<string, FormSchema>>(() => schemaCache || {});

  useEffect(() => {
    if (!schemaCache) {
      return;
    }
    setSchemaCacheState((prev) => {
      const next = { ...prev };
      let hasChanges = false;
      Object.entries(schemaCache).forEach(([id, schema]) => {
        if (schema && !next[id]) {
          next[id] = schema;
          hasChanges = true;
        }
      });
      return hasChanges ? next : prev;
    });
  }, [schemaCache]);

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
      setLoadingActionId(action.id);
      
      try {
        if (!schemaCacheState?.[action.targetSchema]) {
          const response = await apiRequest<FormSchema[]>(`/api/schemas?schemaIds=${action.targetSchema}`);
          if (!response.success || !Array.isArray(response.data) || !response.data[0]) {
            throw new Error(response.error || `Schema ${action.targetSchema} not found`);
          }

          setSchemaCacheState((prev) => ({
            ...prev,
            [response.data[0].id]: response.data[0],
          }));
        }

        setTargetSchemaId(action.targetSchema);
      } catch (error) {
        console.error(`Failed to load schema for action ${action.id}:`, error);
      } finally {
        setTimeout(() => {
          setLoadingActionId(null);
        }, 100);
      }
    }
  }, [router, data, schemaCacheState]);

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
          getInitialSchema={(requestedId) => schemaCacheState?.[requestedId] ?? null}
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

