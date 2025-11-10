import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { useSchemaStore } from '@/stores/schema.store';
import { resolveFieldById, getValueByRole } from '@/gradian-ui/form-builder/form-elements/utils/field-resolver';
import {
  RelationDirection,
  RelationInfo,
  UseRepeatingTableDataParams,
  UseRepeatingTableDataResult,
} from '../types';
import { formatRelationType } from '../utils';

export function useRepeatingTableData(
  params: UseRepeatingTableDataParams
): UseRepeatingTableDataResult {
  const { config, schema, data, sourceId, sourceSchemaId } = params;
  const { fetchSchema } = useSchemaStore();

  const isRelationBased = Boolean(config.targetSchema);
  const targetSchemaId = config.targetSchema || null;
  const relationTypeId = config.relationTypeId;

  const effectiveSourceSchemaId = sourceSchemaId || schema.id;
  const effectiveSourceId = sourceId ?? data?.id;

  const [relatedEntities, setRelatedEntities] = useState<any[]>([]);
  const [isLoadingRelations, setIsLoadingRelations] = useState(false);
  const [targetSchemaData, setTargetSchemaData] = useState<any>(null);
  const [isLoadingTargetSchema, setIsLoadingTargetSchema] = useState(false);
  const [relationDirections, setRelationDirections] = useState<Set<RelationDirection>>(new Set());

  const isFetchingRelationsRef = useRef(false);
  const lastFetchParamsRef = useRef('');

  useEffect(() => {
    if (!isRelationBased || !targetSchemaId) {
      return;
    }

    let isMounted = true;

    if (!targetSchemaData) {
      setIsLoadingTargetSchema(true);
      fetchSchema(targetSchemaId)
        .then((loadedSchema) => {
          if (isMounted && loadedSchema) {
            setTargetSchemaData(loadedSchema);
          }
        })
        .catch((error) => {
          console.error('Error loading target schema:', error);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingTargetSchema(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [fetchSchema, isRelationBased, targetSchemaData, targetSchemaId]);

  const fetchRelations = useCallback(async () => {
    if (!isRelationBased || !effectiveSourceId || !targetSchemaId || isFetchingRelationsRef.current) {
      return;
    }

    isFetchingRelationsRef.current = true;
    setIsLoadingRelations(true);

    try {
      let schemaToUse = targetSchemaData;
      if (!schemaToUse && targetSchemaId) {
        schemaToUse = await fetchSchema(targetSchemaId);
        if (schemaToUse) {
          setTargetSchemaData(schemaToUse);
        }
      }

      const allRelationsUrl = `/api/data/all-relations?schema=${effectiveSourceSchemaId}&id=${effectiveSourceId}&direction=both&otherSchema=${targetSchemaId}`;

      const allRelationsResponse = await apiRequest<Array<{
        schema: string;
        direction: RelationDirection;
        relation_type: string;
        data: any[];
      }>>(allRelationsUrl);

      if (allRelationsResponse.success && Array.isArray(allRelationsResponse.data)) {
        const groupedData = allRelationsResponse.data;
        let entities: any[] = [];
        const directionsSet = new Set<RelationDirection>();

        for (const group of groupedData) {
          if (group.schema !== targetSchemaId) continue;
          if (relationTypeId && group.relation_type !== relationTypeId) continue;

          directionsSet.add(group.direction);
          const annotatedData = group.data.map((item) => ({
            ...item,
            __relationType: group.relation_type,
          }));
          entities.push(...annotatedData);
        }

        if (schemaToUse?.fields?.length && entities.length > 0) {
          const pickerFields = schemaToUse.fields.filter(
            (field: any) => field.type === 'picker' && field.targetSchema
          );

          const resolvedPromises = entities.map(async (entity) => {
            await Promise.all(
              pickerFields
                .filter((field: any) => entity[field.name])
                .map(async (field: any) => {
                  const fieldValue = entity[field.name];
                  if (typeof fieldValue !== 'string' || fieldValue.trim() === '') {
                    return;
                  }

                  try {
                    const resolvedResponse = await apiRequest<any>(
                      `/api/data/${field.targetSchema}/${fieldValue}`
                    );
                    if (resolvedResponse.success && resolvedResponse.data) {
                      const resolvedEntity = resolvedResponse.data;
                      let resolvedLabel = resolvedEntity.name || resolvedEntity.title || fieldValue;

                      try {
                        const targetSchemaForPicker = await fetchSchema(field.targetSchema);
                        if (targetSchemaForPicker) {
                          const titleByRole = getValueByRole(
                            targetSchemaForPicker,
                            resolvedEntity,
                            'title'
                          );
                          if (titleByRole && titleByRole.trim() !== '') {
                            resolvedLabel = titleByRole;
                          }
                        }
                      } catch (schemaError) {
                        console.error(
                          `Error fetching target schema for picker field ${field.name}:`,
                          schemaError
                        );
                      }

                      entity[`_${field.name}_resolved`] = {
                        ...resolvedEntity,
                        _resolvedLabel: resolvedLabel,
                      };
                    }
                  } catch (error) {
                    console.error(`Error resolving picker field ${field.name}:`, error);
                  }
                })
            );
            return entity;
          });

          entities = await Promise.all(resolvedPromises);
        }

        setRelatedEntities(entities);
        setRelationDirections(directionsSet);
      } else {
        setRelatedEntities([]);
        setRelationDirections(new Set());
      }
    } catch (error) {
      console.error('Error fetching relations:', error);
      setRelatedEntities([]);
      setRelationDirections(new Set());
    } finally {
      setIsLoadingRelations(false);
      isFetchingRelationsRef.current = false;
    }
  }, [
    effectiveSourceId,
    effectiveSourceSchemaId,
    fetchSchema,
    isRelationBased,
    relationTypeId,
    targetSchemaData,
    targetSchemaId,
  ]);

  useEffect(() => {
    if (!isRelationBased || !effectiveSourceId || !targetSchemaId) {
      return;
    }

    const fetchKey = `${effectiveSourceSchemaId}-${effectiveSourceId}-${targetSchemaId}-${relationTypeId || 'all'}`;
    if (lastFetchParamsRef.current === fetchKey) {
      return;
    }

    lastFetchParamsRef.current = fetchKey;
    fetchRelations();
  }, [
    effectiveSourceId,
    effectiveSourceSchemaId,
    fetchRelations,
    isRelationBased,
    relationTypeId,
    targetSchemaId,
  ]);

  const section = useMemo(
    () => schema.sections?.find((s) => s.id === config.sectionId),
    [config.sectionId, schema.sections]
  );

  const sectionData = useMemo(() => {
    if (isRelationBased) {
      return relatedEntities;
    }

    const repeatingData = data?.[config.sectionId];
    return Array.isArray(repeatingData) ? repeatingData : [];
  }, [config.sectionId, data, isRelationBased, relatedEntities]);

  const fieldsToUse = useMemo(() => {
    if (isRelationBased && targetSchemaData) {
      return targetSchemaData.fields || [];
    }

    if (!isRelationBased && section) {
      return (
        schema.fields?.filter((field: any) => field.sectionId === config.sectionId) || []
      );
    }

    return [];
  }, [config.sectionId, isRelationBased, schema.fields, section, targetSchemaData]);

  const schemaForColumns = isRelationBased && targetSchemaData ? targetSchemaData : schema;

  const fieldsToDisplay = useMemo(() => {
    if (config.columns && config.columns.length > 0) {
      return config.columns
        .map((fieldId) => resolveFieldById(schemaForColumns, fieldId))
        .filter(Boolean);
    }

    if (isRelationBased && targetSchemaData) {
      return targetSchemaData.fields || [];
    }

    return fieldsToUse;
  }, [config.columns, fieldsToUse, isRelationBased, schemaForColumns, targetSchemaData]);

  const relationTypeTexts = useMemo(() => {
    if (!isRelationBased) {
      return [];
    }

    if (relationTypeId) {
      const formatted = formatRelationType(relationTypeId);
      return formatted ? [formatted] : [];
    }

    const typesFromData = (sectionData as any[])?.map((item) => item?.__relationType).filter(Boolean);
    if (!typesFromData?.length) {
      return [];
    }

    const unique = Array.from(new Set(typesFromData));
    return unique
      .map((type) => formatRelationType(type) || type)
      .filter(Boolean) as string[];
  }, [isRelationBased, relationTypeId, sectionData]);

  const relationInfo: RelationInfo = useMemo(
    () => ({ directions: relationDirections, relationTypeTexts }),
    [relationDirections, relationTypeTexts]
  );

  const refresh = useCallback(async () => {
    if (isRelationBased) {
      await fetchRelations();
    }
  }, [fetchRelations, isRelationBased]);

  return {
    isRelationBased,
    section,
    sectionData,
    fieldsToDisplay,
    targetSchemaData,
    isLoadingRelations,
    isLoadingTargetSchema,
    relationInfo,
    refresh,
  };
}


