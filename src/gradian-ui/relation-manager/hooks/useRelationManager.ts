// Relation Manager Hook
// Main hook for managing relation types state and operations

import { useState, useCallback } from 'react';
import { RelationType } from '../types';
import { 
  RelationManagerState, 
  RelationManagerActions, 
  RelationManagerConfig,
  UseRelationManagerReturn 
} from '../types';

export function useRelationManager(
  config?: RelationManagerConfig
): UseRelationManagerReturn {
  const [state, setState] = useState<RelationManagerState>({
    relationType: null,
    loading: false,
    saving: false,
    error: null,
  });

  const loadRelationType = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${config?.apiBaseUrl || '/api/data/relation-types'}/${id}`);
      const result = await response.json();
      
      if (result.success) {
        const relationType = result.data;
        setState(prev => ({
          ...prev,
          relationType,
          loading: false,
        }));
      } else {
        throw new Error(result.error || 'Failed to load relation type');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load relation type',
      }));
      throw error;
    }
  }, [config]);

  const saveRelationType = useCallback(async (relationType: RelationType) => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    try {
      if (config?.onSave) {
        await config.onSave(relationType);
      } else {
        const response = await fetch(
          `${config?.apiBaseUrl || '/api/data/relation-types'}/${relationType.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(relationType),
          }
        );
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to save relation type');
        }
      }
      setState(prev => ({ ...prev, saving: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Failed to save relation type',
      }));
      throw error;
    }
  }, [config]);

  const deleteRelationType = useCallback(async (id: string) => {
    try {
      if (config?.onDelete) {
        await config.onDelete(id);
      } else {
        const response = await fetch(
          `${config?.apiBaseUrl || '/api/data/relation-types'}/${id}`,
          { method: 'DELETE' }
        );
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete relation type');
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete relation type',
      }));
      throw error;
    }
  }, [config]);

  const setRelationType = useCallback((relationType: RelationType) => {
    setState(prev => ({
      ...prev,
      relationType,
    }));
  }, []);

  const updateRelationType = useCallback((updates: Partial<RelationType>) => {
    setState(prev => ({
      ...prev,
      relationType: prev.relationType ? { ...prev.relationType, ...updates } : null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      relationType: null,
      loading: false,
      saving: false,
      error: null,
    });
  }, []);

  const actions: RelationManagerActions = {
    loadRelationType,
    saveRelationType,
    deleteRelationType,
    setRelationType,
    updateRelationType,
    reset,
  };

  return { state, actions };
}

